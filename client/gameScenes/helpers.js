import Phaser from "phaser";
import { barriers } from "../../functions/constants";
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

// init a ball with sprite
export const createBallSprite = (scene, x, y, sprite) => {
  const ball = scene.add.image(0, 0, sprite);

  ball.x = x;
  ball.y = y;

  return ball;
};

// Creates a text button
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

// Creates the white menu background
export const createMenuBackground = (scene, x, y, w, h) => {
  const color = new Phaser.Display.Color.ValueToColor("#FFFFFF");

  const box = scene.add.graphics();
  box.fillStyle(color.color, 1);
  box.fillRect(x, y, w, h);
  box.setScrollFactor(0);

  return box;
};

// Creates the ball picker button
export const ballSpritePicker = (scene, x, y, sprite) => {
  const ball = scene.add.image(0, 0, sprite);
  ball.setInteractive();
  ball.setScrollFactor(0);
  ball.on("pointerover", function () {
    ball.setTint(0xffffff, 0xffffff, null, 0xffffff);
  });
  ball.on("pointerout", function () {
    ball.clearTint();
  });
  ball.on("pointerdown", function () {
    scene.me.setTexture(sprite);
  });
  ball.x = x;
  ball.y = y;

  return ball;
};

// Toggle Menu on / off
export const toggleMenu = (currScene) => {
  if (currScene.menu === false) {
    // Create the sprite menu
    currScene.spriteMenu = createMenuBackground(currScene, 20, 45, 100, 255);
    currScene.spriteWater = ballSpritePicker(currScene, 70, 70, "Water");
    currScene.spriteEarth = ballSpritePicker(currScene, 70, 110, "Earth");
    currScene.spriteFire = ballSpritePicker(currScene, 70, 150, "Fire");
    currScene.spriteAir = ballSpritePicker(currScene, 70, 190, "Air");
    currScene.spriteGerg = ballSpritePicker(currScene, 70, 230, "Gerg");
    currScene.spriteGolf = ballSpritePicker(currScene, 70, 270, "golf");
    currScene.menu = true;
  } else {
    // Remove the sprite menu
    currScene.spriteMenu.destroy();
    currScene.spriteWater.destroy();
    currScene.spriteEarth.destroy();
    currScene.spriteFire.destroy();
    currScene.spriteAir.destroy();
    currScene.spriteGerg.destroy();
    currScene.spriteGolf.destroy();
    currScene.menu = false;
  }
};

export const createHole = (scene, x, y, r) => {
  const color = new Phaser.Display.Color();
  const hole = scene.add.graphics();
  hole.fillStyle(color.color, 1);
  hole.fillCircle(0, 0, r);
  hole.x = x;
  hole.y = y;
  // Add the flag on top
  scene.add.image(x + 25, y - 25, "Flag");
  return hole;
};

export const createBox = (scene, x, y, w, h) => {
  const color = new Phaser.Display.Color();
  color.random();
  color.brighten(50).saturate(100);

  const box = scene.add.graphics();
  box.fillStyle(color.color, 1);
  box.fillRect(-w / 2, -h / 2, w, h);

  box.x = x;
  box.y = y;

  return box;
};

export const createBoxes = (scene, barriers) => {
  barriers.forEach(({ x, y, w, h }) => {
    createBox(scene, x, y, w, h);
  });
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
