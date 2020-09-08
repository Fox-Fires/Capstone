import { database } from '../../Firebase/main';

// convenient lil func
const round = (dec) => {
  return dec.toFixed(2);
};

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameOver',
    });
    this.parseWinners = this.parseWinners.bind(this);
    this.gameId = null;
    this.nWinners = 5;
    this.winners = [];
    this.listener = null;
    this.parseWinners = this.parseWinners.bind(this);
  }

  init(data) {
    this.gameId = data.gameId;
  }

  create() {
    // initalize empty text objects
    for (let i = 0; i < this.nWinners; i++) {
      this.winners.push(
        this.add
          .text(20, 20 + i * 70, ``)
          .setFontSize(60)
          // .setFontFamily('Trajan')
          .setColor('black')
      );
    }

    // update leaderboard when new winner logged in DB
    this.listener = database
      .ref(`games/${this.gameId}/winners`)
      .on('value', (snapshot) => this.parseWinners(snapshot.val()));
  }

  parseWinners(data) {
    if (data) {
      Object.values(data)
        // sort player by position
        .sort((pos1, pos2) => pos1.time - pos2.time)

        // only keep top n winners
        .slice(0, this.nWinners)

        // put them on the leaderboard
        .forEach((winner, idx) => {
          const name = winner.username.slice(0, 4);
          const padding = Array(name.length <= 4 ? 8 - name.length : 4)
            .fill(' ')
            .join('');
          this.winners[idx].setText(
            `${idx + 1}    ${name}${padding}${round(winner.time * 10 ** -3)}`
          );
        });
    } else {
      // clear leaderboard if db is cleared
      this.winners.forEach((winner) => winner.setText(''));
    }
  }
}
