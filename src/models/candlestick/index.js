class Candlestick {

    constructor({
        low, high, close, open, interval, startTime = new Date(), volume, price
    }) {
        this.startTime = startTime;
        this.low = low || price;
        this.high = high || price;
        this.close = close || price;
        this.open = open || price;
        this.interval = interval;
        this.volume = volume || 1e-5;
        this.state = close ? 'closed' : 'open';
    }

    average() {
        return (this.close + this.high + this.low) / 3;
    }

    onPrice({ price, volume, time = new Date() }) {
        if (this.state === 'closed') {
            throw new Error('Trying to add to closed candlestick')
        }

        this.volume = this.volume + volume;
        if (this.high < price) this.high = price;
        if (this.low > price) this.low = price;
        this.close = price;

        const delta = (time.getTime() - this.startTime.getTime()) * 1e-3;
        if (delta >= this.interval) this.state = 'closed';
    }

}


module.exports = Candlestick;