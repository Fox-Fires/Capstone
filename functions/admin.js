const admin = require('firebase-admin');
const serviceAccount = require('../capstonegolf-67769-firebase-adminsdk-4la3k-eb85deef0e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://capstonegolf-67769.firebaseio.com',
});

exports.db = admin.database();
