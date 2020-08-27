const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Game } = require('./physics');
const planck = require('planck-js');

// admin.initializeApp();

const express = require('express');
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorlds = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

app.get('/player', (req, res) => {
  admin
    .firestore()
    .collection('Player')
    .get()
    .then((data) => {
      let test = [];
      data.forEach((doc) => {
        test.push({
          playerId: doc.id,
          x: doc.data().x,
          y: doc.data().y,
        });
      });
      return res.json(test);
    })
    .catch((err) => console.error(err));
});

app.post('/player', (req, res) => {
  const newPlayer = {
    x: req.body.x,
    y: req.body.y,
  };
  admin
    .firestore()
    .collection('Player')
    .add(newPlayer)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);
