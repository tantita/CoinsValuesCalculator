var app = new Vue({
  el: "#app",

  data() {
    return {
      showModal: false,
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
    	Vue.set(this.object, this.newSymbol, [
        {
          balance: 0.0,
          exchange: ''
        }
      ]);
    },
    addBalance(key) {
      console.log('a new balance should be created for - ' + key);
      this.object[key].push({balance: 0.0, exchange: '' , invested: 0.0});
    },
    deleteCoin(symbol) {
      console.log('deleting the key - ' + symbol);
      Vue.delete (this.object, symbol);
    },
    deleteBalance(index) {
      console.log(arguments);
      //todo
    },
    readFromFirebase() { //TEMP function
      console.log('read from firebase');
      this.authFB();

      firebase.auth().onAuthStateChanged((user) => {
        if (user) { // User is signed in.
          console.log('in on auth changed');
          var userId = firebase.auth().currentUser.uid;
          return firebase.database().ref(`/${userId}/myCoins`).once('value').then((snapshot) => {
            var obj = Object.assign({}, snapshot.val());
            console.log(obj);
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
          //todo: don't should UI until not loaded
          this.loaded = true;
        });
      }
    });
  }
});
