export const worldScale = 30; // pixels/meter

export const ballFixtureDef = {
  friction: 0.1,
  restitution: 0.9,
  density: 1,
  userData: 'ball',
};

export const ballBodyDef = {
  linearDamping: 1.5,
  angularDamping: 1,
};

export const userRadius = 15;

export const railFixtureDef = {
  friction: 0.1,
  restitution: 0.09,
  userData: 'rail',
};

export const dt = 1000 / 60;

/**************
 *** Levels ***
 **************/

const test = [
  { x: 400, y: 580, w: 800, h: 40 },
  { x: 400, y: 20, w: 800, h: 40 }, // 800 / 2, 20, 800, 40
  { x: 20, y: 300, w: 40, h: 600 }, //20, 600 / 2, 40, 600
  { x: 780, y: 300, w: 40, h: 600 }, // 800 - 20, 600 / 2, 40, 600
];

export const barriers = {
  test,
};
