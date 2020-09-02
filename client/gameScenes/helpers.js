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
  ball.fillCircle(0, 0, r);
  ball.x = x;
  ball.y = y;

  return ball;
};

export const createHole = (scene, x, y, r) => {
  const color = new Phaser.Display.Color();
  const hole = scene.add.graphics();
  hole.fillStyle(color.color, 1);
  hole.fillCircle(0, 0, r);
  hole.x = x;
  hole.y = y;

  return hole;
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
