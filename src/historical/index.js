const gdax = require('gdax');
const _ = require('lodash');
const Candlestick = require('../models/candlestick');

class Historical {

    constructor({ start, end, interval, product }) {
        this.client = new gdax.PublicClient();
        this.start = new Date(start);
        this.end = new Date(end);
        this.interval = interval;
        this.product = product;
    }

    async getData() {
        const step = this.interval * 300000;
        const queries = _.range(this.start.getTime(), this.end.getTime(), step);

        const results = await queries.reduce(async (lastPromise, _start) => {
            const accum = await lastPromise;
            const response = await this.client.getProductHistoricRates(this.product,
                { start: new Date(_start), end: new Date(_start + step), granularity: this.interval });
            return [...accum, response]
        }, Promise.resolve([]));

        return results.flat().map(x => new Candlestick({
            startTime: new Date(x[0] * 1e3),
            low: x[1],
            high: x[2],
            open: x[3],
            close: x[4],
            interval: this.interval,
            volume: x[5]
        }))
    }
}

module.exports = Historical;