const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Physics } = require('./physics');
const cors = require('cors');
const { barriers, holeCoordinate } = require('./constants');

// admin.initializeApp();

const express = require('express');
const app = express();

let game = undefined;

//Helps avoid cors mismatch between client and server.
app.use(cors({ origin: true }));

app.post('/game', async (req, res) => {
  if (!game) {
    game = new Physics();
    game.loadLevel(barriers.test);
    game.addHole(holeCoordinate);
    game.startGame();
  }
  const newUser = await game.addUser(200, 200, req.body.userName);
  const userId = newUser.getUserData().id;
  const gameId = game.gameId;
  res.json({ userId, gameId });
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

// called when all users have completed game
exports.gameOver = functions.database
  .ref('/games/{gameId}/users/')
  .onDelete((snapshot, context) => {
    const { gameId } = context.params;
    console.log(`Game ${gameId} ending in 30 seconds`);
    setTimeout(game.endGame(), 30000);
    return Promise.resolve('deleted');
  });

// called when game is cleared form db
exports.clearGame = functions.database
  .ref('/games/{gameId}')
  .onDelete((snap, context) => {
    const { gameId } = context.params;
    console.log(`Game ${gameId} ended`);
    game = undefined;
    return Promise.resolve('cleared');
  });

exports.api = functions.https.onRequest(app);
