// const phaser = require('phaser')

exports.Game = class Game extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    });
    this.destroy = this.destroy.bind(this);
  }
  destroy(body) {
    this.world.destroyBody(body);
  }
  create() {
    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 30 pixels = 1 meter.
    this.worldScale = 30;

    // this is how we create a Box2D world
    this.world = planck.World({});

    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: 'ball',
    };

    const railFixDef = {
      friction: 0.1,
      restitution: 0.09,
      isSensor: true,
      userData: 'rail',
    };

    // TODO: change rail to hole
    this.world.on('post-solve', (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const destroy = this.world.destroyBody;
      const rail =
        (fixtureA.getUserData() === railFixDef.userData &&
          fixtureA.getBody()) ||
        (fixtureB.getUserData() === railFixDef.userData && fixtureB.getBody());
      const ball =
        (fixtureA.getUserData() === ballFixDef.userData &&
          fixtureA.getBody()) ||
        (fixtureB.getUserData() === ballFixDef.userData && fixtureB.getBody());
      // console.log("ball, rail", ball, rail);
      setTimeout(function () {
        if (ball && rail) {
          // TODO: add logic for winning
        }
      }, 1);
    });
    // createBox is a method I wrote to create a box, see how it works at line 55
    const floorSensor = this.createBox(800 / 2, 600 - 20, 800, 40, false, true);
    const floor = this.createBox(800 / 2, 600 - 20, 800, 40, false, false);
    const wallTop = this.createBox(800 / 2, 20, 800, 40, false, false);
    const wallLeft = this.createBox(20, 600 / 2, 40, 600, false, false);
    const wallRight = this.createBox(800 - 20, 600 / 2, 40, 600, false, false);
  }
  createBall(posX, posY, radius) {
    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: 'ball',
    };

    const ballBodyDef = {
      linearDamping: 1.5,
      angularDamping: 1,
    };

    let circle = this.world.createDynamicBody(ballBodyDef);
    circle.createFixture(planck.Circle(radius / this.worldScale), ballFixDef);
    circle.setPosition(
      planck.Vec2(posX / this.worldScale, posY / this.worldScale)
    );
    circle.setMassData({
      mass: 1,
      center: planck.Vec2(),
      I: 0,
    });

    return circle;
  }

  createBox(posX, posY, width, height, isDynamic, sensor) {
    // this is how we create a generic Box2D body
    let box = this.world.createBody();
    if (isDynamic) {
      // Box2D bodies born as static bodies, but we can make them dynamic
      box.setDynamic();
    }
    const railFixDef = {
      friction: 0.1,
      restitution: 0.09,
      isSensor: sensor,
      userData: 'rail',
    };
    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    box.createFixture(
      planck.Box(width / 2 / this.worldScale, height / 2 / this.worldScale),
      railFixDef
    );

    // now we place the body in the world
    box.setPosition(
      planck.Vec2(posX / this.worldScale, posY / this.worldScale)
    );

    // time to set mass information
    box.setMassData({
      mass: 1,
      center: planck.Vec2(),
      I: 1,
    });

    return box;
  }

  update() {
    // advance the simulation by 1/20 seconds
    this.world.step(1 / 60);

    // crearForces  method should be added at the end on each step
    this.world.clearForces();
  }
};
