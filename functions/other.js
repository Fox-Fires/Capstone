const admin = require('firebase-admin');
const serviceAccount = require('../capstonegolf-67769-firebase-adminsdk-4la3k-eb85deef0e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://capstonegolf-67769.firebaseio.com',
});

class Timer {
  constructor() {
    this.data = 0;
    this.updateTime = this.updateTime.bind(this);
    setInterval(() => {
      this.updateTime(++this.data);
    }, 3000);
  }

  updateTime(time) {
    admin.database().ref('timer').set(time);
  }
}

exports.Timer = Timer;
