import { database } from '../../Firebase/main';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameOver',
    });
    this.parseWinners = this.parseWinners.bind(this);
    this.gameId = null;
    this.winners = [];
  }

  init(data) {
    this.gameId = data.gameId;
  }

  preload() {
    database
      .ref(`games/${this.gameId}/winners`)
      .once('value', this.parseWinners);
  }

  parseWinners(data) {
    if (data) {
      this.winners = Object.values(data).sort(
        (pos1, pos2) => pos1.place - pos2.place
      );
    }
  }
}
