import { database } from '../../Firebase/main';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameOver',
    });
    this.parseWinners = this.parseWinners.bind(this);
    this.gameId = null;
    this.nWinners = 5;
    this.winners = [];

    this.parseWinners = this.parseWinners.bind(this);
  }

  init(data) {
    this.gameId = data.gameId;
  }

  create() {
    // initalize empty text objext
    for (let i = 0; i < this.nWinners; i++) {
      this.winners.push(
        this.add
          .text(20, 20 + i * 90, ``)
          .setFontSize(80)
          .setFontFamily('Trajan')
      );
    }

    // update leaderboard when new winner logged in DB
    database
      .ref(`games/${this.gameId}/winners`)
      .on('value', (snapshot) => this.parseWinners(snapshot.val()));
  }

  parseWinners(data) {
    if (data) {
      Object.values(data)
        // sort player by position
        .sort((pos1, pos2) => pos1.place - pos2.place)

        // only keep top n winners
        .slice(0, this.nWinners)

        // put them on the leaderboard
        .forEach((winner, idx) => {
          this.winners[idx].setText(
            `${idx}    ${winner.username}    ${winner.place}`
          );
        });
    } else {
      // clear leaderboard if db is cleared
      this.winners.forEach((winner) => winner.setText(''));
    }
  }
}
