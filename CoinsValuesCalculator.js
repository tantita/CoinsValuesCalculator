var app = new Vue({
    el: "#app",

    props: {
        apiUrl: {
            type: String,
            default: "https://api.coinmarketcap.com/v1/ticker/?limit=100&convert=EUR"
        }
    },

    data() {
        return {
            search: '',
            total: 0,
            pagination: { sortBy: 'rank', rowsPerPage: 100, ascending: true },
            headers: [
                {
                    text: "Rank",
                    value: "rank"
                },
                {
                    text: "Symbol",
                    value: "symbol"
                },
                {
                    text: "Name",
                    value: "name"
                },
                {
                    text: "Amount",
                    value: "amount"
                },
                {
                    text: "Value",
                    value: "value"
                },                
                {
                    text: "Market Cap",
                    value: "market_cap_usd"
                },
                {
                    text: "Price (USD)",
                    value: "price_usd"
                },
                {
                    text: "Price (EUR)",
                    value: "price_eur"
                },
                {
                    text: "Price (BTC)",
                    value: "price_btc"
                },
                {
                    text: "Total Supply",
                    value: "total_supply"
                },
                {
                    text: "% Change (1h)",
                    value: "percent_change_1h"
                },
                {
                    text: "% Change (24h)",
                    value: "percent_change_24h"
                },
                {
                    text: "% Change (7d)",
                    value: "percent_change_7d"
                }
            ],
            items: []
        };
    },
    methods: {
        getCoins(api) {
            api = this.apiUrl;
            console.log('before sending the request to coin', new Date())
            axios
                .get(api)
                .then(response => {
                    console.log('response received - ' + response.data.length, new Date())
                    this.items = this.addMyCoins(response.data);
                    this.items.forEach(elem => elem['convName'] = elem['name'].replace(/ /g, "-"));
                    console.log('response processed', new Date())
                })
                .catch(error => {
                    console.log(error);
                    this.items = [];
                });
        },
        addMyCoins(arr) {
            var myCoins = returnMyCoins();
            myCoins.forEach(elem => {
                console.log('Analyzing ticker - ' + elem.symbol);
                var found = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].symbol === elem.symbol) {
                        arr[i].amount = (arr[i].amount || 0) + elem.amount;
                        var val = elem.amount * arr[i].price_usd; 
                        arr[i].value = (arr[i].value || 0) + val;
                        this.total += val;
                        found = true;
                        break;                       
                    }
                }
                if (!found) {
                    alert('The currency is not found - ' + elem.symbol);
                }
            });
            return arr;
        }
    },
    mounted() {
        this.getCoins();
    }
});
