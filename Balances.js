var app = new Vue({
  el: "#app",

  data() {
    return {
      object: {},
      loaded: false
    };
  },
  methods: {
    saveToFireBase() {
      var userId = firebase.auth().currentUser.uid;
      firebase.database().ref(`/${userId}/myCoins`).set(this.object);
    },
    addCoin() {
    	Vue.set(this.object, '<<Enter ticker>>', [
        {
          balance: 0.2,
          exchange: 'hitbtc'
        }
      ]);
    }
  },
  mounted() {
    var credentials = getFbCredentials();
    if (!firebase.auth().currentUser) {
      console.log('authentication required');
      firebase.auth().signInWithEmailAndPassword(credentials[0], credentials[1]).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('FireBase authentication error', errorCode, errorMessage);
      });
    }

    firebase.auth().onAuthStateChanged((user) => {
      if (user) { // User is signed in.
        console.log('in on auth changed');
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref(`/${userId}/myCoins`).once('value').then((snapshot) => {
          this.object = Object.assign(this.object, snapshot.val());
          //todo: don't should UI until not loaded
          this.loaded = true;
        });
      }
    });
  }
});
