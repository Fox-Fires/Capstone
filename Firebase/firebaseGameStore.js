const db = firebase.database();

const game = document.getElementById("game");

export default class FirebaseDB {
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
    const playerPosition = firebase.database().ref();
    playerPosition.on("playerPositionX", "playPositionY", function (snapshot) {
      changePosition(snapshot.val());
    });
  }
  changePosition(game) {}
}
