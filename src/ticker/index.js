require('dotenv').config();
const gdax = require('gdax');

const url = process.env.GDAX_URL;

class Ticker {

    constructor({ product, onTick, onError }) {
        this.product = product;
        this.onTick = onTick;
        this.onError = onError;
        this.running = false;
    }

    start() {
        this.running = true;
        this.socket = new gdax.WebsocketClient(
            [this.product],
            url,
            null,
            { channels: ['ticker', 'heartbeat'] }
        );

        this.socket.on('message', async data => {
            if (data.type === 'ticker') {
                await this.onTick(data);
            }
        })

        this.socket.on('error', error => {
            this.onError(error);
            this.socket.connect();
        });

        this.socket.on('close', () => {
            if (this.running) {
                this.socket.connect();
            }
        })
    }

    stop() {
        this.running = false;
        this.socket.close();
    }
}

module.exports = Ticker;