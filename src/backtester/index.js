const randomstring = require('randomstring');
const Runner = require('../runner');

class Backtester extends Runner {

    async start() {
        try {
            const history = await this.historical.getData();

            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1);
                return this.strategy.run({
                    sticks, time: stick.startTime, strategyConfig: this.strategyConfig
                })
            }))

            this.printPositions();
            this.printProfit();

            return this.getProfit();

        } catch (e) {
            console.log(e);
        }
    }

    async onBuySignal({ price, time }) {
        const id = randomstring.generate(20);
        this.strategy.positionOpened({ price, time, size: 100, id });
    }

    async onSellSignal({ price, size, time, position }) {
        this.strategy.positionClosed({ price, time, size, id: position.id });
    }

}

module.exports = Backtester;