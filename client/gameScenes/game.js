import planck from "planck-js";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
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

    // world gravity, as a Vec2 object. It's just a x, y vector
    let gravity = planck.Vec2(0, 30);

    // this is how we create a Box2D world
    this.world = planck.World(gravity);

    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: "ball",
    };
    const railFixDef = {
      friction: 0.1,
      restitution: 0.09,
      isSensor: true,
      userData: "rail",
    };

    this.world.on("post-solve", (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      // if (fixtureB) {
      //   alert("You won!!!");
      // }
      const destroy = this.world.destroyBody;
      const rail =
        (fixtureA.getUserData() === railFixDef.userData &&
          fixtureA.getBody()) ||
        (fixtureB.getUserData() === railFixDef.userData && fixtureB.getBody());
      const ball =
        (fixtureA.getUserData() === ballFixDef.userData &&
          fixtureA.getBody()) ||
        (fixtureB.getUserData() === ballFixDef.userData && fixtureB.getBody());
      console.log("ball, rail", ball, rail);
      setTimeout(function () {
        if (ball && rail) {
          console.log(this.world);
          destroy(ball);
          console.log("destroy");
        }
      }, 1);

      // setTimeout(function () {
      //   if (fixtureB) {
      //     alert("You won!!!");
      //     this.world.destroyBody(ball);
      //   }
      // }, 1);
    });
    // createBox is a method I wrote to create a box, see how it works at line 55
    const floorSensor = this.createBox(800 / 2, 600 - 20, 800, 40, false, true);
    const floor = this.createBox(800 / 2, 600 - 20, 800, 40, false, false);
    // const ball2 = this.createBall(400, 100, 15);
    const ball = this.createBall(400, 250, 15);
    // ball.applyForce(planck.Vec2(0, 400), planck.Vec2(0, 0));
    const ball1 = this.createBall(200, 10, 15);
    // const ball3 = this.createBall(600, 190, 15);
  }
  createBall(posX, posY, radius) {
    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: "ball",
    };
    const ballBodyDef = {
      linearDamping: 0.15,
      angularDamping: 1,
    };

    let circle = this.world.createDynamicBody(ballBodyDef);
    // circle.setDynamic();
    circle.createFixture(planck.Circle(radius / this.worldScale), ballFixDef);
    circle.setPosition(
      planck.Vec2(posX / this.worldScale, posY / this.worldScale)
    );
    circle.setMassData({
      mass: 1,
      center: planck.Vec2(),

      // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
      I: 0,
    });
    var color = new Phaser.Display.Color();
    color.random();
    color.brighten(50).saturate(100);
    let userData = this.add.graphics();
    userData.fillStyle(color.color, 1);
    userData.fillCircle(0, 0, radius);

    // a body can have anything in its user data, normally it's used to store its sprite
    circle.setUserData(userData);
  }
  // here we go with some Box2D stuff
  // arguments: x, y coordinates of the center, with and height of the box, in pixels
  // we'll conver pixels to meters inside the method
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
      userData: "rail",
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

      // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
      I: 1,
    });

    // now we create a graphics object representing the body
    var color = new Phaser.Display.Color();
    color.random();
    color.brighten(50).saturate(100);
    let userData = this.add.graphics();
    userData.fillStyle(color.color, 1);
    userData.fillRect(-width / 2, -height / 2, width, height);

    // a body can have anything in its user data, normally it's used to store its sprite
    box.setUserData(userData);
  }

  update() {
    // advance the simulation by 1/20 seconds
    this.world.step(1 / 60);

    // crearForces  method should be added at the end on each step
    this.world.clearForces();

    // iterate through all bodies
    for (let b = this.world.getBodyList(); b; b = b.getNext()) {
      // get body position
      let bodyPosition = b.getPosition();

      // get body angle, in radians
      let bodyAngle = b.getAngle();

      // get body user data, the graphics object
      let userData = b.getUserData();

      // adjust graphic object position and rotation
      userData.x = bodyPosition.x * this.worldScale;
      userData.y = bodyPosition.y * this.worldScale;
      userData.rotation = bodyAngle;
    }
  }
}
