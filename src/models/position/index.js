const colors = require('colors/safe');
const moment = require('moment');

class Position {

    constructor({ trade, id }) {
        this.state = 'open';
        this.id = id;
        this.enter = trade;
    }

    close({ trade }) {
        this.state = 'closed';
        this.exit = trade;
    }

    print() {
        const enter = `Enter | ${this.enter.price} | ${moment(this.enter.time).format('DD/MM/YY hh:mm:ss')}`;
        const exit = this.exit ? `Exit | ${this.exit.price} | ${moment(this.exit.time).format('DD/MM/YY hh:mm:ss')}` : '';
        let profitString = '';

        if (this.state === 'closed') {
            const prof = this.profitString();
            const colored = this.profit() > 0 ? colors.green(prof) : colors.red(prof);
            profitString = 'Profit: ' + colored;
        }

        console.log(`${enter} - ${exit} - ${profitString}`);
    }

    profit() {
        const fee = 0.50 * 1e-2;
        //const fee = 0;
        const entrance = this.enter.price * (1 + fee) * this.enter.size;
        if (this.exit) {
            const exit = this.exit.price * (1 - fee) * this.exit.size;
            return exit - entrance;
        } else {
            return 0;
        }
    }

    profitString() {
        return this.profit().toFixed(2);
    }

}

module.exports = Position;