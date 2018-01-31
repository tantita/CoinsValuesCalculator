var app = new Vue({
  el: "#app",

  data() {
    return {
      showModal: false,
      show: {
      },
      newSymbol: '',
      object: {key: [
        {
          balance: 0.0,
          exchange: '',
          invested: 0.0
        }
      ]},
      loaded: false
    };
  },
  methods: {
    saveToFireBase() {
      var userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`/${userId}/myCoins`).set(this.object);
    },
    addCoin() {
      this.showModal = false;
      console.log('a new symbol entered - ' + this.newSymbol);
      if ('' !== this.newSymbol) {
        Vue.set(this.object, this.newSymbol, [
          {
            balance: 0.0,
            exchange: '',
            invested: 0.0
          }
        ]);
        Vue.set(this.show, this.newSymbol, true);
        //scroll to it
        //this.$nextTick(window.scrollTo(0, document.body.scrollHeight));
        setTimeout( () => window.scrollTo(0,document.body.scrollHeight));
      }
    },
    addBalance(key) {
      console.log('a new balance should be created for - ' + key);
      this.object[key].push({balance: 0.0, exchange: '' , invested: 0.0});
      Vue.set(this.show, key, true);
    },
    deleteCoin(symbol) {
      console.log('deleting the key - ' + symbol);
      if (window.confirm('Are you sure you want to delete this coin?')) {
        Vue.delete (this.object, symbol);
      }
    },
    deleteBalance(key, index) {
      console.log(arguments);
      if (window.confirm('Are you sure you want to delete this balance?')) {
        this.object[key].splice(index, 1);
      }
      Vue.set(this.show, key, true);
    },
    readFromFirebase() { //TEMP function
      console.log('read from firebase');
      this.authFB();
      firebase.auth().onAuthStateChanged((user) => {
        if (user) { // User is signed in.
          this.arr = [];
          var userId = firebase.auth().currentUser.uid;
          return firebase.database().ref(`/${userId}/myCoins`).once('value').then((snapshot) => {
            var obj = Object.assign({}, snapshot.val());
            for (var key in obj) {
              var sum = obj[key].reduce((total, elem) => total + elem.balance || 0, 0);
              this.arr.push ({symbol: key, amount : sum })
            }
            console.log(this.arr);
          });
        }
      });
    },
    authFB() {
      if (!firebase.auth().currentUser) {
        console.log('authentication required');
        firebase.auth().signInWithEmailAndPassword(this.credentials[0], this.credentials[1]).catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log('FireBase authentication error', errorCode, errorMessage);
        });
      }
    }
  },
  mounted() {
    this.credentials = getFbCredentials();
    this.authFB();

    firebase.auth().onAuthStateChanged((user) => {
      if (user) { // User is signed in.
        console.log('in on auth changed');
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref(`/${userId}/myCoins`).once('value').then((snapshot) => {
          this.object = Object.assign({}, snapshot.val());
          //todo: don't show until not loaded
          this.loaded = true;
        });
      }
    });
  }
});
