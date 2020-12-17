const Strategy = require('./strategy');
const tulind = require('tulind');

const indicator = tulind.indicators.macd.indicator;

class SimpleMACD extends Strategy {

    async run({ sticks, time, strategyConfig }) {
        const prices = sticks.map(stick => stick.average());

        const { shortPeriod, longPeriod, signalPeriod, boundary, priceThreshold } = strategyConfig;

        const results = await indicator([prices], [shortPeriod, longPeriod, signalPeriod]);
        const histogram = results[2];
        const len = histogram.length;

        if (len < 2) return;
        const penu = histogram[len - 2];
        const last = histogram[len - 1];

        const wasAbove = penu > boundary;
        const wasBelow = penu < -boundary;
        const isAbove = last > boundary;
        const isBelow = last < -boundary;

        const openPositions = this.openPositions();
        const price = sticks[sticks.length - 1].close;

        if (openPositions.length === 0) {
            if (wasAbove && isBelow) {
                this.onBuySignal({ price, time });
            }
        } else {
            openPositions.forEach(p => {
                if (isAbove && wasBelow) {
                    if (p.enter.price * priceThreshold < price) {
                        this.onSellSignal({ price, time, size: p.enter.size, position: p });
                    }
                }
            })
        }
    }

}

module.exports = SimpleMACD;