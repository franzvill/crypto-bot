const Trade = require('../models/trade');
const Position = require('../models/position');

class Strategy {

    constructor({ onBuySignal, onSellSignal }) {
        this.onBuySignal = onBuySignal;
        this.onSellSignal = onSellSignal;
        this.positions = {};
    }

    async run({ sticks, time, strategyConfig }) { }

    openPositions() {
        return this.getPositions().filter(x => x.state === 'open');
    }

    getPositions() {
        return Object.keys(this.positions).map(k => this.positions[k]);
    }

    async positionOpened({ price, time, size, id }) {
        const trade = new Trade({ price, time, size });
        const position = new Position({ trade, id });
        this.positions[id] = position;
    }

    async positionClosed({ price, time, size, id }) {
        const trade = new Trade({ price, time, size });
        const position = this.positions[id];

        if (position) {
            position.close({ trade });
        }
    }
}

module.exports = Strategy;