const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Physics } = require('./physics');
const cors = require('cors');
const { barriers } = require('./constants');

// admin.initializeApp();

const express = require('express');
const app = express();

let game = undefined;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorlds = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

//Helps avoid cors mismatch between client and server.
app.use(cors({ origin: true }));

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

app.post('/game', async (req, res) => {
  if (!game) {
    game = new Physics();
    game.loadLevel(barriers.test);
    game.startGame();
  }
  const newUser = await game.addUser(200, 200, req.body.userName);
  const userId = newUser.getUserData().id;
  const gameId = game.gameId;
  res.json({ userId, gameId });
});

app.delete('/game', (req, res) => {
  const { userId, gameId } = req.body;
  game.removeUser(userId);
  res.sendStatus(200);
});

app.put('/:userId', (req, res) => {
  const userId = req.params.userId;
  const { x, y } = req.body;

  if (game) {
    game.puttUser2(userId, x, y);
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

exports.putt = functions.https.onCall((data, context) => {
  // extract data
  const { userId, x, y } = data;
  // putt ball
  game.puttUser2(userId, x, y);
});

exports.api = functions.https.onRequest(app);
