import Phaser from "phaser";
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
  ball.fillCircle(0, 0, r);
  ball.x = x;
  ball.y = y;

  return ball;
};

export const createBallSprite = (scene, x, y, sprite) => {
  const ball = scene.add.image(0, 0, sprite);

  ball.x = x;
  ball.y = y;

  return ball;
};

export const createTextButt = (scene, x, y, text) => {
  const button = scene.add
    .text(0, 0, text)
    .setFontSize(20)
    .setFontFamily("Trajan")
    .setColor("black")
    .setScrollFactor(0)
    .setInteractive();
  button.on("pointerover", function () {
    button.setColor("white");
  });
  button.on("pointerout", function () {
    button.setColor("black");
  });

  button.x = x;
  button.y = y;

  return button;
};

export const createMenu = (scene, x, y, w, h) => {
  const color = new Phaser.Display.Color.ValueToColor("#FFFFFF");

  const box = scene.add.graphics();
  box.fillStyle(color.color, 1);
  box.fillRect(x, y, w, h);
  box.setScrollFactor(0);

  return box;
};

export const ballSpritePicker = (scene, x, y, sprite) => {
  const ball = scene.add.image(0, 0, sprite);
  ball.setInteractive();
  ball.setScrollFactor(0);
  ball.on("pointerdown", function () {
    scene.me.setTexture(sprite);
  });
  ball.x = x;
  ball.y = y;

  return ball;
};

export const createBox = (scene, x, y, w, h) => {
  const color = new Phaser.Display.Color();
  color.random();
  color.brighten(50).saturate(100);

  const box = scene.add.graphics();
  box.fillStyle(color.color, 1);
  box.fillRect(x, y, w, h);

  return box;
};

export const updatePlayerPositions = (data) => {
  console.log("top of data listener");
  console.log("what is this?", this);

  // remove players no longer in the game
  Object.keys(this.others).forEach((userId) => {
    if (!data[userId]) {
      this.others[userId].destroy();
      delete this.others[userId];
    }
  });

  // update other players
  Object.keys(data).forEach((userId) => {
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
    } else if (userId === this.userId) {
      const myData = data[userId];
      console.log("here?");
      this.me.x = myData.x;
      this.me.y = myData.y;
      this.me.rotation = myData.bodyAngle;
    }
  });
};
