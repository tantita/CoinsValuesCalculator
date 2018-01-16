var app = new Vue({
  el: "#app",

  data() {
    return {
      timerValue: '',
      responseReceived: false,
      totalCmcUSD: 0, //CoinMarketCap
      totalCmcEUR: 0, //CoinMarketCap
      totalCmcBTC: 0, //CoinMarketCap
      totalCcUSD: 0, //CryptoCompare
      totalCcEUR: 0, //CryptoCompare
      totalCcBTC: 0, //CryptoCompare
      cmcGeneratedDate: '',
	  ccGeneratedDate: '',
      search: '',
      authenticated: false, //check if user is authenticated by FB
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
    getCryptoCompareCoins() {
      console.log(this.myCoins);

      axios
        .get(this.cryptoCompareUrl, {
          params: {
            'fsyms': this.myCoins.map(elem => elem.symbol === 'MIOTA' ? 'IOTA' : elem.symbol).join(','), //MIOTA is IOTA on CryptoCompare
            'tsyms': 'USD,EUR,BTC'
          }
        })
        .then(response => {
          console.log(response.data);
          this.totalCcUSD = 0;
          this.totalCcEUR = 0;
          this.totalCcBTC = 0;
		  this.ccTimestamp = new Date().getTime();
          this.ccGeneratedDate = new Date().toLocaleString(navigator.userLanguage || navigator.language);		  
          this.myCoins.forEach(elem => {
            console.log('Analyzing ticker - ' + elem.symbol);
            var symbol = elem.symbol === 'MIOTA' ? 'IOTA' : elem.symbol; //IOTA is MIOTA on CoinMarketCap.com
            if (response.data.hasOwnProperty(symbol)) {
              console.log(response.data[symbol]);
              this.totalCcUSD += response.data[symbol]['USD'] * elem.amount;
              this.totalCcEUR += response.data[symbol]['EUR'] * elem.amount;
              this.totalCcBTC += response.data[symbol]['BTC'] * elem.amount;
            } else {
              alert('The currency is not found - ' + symbol);
            }
          });
        })
        .catch(error => console.log(error))
    },

    getCoinMarketCapCoins() {
      console.log('before sending the request to coinmarketcap', new Date())
      axios
        .get(this.coinMarketCapUrl)
        .then(response => {
          console.log('response received - ' + response.data.length, new Date())
          this.cmcGeneratedDate = new Date().toLocaleString(navigator.userLanguage || navigator.language);
          this.cmcTimestamp = new Date().getTime();
          this.items = this.addMyCoins(response.data);
          this.items.forEach(elem => {
            //elem.convName = elem['name'].replace(/ /g, "-"); //create the name to be used in link
            if (elem.valueUSD) {
              elem.percentage = elem.valueUSD / this.totalCmcUSD; //calculate percent
            }
          });
          clearInterval(this.timerId);
          this.responseReceived = true;
          document.title = `(${this.totalCmcUSD.toLocaleString("en", { style: "currency", currency: "USD" })})How much do my coins cost?`;
          console.log('response processed', new Date())
        })
        .catch(error => {
          console.log('inside catch...');
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
        this.timerValue = `${hours}h:${'00'.substring(0, 2 - ('' + minutes).length) + minutes}m:${'00'.substring(0, 2 - ('' + seconds).length) + seconds}s`;
      }, 1000);
    },

    addMyCoins(arr) {
      this.myCoins.forEach(elem => {
        //console.log('Analyzing ticker - ' + elem.symbol);
        var found = false;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].symbol === elem.symbol) {
            arr[i].amount = (arr[i].amount || 0) + elem.amount;
            var valUSD = elem.amount * arr[i].price_usd;
            arr[i].valueUSD = (arr[i].valueUSD || 0) + valUSD;
            this.totalCmcUSD += valUSD;
            this.totalCmcEUR += elem.amount * arr[i].price_eur;
            this.totalCmcBTC += elem.amount * arr[i].price_btc;
            found = true;
            break;
          }
        }
        if (!found) {
          alert('The currency is not found - ' + elem.symbol);
        }
      });
      return arr;
    },

    saveToFireBase(src, timestamp, date, valUSD, valEUR, valBTC) {
      console.log(arguments)
      var userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`/${userId}/balance/${src}/${timestamp}`).set({
        date: date,
        btc: valBTC,
        eur: valEUR,
        usd: valUSD
      });
    }
  },
  mounted() {

    //console.log(this.$vuetify.breakpoint);

    this.coinMarketCapUrl = 'https://api.coinmarketcap.com/v1/ticker/?limit=100&convert=EUR';
    this.cryptoCompareUrl = 'https://min-api.cryptocompare.com/data/pricemulti';
    this.myCoins = returnMyCoins();
    this.getCoinMarketCapCoins();
    this.getCryptoCompareCoins();

    if (typeof getFbCredentials === 'function') { //check if we have a function with credentials
      var credentials = getFbCredentials();
      if (!firebase.auth().currentUser) {
        console.log('authentication required');
        firebase.auth().signInWithEmailAndPassword(credentials[0], credentials[1]).catch(function (error) {
          //firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('FireBase authentication error', errorCode, errorMessage);
        });
      } else {
        console.log('authentication IS NOT required');
        this.authenticated = true;
      }

      firebase.auth().onAuthStateChanged((user) => {
        if (user) { // User is signed in.
          console.log('in on auth changed');
          this.authenticated = true;
        }
      });
    }
  }
});
