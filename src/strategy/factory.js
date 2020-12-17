const SimpleStrategy = require("./simple");
const SimpleMACD = require("./simpleMacd");

exports.create = (strategy, data) => {
    switch (strategy) {
        case 'simple':
            return new SimpleStrategy(data);
        case 'macd':
            return new SimpleMACD(data);
        default:
            return new SimpleStrategy(data);
    }
};