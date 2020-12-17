require('dotenv').config();
const gdax = require('gdax');

const key = process.env.GDAX_KEY;
const passphrase = process.env.GDAX_PASSPHRASE;
const secret = process.env.GDAX_SECRET;
const url = process.env.GDAX_URL;

class Feed {

    constructor({ product, onUpdate, onError }) {
        this.product = product;
        this.onUpdate = onUpdate;
        this.onError = onError;
        this.running = false;
    }

    start() {
        this.running = true;
        this.socket = new gdax.WebsocketClient(
            [this.product],
            url,
            { key, secret, passphrase },
            { channels: ['user', 'heartbeat'] }
        );

        this.socket.on('message', data => {
            if (data.type === 'heartbeat') return;
            this.onUpdate(data);
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

module.exports = Feed;