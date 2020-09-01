import planck from "planck-js";
import firebase from "firebase/app";
import "firebase/database";
import firebaseConfig from "../../Firebase/firebaseConfig";
import axios from "axios";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
    this.destroy = this.destroy.bind(this);
    this.me = null;
    this.clicked = false;
    this.line1;
    this.graphics;
    this.pointer;
    firebase.initializeApp(firebaseConfig);
    this.previousX = 0;
    this.previousY = 0;
    this.playerNumber = Math.random().toString().split(".")[1];
    this.database = firebase.database();
    this.allPlayers = {};
    this.trackAndRenderPlayers = this.trackAndRenderPlayers.bind(this);
    this.createBall = this.createBall.bind(this);
    this.makePlayers = this.makePlayers.bind(this);
  }
  destroy(body) {
    this.world.destroyBody(body);
  }
  async preload() {
    try {
      this.load.image("Grass5", "./assets/grassets/grass05.png");
      this.load.image("Gerg", "./assets/Gerg.png");
      this.load.image("Fire", "./assets/Fire Nation.png");
      this.load.image("Water", "./assets/Water Tribe.png");
      this.load.image("Earth", "./assets/Earth Kingdom.png");
      this.load.image("Air", "./assets/Air Nomads.png");
      const loadedData = JSON.parse(localStorage.getItem("User-form"));
      const data = await axios.post(
        "http://localhost:5001/capstonegolf-67769/us-central1/api/game",
        { userName: loadedData.name }
      );
      console.log("preload Data:", data);
    } catch (err) {
      console.error(err);
    }
  }
  trackAndRenderPlayers() {
    let user = {};
    const thisPlayerRef = firebase
      .database()
      .ref(`testGame/${this.playerNumber}`);
    thisPlayerRef.onDisconnect().set({});
    const rootRef = firebase.database().ref("testGame");

    const urlRef = rootRef.child("/");
    urlRef.on("value", (snapshot) => {
      user = snapshot.val();
    });
    urlRef.once("value", (snapshot) => {
      this.makePlayers(snapshot.val());

      // console.log(user);
      // for (let key in user) {
      //   if (key !== theNum) {
      //     console.log(user);
      //   }
      // }
    });
  }
  makePlayers(data) {
    for (let key in data) {
      if (key !== this.playerNumber) {
        this.createBall(data[key].x, data[key].y, 15);
      }
    }
  }

  create() {
    this.trackAndRenderPlayers();
    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 30 pixels = 1 meter.
    this.worldScale = 30;
    // this.add.image(0, 0, "Gerg");
    // world gravity, as a Vec2 object. It's just a x, y vector
    let gravity = planck.Vec2(0, 1);
    // this is how we create a Box2D world
    this.world = planck.World({});

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
    let background1 = this.add.image(512 / 2, 512 / 2, "Grass5");
    let background2 = this.add.image(512, 512 / 2, "Grass5");
    let background3 = this.add.image(512 / 2, 512, "Grass5");
    let background4 = this.add.image(512, 512, "Grass5");
    background3.setCrop(0, 0, background3.width, 320);
    background4.setCrop(0, 0, background4.width, 320);

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
      // console.log("ball, rail", ball, rail);
      setTimeout(function () {
        if (ball && rail) {
          // console.log(this.world);
          // destroy(ball);
          // console.log("destroy");
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
    const wallTop = this.createBox(800 / 2, 20, 800, 40, false, false);
    const wallLeft = this.createBox(20, 600 / 2, 40, 600, false, false);
    const wallRight = this.createBox(800 - 20, 600 / 2, 40, 600, false, false);
    // const ball2 = this.createBall(400, 100, 15);
    // const ball = this.createBall(400, 250, 15);
    // ball.applyForce(planck.Vec2(0, 400), planck.Vec2(0, 0));
    const ball1 = this.createBall(200, 60, 15);
    const ball3 = this.createBall(600, 190, 15);
    const gerg = this.createGerg(120, 120, 15);
    this.createBall(615, 190, 15);
    this.me = gerg;
    // console.log(this.me.m_userData);
    // console.log(this.me.m_userData.x);
    // console.log(this.me.m_userData.y);
    // Testing Movements
    this.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.graphics = this.add.graphics({
      fillStyle: { color: 0xff0000 },
    });
    this.input.on(
      "pointerdown",
      function (pointer) {
        let difx = 400 - pointer.x;
        let dify = 300 - pointer.y;

        if (Math.hypot(difx, dify) <= 15 * this.cameras.main.zoom) {
          this.clicked = true;
          // console.log("me xy", this.me.m_userData.x, this.me.m_userData.y);
          // console.log("point xy", pointer.x, pointer.y);
          this.line1 = new Phaser.Geom.Line(
            this.me.m_userData.x,
            this.me.m_userData.y,
            this.me.m_userData.x - difx / this.cameras.main.zoom,
            this.me.m_userData.y - dify / this.cameras.main.zoom
          );
          const points = this.line1.getPoints(10);
          for (let i = 0; i < points.length; i++) {
            const p = points[i];

            this.graphics.fillRect(p.x - 2, p.y - 2, 4, 4);
          }
        }
        // console.log(this.clicked);
      },
      this
    );
    this.input.on(
      "pointermove",
      function (pointer) {
        if (this.clicked) {
          this.pointer = { x: pointer.x, y: pointer.y };
        }
      },
      this
    );
    this.input.on(
      "pointerup",
      function (pointer) {
        let difx = 400 - pointer.x;
        let dify = 300 - pointer.y;
        if (this.clicked) {
          this.me.applyLinearImpulse(
            planck.Vec2(difx / 2, dify / 2),
            planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
            true
          );
        }
        this.clicked = false;
      },
      this
    );
    this.cameras.main.startFollow(this.me.getUserData());
    this.input.on("wheel", function (pointer, gameObjects, deltaX, deltaY) {
      if (this.cameras.main.zoom <= 0.6) {
        if (deltaY < 0) {
          this.cameras.main.zoom -= deltaY * 0.001;
        }
      } else if (this.cameras.main.zoom >= 1.6) {
        if (deltaY > 0) {
          this.cameras.main.zoom -= deltaY * 0.001;
        }
      } else {
        this.cameras.main.zoom -= deltaY * 0.001;
      }
    });
  }

  createBall(posX, posY, radius) {
    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: "ball",
    };
    const ballBodyDef = {
      linearDamping: 1.5,
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
      I: 1,
    });

    const assetArr = ["Water", "Earth", "Fire", "Air"];
    let userData = this.add.image(
      posX,
      posY,
      assetArr[Math.round(Math.random() * assetArr.length)]
    );
    // var color = new Phaser.Display.Color();
    // color.random();
    // color.brighten(50).saturate(100);
    // let userData = this.add.graphics();
    // userData.fillStyle(color.color, 1);
    // userData.fillCircle(0, 0, radius);

    // a body can have anything in its user data, normally it's used to store its sprite
    circle.setUserData(userData);
    return circle;
  }
  createGerg(posX, posY, radius) {
    const ballFixDef = {
      friction: 0.1,
      restitution: 0.9,
      density: 1,
      userData: "ball",
    };
    const ballBodyDef = {
      linearDamping: 1.5,
      angularDamping: 10,
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
      I: 0.1,
    });
    let userData = this.add.image(posX, posY, "Gerg");
    // var color = new Phaser.Display.Color();
    // color.random();
    // color.brighten(50).saturate(100);
    // let userData = this.add.graphics();
    // userData.fillStyle(color.color, 1);
    // userData.fillCircle(0, 0, radius);

    // a body can have anything in its user data, normally it's used to store its sprite
    circle.setUserData(userData);
    return circle;
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

  // updatePlayerPositions() {
  //   this.getPlayers();
  //   console.log("🪀Work:", this.allPlayers);
  //   Object.keys(this.allPlayers).forEach((characterKey) => {
  //     if (this.allPlayers[characterKey] && characterKey != this.playerNumber) {
  //       const incomingData = characterKey;
  //     }
  //   });
  // }

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
    if (this.inputKeys.up.isDown) {
      // this.me.applyForceToCenter(planck.Vec2(0, -60), true);
      // console.log(this.me.m_userData.y);
      this.me.applyLinearImpulse(
        planck.Vec2(0, -5),
        planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
        true
      );
    }
    if (this.inputKeys.left.isDown) {
      // this.me.applyForceToCenter(planck.Vec2(-30, 0), true);
      this.me.applyLinearImpulse(
        planck.Vec2(-5, 0),
        planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
        true
      );
    }
    if (this.inputKeys.right.isDown) {
      // this.me.applyForceToCenter(planck.Vec2(30, 0), true);
      this.me.applyLinearImpulse(
        planck.Vec2(5, 0),
        planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
        true
      );
    }
    if (this.inputKeys.down.isDown) {
      // this.me.applyForceToCenter(planck.Vec2(0, 30), true);
      this.me.applyLinearImpulse(
        planck.Vec2(0, 5),
        planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
        true
      );
      // console.log("hell yea");
    }
    this.graphics.clear();
    if (this.clicked) {
      if (this.pointer) {
        let difx = 400 - this.pointer.x;
        let dify = 300 - this.pointer.y;
        this.line1.setTo(
          this.me.m_userData.x,
          this.me.m_userData.y,
          this.me.m_userData.x - difx / this.cameras.main.zoom,
          this.me.m_userData.y - dify / this.cameras.main.zoom
        );
      }
      const points = this.line1.getPoints(10);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        this.graphics.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
    }
    if (
      Math.round(this.me.m_userData.x) != this.previousX ||
      Math.round(this.me.m_userData.y) != this.previousY
    ) {
      firebase
        .database()
        .ref(`testGame/${this.playerNumber}`)
        .set({
          x: Math.round(this.me.m_userData.x),
          y: Math.round(this.me.m_userData.y),
        });
      this.previousX = Math.round(this.me.m_userData.x);
      this.previousY = Math.round(this.me.m_userData.y);
      // for (let key in this.allPlayers) {
      //   if (key !== theNum) {
      //     console.log("allPlayers", this.allPlayers);
      //   }
      // }
    }
  }
}
