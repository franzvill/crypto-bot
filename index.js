const Backtester = require('./src/backtester');
const Trader = require('./src/trader');
const config = require('./src/config');

const main = async () => {
    if (config.type === 'trader') {
        const trader = new Trader(config);
        await trader.start();
    } else {
        let strategyConfig = {
            shortPeriod: 5,
            longPeriod: 18,
            signalPeriod: 9,
            boundary: 0.00001,
            priceThreshold: 1.05
        };
        const profit = await testConfiguration(strategyConfig);
        console.log(profit);
    }
}

async function testConfiguration(strategyConfig) {
    config.strategyConfig = strategyConfig;
    const backtester = new Backtester(config);
    return await backtester.start();
}

main();