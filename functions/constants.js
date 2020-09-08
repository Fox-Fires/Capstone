const Vec2 = require("planck-js").Vec2;

exports.worldScale = 30; // pixels/meter

exports.ballBodyDef = {
  linearDamping: 1.5,
  angularDamping: 1,
  awake: true,
};

exports.ballFixtureDef = {
  friction: 0.1,
  restitution: 0.9,
  density: 1,
  userData: "ball",
};

exports.ballMassData = {
  mass: 1,
  center: Vec2(),
  I: 1,
};

exports.userRadius = 15;

exports.railFixtureDef = {
  friction: 0.1,
  restitution: 0.09,
  userData: "rail",
};

exports.bHoleDef = {
  isSensor: true,
  userData: "hole",
};

exports.bHoleMassData = {
  mass: 1,
  center: Vec2(),
  I: 1,
};

exports.railMassData = {
  mass: 1,
  center: Vec2(),
  I: 1,
};

exports.dt = 1000 / 60;

/**************
 *** Levels ***
 **************/

const test = [
  { x: 400, y: 580, w: 800, h: 40 },
  { x: 400, y: 20, w: 800, h: 40 }, // 800 / 2, 20, 800, 40
  { x: 20, y: 300, w: 40, h: 600 }, //20, 600 / 2, 40, 600
  { x: 780, y: 300, w: 40, h: 600 }, // 800 - 20, 600 / 2, 40, 600
];

const level1 = [
  { x: 400, y: 580, w: 800, h: 40 }, // bottom
  { x: 20, y: 0, w: 40, h: 1200 }, // left
  { x: 780, y: 0, w: 40, h: 1200 }, // right
];

const vid = [
  { x: 600, y: 540, w: 1200, h: 40 }, // Bottom
  { x: 600, y: 20, w: 1200, h: 40 }, // Top
  { x: 20, y: 260, w: 40, h: 520 }, // Left
  { x: 1180, y: 260, w: 40, h: 520 }, // Right
];

exports.barriers = {
  test,
  level1,
  vid,
};

// in the form of [x,y]
exports.holeCoordinate = [900, 260];
