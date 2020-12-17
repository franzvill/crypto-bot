const Historical = require('../historical');
const { Factory } = require('../strategy');
const colors = require('colors/safe');

class Runner {

    constructor({ start, end, interval, product, strategyType, strategyConfig }) {

        this.startTime = new Date(start);
        this.endTime = new Date(end);
        this.interval = interval;
        this.product = product;
        this.strategyType = strategyType;
        this.strategyConfig = strategyConfig;
        this.historical = new Historical({ start, end, interval, product });

        this.strategy = Factory.create(strategyType, ({
            onBuySignal: x => this.onBuySignal(x),
            onSellSignal: x => this.onSellSignal(x)
        }))
    }

    printPositions() {
        const positions = this.strategy.getPositions();
        positions.forEach(p => p.print());
    }

    getProfit() {
        const positions = this.strategy.getPositions();
        return positions.reduce((r, p) => {
            return r + p.profit()
        }, 0);
    }

    printProfit() {
        const total = this.getProfit();
        const colored = total > 0 ? colors.green(total) : colors.red(total);
        console.log('Total: ' + colored);
    }
}

module.exports = Runner;