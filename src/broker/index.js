const Feed = require('../feed');
const gdax = require('gdax');
const uuid = require('uuid/v1');

const key = process.env.GDAX_KEY;
const passphrase = process.env.GDAX_PASSPHRASE;
const secret = process.env.GDAX_SECRET;
const apiUri = process.env.GDAX_URL;

class Broker {

    constructor({ isLive, orderType = "market", product }) {
        this.isLive = isLive;
        this.orderType = orderType;
        this.product = product;
        this.feed = new Feed({
            product,
            onUpdate: async data => await this.onUpdate(data),
            onError: error => this.onError(error)
        });
        this.state = 'idle';
        this.tokens = {};
        this.callbacks = {};
        this.orders = {};
        this.client = new gdax.AuthenticatedClient(key, secret, passphrase, apiUri);
    }

    start() {
        this.state = 'running';
        this.feed.start();
    }

    async onUpdate(data) {
        try {
            switch (data.type) {
                case 'received':
                    await this.handleReceived(data);
                    break;
                case 'done':
                    await this.handleDone(data);
                    break;
                case 'match':
                    await this.handleMatch(data);
                    break;
                default: break;
            }
        } catch (error) {
            console.log(error);
        }
    }

    onError(error) {
        console.log(error);
    }

    async handleReceived(data) {
        const clientId = data['client_oid']
        const orderId = data['order_id']
        const side = data['side']
        if (this.tokens[clientId] === side) {
            data.filledPrice = 0
            data.filledSize = 0
            this.orders[orderId] = data
        }
    }

    async handleDone(data) {
        const orderId = data['order_id']
        const side = data['side']
        const time = new Date(data['time'])
        const order = this.orders[orderId]
        if (order) {
            const orderData = {
                time,
                order: order.id,
                size: order.filledSize,
                price: (order.filledPrice / order.filledSize),
                funds: (order.filledSize * order.filledPrice)
            }

            const token = order['client_oid']
            const lock = this.callbacks[token]
            lock(orderData)
        }
    }

    async handleMatch(data) {
        const orderId = data['taker_order_id']
        const price = parseFloat(data['price'])
        const time = new Date(data['time'])
        const amount = parseFloat(data['size'])

        if (this.orders[orderId]) {
            this.orders[orderId].filledPrice += (price * amount)
            this.orders[orderId].filledSize += amount
        }
    }

    async buy({ price, funds }) {
        if (!this.isLive) {
            return { size: funds / price, price: price }
        }

        if (this.state !== 'running') { return null }
        this.state = 'buying'

        const token = uuid()
        this.tokens[token] = 'buy'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }
        const data = this.generateMarketData({ token, funds })
        try {
            const order = await this.client.buy(data)
            if (order.message) {
                this.state = 'running'
                throw new Error(order.message)
            }
            const filled = await lock()
            this.state = 'running'
            return filled
        } catch (error) {
            this.state = 'running'
            throw error
        }
    }

    async sell({ price, size }) {
        if (!this.live) {
            return { funds: price * size, price: price, size }
        }

        if (this.state !== 'running') { return }
        this.state = 'selling'

        const token = uuid()
        this.tokens[token] = 'sell'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }

        try {
            const data = this.generateMarketData({ token, size })
            const order = await this.client.sell(data)
            if (order.message) {
                this.state = 'running'
                throw new Error(order.message)
            }
            const filled = await lock()
            this.state = 'running'
            return filled
        } catch (error) {
            this.state = 'running'
            throw error
        }
    }

    generateMarketData({ token, funds, size }) {
        const order = {
            product_id: this.product,
            type: 'market',
            client_oid: token
        }

        const amount = funds ? { funds } : { size }

        return Object.assign(order, amount)
    }

    generateLimitData({ token, size, price }) {
        const order = {
            product_id: this.product,
            type: 'limit',
            client_oid: token,
            size: size,
            price: price
        }
    }

}

module.exports = Broker;