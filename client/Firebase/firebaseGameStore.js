// import app from "firebase/app";
// import "firebase/auth";
// import "firebase/database";
// import firebaseConfig from "./firebaseConfig";
// // import "firebase/firestore";

const game = document.getElementById("game");

export default class FirebaseDB {
  constructor() {
    // app.initializeApp(firebaseConfig);
    this.db = app.database();
  }
  makeGame(game) {
    db.ref(game).set({
      gameid: game.id,
      players: [game.players],
    });
  }
  makePlayers(game) {
    db.ref.push({
      // maybe need set?
      playerPositionX: game.players, // need to map maybe
      playerPositionY: game.players,
    });
  }
  updatePlayers(game) {
    const playerPosition = firebase.database().ref("game").child(this.player);
    playerPosition.on("x", "y", function (snapshot) {
      changePosition(snapshot.val());
    });
  }
  changePosition(game) {}
}

export function updateUser(ball) {
  db.ref("game").set(ball.x, ball.y);
}
const thisPlayerRef = firebase.database().ref(`testGame/${this.playerNumber}`);
thisPlayerRef.onDisconnect().set({});
const playersRef = firebase.database().ref("testGame/");
playersRef.on("value", (snapshot) => {
  this.updatePlayerPositions(snapshot.val());
});
