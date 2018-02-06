var app = new Vue({
  el: "#app",

  data() {
    return {
      timerValue: '',
      responseReceived: false,
      myShare: 0,
      totalCmcUSD: 0, //CoinMarketCap
      totalCmcEUR: 0, //CoinMarketCap
      totalCmcBTC: 0, //CoinMarketCap
      totalCcUSD: 0, //CryptoCompare
      totalCcEUR: 0, //CryptoCompare
      totalCcBTC: 0, //CryptoCompare
      totalMarketCap: 0, //global coinmarketcap data
      total24hVolume: 0, //global coinmarketcap data
      totalBTCDominance: 0, //global coinmarketcap data
      cmcGeneratedDate: '',
      ccGeneratedDate: '',
      search: 'my',
      authenticated: false, //check if user is authenticated by FB
      pagination: { sortBy: 'rank', rowsPerPage: 250, descending: false },
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
        },
        {
          text: "My",
          value: "my",
          class: "hidden-sm-and-down hidden-sm-and-up"
        }
      ],
      items: []
    };
  },
  methods: {
    calculateMyShare() {
      if ((this.totalCmcUSD > 0) && (this.totalMarketCap > 0)) {
        this.myShare = this.totalCmcUSD / this.totalMarketCap;
      }
    },

    adjustForCc(sym) {
      var obj = {
        MIOTA: 'IOTA',
        BCC: 'BCCOIN'
      }
      if (obj.hasOwnProperty(sym)) {
        return obj[sym];
      } else {
        return sym;
      }
    },

    getCoinMarketCapGlobal() {
      axios
        .get(this.coinMarketCapGlobalUrl)
        .then(response => {
          console.log(response.data);
          this.totalMarketCap = response.data.total_market_cap_usd;
          this.total24hVolume = response.data.total_24h_volume_usd;
          this.totalBTCDominance = response.data.bitcoin_percentage_of_market_cap;
          this.calculateMyShare();
        })
        .catch(error => console.log(error))
    },

    getCryptoCompareCoins() {
      axios
        .get(this.cryptoCompareUrl, {
          params: {
            'fsyms': this.myCoins.map(elem => this.adjustForCc(elem.symbol)).join(','),
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
            var symbol = this.adjustForCc(elem.symbol);
            if (response.data.hasOwnProperty(symbol)) {
              this.totalCcUSD += response.data[symbol]['USD'] * elem.amount;
              this.totalCcEUR += response.data[symbol]['EUR'] * elem.amount;
              this.totalCcBTC += response.data[symbol]['BTC'] * elem.amount;
            } else {
              alert('(CC)The coin is not found - ' + symbol);
            }
          });
        })
        .catch(error => console.log(error))
    },

    getCoinMarketCapCoins() {
      axios
        .get(this.coinMarketCapUrl)
        .then(response => {
          this.cmcGeneratedDate = new Date().toLocaleString(navigator.userLanguage || navigator.language);
          this.cmcTimestamp = new Date().getTime();
          this.items = this.addMyCoins(response.data);
          this.items.forEach(elem => {
            if (elem.valueUSD) {
              elem.percentage = elem.valueUSD / this.totalCmcUSD; //calculate percent
              elem.my = 'my';
            }
          });
          this.calculateMyShare();
          clearInterval(this.timerId);
          this.responseReceived = true;
          document.title = `(${this.totalCmcUSD.toLocaleString("en", { style: "currency", currency: "USD" })})How much do my coins cost?`;
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
        this.timerValue = `${hours}h:${'00'.substring(0, 2 - ('' + minutes).length) + minutes}m:${'00'.substring(0, 2 - ('' + seconds).length) + seconds}s`;
      }, 1000);
    },

    addMyCoins(arr) {
      this.myCoins.forEach(elem => {
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
          alert('(CMC)The coin is not found - ' + elem.symbol);
        }
      });
      return arr;
    },

    saveToFireBase(src, timestamp, date, valUSD, valEUR, valBTC, share) {
      //console.log(arguments)
      var userId = firebase.auth().currentUser.uid;
      var obj = {
        date: date,
        btc: valBTC,
        eur: valEUR,
        usd: valUSD
      };
      if (typeof share !== "undefined") {
        obj.share = share;
      }
      firebase.database().ref(`/${userId}/balance/${src}/${timestamp}`).set(obj);
    }
  },
  mounted() {

    //console.log(this.$vuetify.breakpoint);

    this.coinMarketCapUrl = 'https://api.coinmarketcap.com/v1/ticker/?limit=250&convert=EUR';
    this.coinMarketCapGlobalUrl = 'https://api.coinmarketcap.com/v1/global/';
    this.cryptoCompareUrl = 'https://min-api.cryptocompare.com/data/pricemulti';

    var credentials = getFbCredentials();
    if (!firebase.auth().currentUser) {
      console.log('authentication IS required');
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
        this.authenticated = true;
        this.myCoins = [];
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref(`/${userId}/myCoins`).once('value').then((snapshot) => {
          var obj = Object.assign({}, snapshot.val());
          for (var key in obj) {
            var sum = obj[key].reduce((total, elem) => total + elem.balance || 0, 0);
            this.myCoins.push({ symbol: key, amount: sum })
          }
          this.getCoinMarketCapCoins();
          this.getCryptoCompareCoins();
          this.getCoinMarketCapGlobal();
        });
      }
    });

  }
});
