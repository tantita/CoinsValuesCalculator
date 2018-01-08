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
            timerValue: '',
            responseReceived: false,
            totalUSD: 0,
            totalEUR: 0,
            totalBTC: 0,
            generatedDate: '',
            search: '',
            pagination: { sortBy: 'rank', rowsPerPage: 100, descending: false },
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
                    text: "Value (USD)",
                    value: "valueUSD"
                },
                {
                    text: "%",
                    value: "percentage"
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
            console.log('before sending the request to coinmarketcap', new Date())
            axios
                .get(api)
                .then(response => {
                    console.log('response received - ' + response.data.length, new Date())
                    this.items = this.addMyCoins(response.data);
                    clearInterval(this.timerId);
                    /*this.items.forEach(elem => {
						elem.convName = elem['name'].replace(/ /g, "-"); //create the name to be used in link
						if (elem.valueUSD) {
							elem.percentage = elem.valueUSD/this.totalUSD; //calculate percent
						}
                    });*/
                    this.responseReceived = true;
                    document.title = 'How much do my coins cost?';
                    this.generatedDate = new Date().toLocaleString(navigator.userLanguage || navigator.language);
                    console.log('response processed', new Date())
                })
                .catch(error => {
                    console.log(error);
                    this.items = [];
                    clearInterval(this.timerId);
                    this.timerValue = error;
                    document.title = 'Error';
                });
            this.startTimer();
        },

        startTimer() {
            var startTime = new Date();
            this.timerValue = "Starting the timer...";
            this.timerId = setInterval(() => {
                var ms = parseInt(new Date() - startTime);
                var x = ms / 1000;
                var seconds = parseInt(x % 60, 10);
                x /= 60;
                var minutes = parseInt(x % 60, 10);
                x /= 60;
                var hours = parseInt(x % 24, 10);
                this.timerValue =
                    `${hours}h:${'00'.substring(0, 2 - ('' + minutes).length) + minutes}m:${'00'.substring(0, 2 - ('' + seconds).length) + seconds}s`;
            }, 1000);
        },

        addMyCoins(arr) {
            var myCoins = returnMyCoins();
            myCoins.forEach(elem => {
                console.log('Analyzing ticker - ' + elem.symbol);
                var found = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].symbol === elem.symbol) {
                        arr[i].amount = (arr[i].amount || 0) + elem.amount;
                        var valUSD = elem.amount * arr[i].price_usd;
                        arr[i].valueUSD = (arr[i].valueUSD || 0) + valUSD;
                        this.totalUSD += valUSD;
                        arr[i].percentage = arr[i].valueUSD / this.totalUSD; //calculate percent
                        this.totalEUR += elem.amount * arr[i].price_eur;
                        this.totalBTC += elem.amount * arr[i].price_btc;
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
