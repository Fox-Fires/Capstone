import Phaser from 'phaser';
const userRadius = 15; // pixels

export const makePlayers = (scene, data) => {
  for (let key in data) {
    if (key !== scene.playerNumber) {
      createBall(scene, data[key].x, data[key].y, 15);
    }
  }
};

export const createBall = (scene, x, y, r) => {
  const color = new Phaser.Display.Color();
  color.random();
  color.brighten(50).saturate(100);

  const ball = scene.add.graphics();
  ball.fillStyle(color.color, 1);
  ball.fillCircle(x, y, r);

  return ball;
};

export const createBox = (scene, x, y, w, h) => {
  const color = new Phaser.Display.Color();
  color.random();
  color.brighten(50).saturate(100);

  const box = scene.add.graphics();
  box.fillStyle(color.color, 1);
  // box.fillRect(-w / 2, -h / 2, w, h);
  box.fillRect(x, y, w, h);

  return box;
};

export const updatePlayerPositions = (data) => {
  // remove players no longer in the game
  Object.keys(this.others).forEach((userId) => {
    if (!data[userId]) {
      this.others[userId].destroy();
      delete this.others[userId];
    }
  });

  // update other players
  Object.keys(data).forEach((userId) => {
    console.log(this.me);

    // update existin player's position
    if (this.others[userId] && userId !== this.userId) {
      const incomingData = data[userId];
      const player = this.others[userId];
      player.x = incomingData.x;
      player.y = incomingData.y;
      player.rotation = incomingData.bodyAngle;

      // add new players
    } else if (!this.others[userId] && userId !== this.userId) {
      const newPlayerData = data[userId];
      const newPlayer = createBall(
        this,
        newPlayerData.x,
        newPlayerData.y,
        userRadius
      );
      this.others[userId] = newPlayer;

      // update my position
    } else if ((userId = this.userId)) {
      const myData = data[userId];
      console.log('here?');
      if (!this.me) {
        this.me = createBall(this, myData.x, myData.y, userRadius);
      } else {
        this.me.x = myData.x;
        this.me.y = myData.y;
        this.me.rotation = myData.bodyAngle;
      }
    }
  });
};
