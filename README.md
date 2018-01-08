# CoinsValuesCalculator

Calculate the summary value of your coins using the prices returned by [CoinMarketCap.com](https://api.coinmarketcap.com/v1/ticker/?limit=100&convert=EUR). Only 100 first currencies are processed. 

## Create mycoins.js file in the following format

```javascript
function returnMyCoins() {
    return [
        {
            symbol: 'BTC',
            amount: 0.001
        },
        {
            symbol: 'BTC',
            amount: 0.0001
        },
        {
            symbol: 'ETH',
            amount: 1
        },
    ];
}
```
The same symbol could appear several times in the file.

If symbol is not found in the list returned by CoinMarketCap.com, the alert with error message will be displayed.


## Open html-file in browser
Tested in Chromium only, for sure works in latest Chrome/Firefox. 

