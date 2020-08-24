const functions = require('firebase-functions');
const { Timer } = require('./other');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const timer = new Timer();

exports.gimmeData = functions.https.onRequest((request, response) => {
  functions.logger.info('Somebody wants data', { structuredData: true });
  response.json(timer.data);
});
