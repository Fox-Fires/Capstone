import { database } from '../../Firebase/main';

export default class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameOver',
    });
    this.gameId = null;
  }

  init(data) {
    console.log(data);
  }
}
