const planck = require('planck-js');
const {
  ballBodyDef,
  ballFixtureDef,
  ballMassData,
  railFixtureDef,
  userRadius,
  worldScale,
  dt,
} = require('./constants');
const { db } = require('./admin');

// class Game {
class Game extends planck.World {
  constructor(config) {
    super(config || {});
    // this.world = planck.World(planck.Vec2(0, 50));
    this.shouldWriteData = true;
    this.users = {};
    this.timer = null;
    // this.gameId = admin.database().ref('games').push().key;
    // this.update = this.update.bind(this);
    // this.write = this.write.bind(this);
    // this.step = this.step.bind(this);
  }

  startGame() {
    this.timer = setInterval(this.update, dt);
  }

  endGame() {
    clearInterval(this.timer);
  }

  addUser(id) {
    const user = this.createDynamicBody(ballBodyDef);
    user.createFixture(planck.Circle(userRadius / worldScale), ballFixtureDef);
    user.setPosition(planck.Vec2(600 / worldScale, 190 / worldScale));
    user.setMassData(ballMassData);
    user.setUserData({
      type: 'user',
      id,
    });
    this.users[id] = user;
    return user;
  }

  removeUser(id) {}

  addBarier({ x, y, w, h }) {
    const barrier = this.createBody();
    barrier.createFixture(
      planck.Box(w / 2 / worldScale, h / 2 / worldScale),
      railFixtureDef
    );
    barrier.setPosition(planck.Vec2(x / worldScale, y / worldScale));
    barrier.setMassData({
      mass: 1,
      center: planck.Vec2(),
      I: 1,
    });
    return barrier;
  }

  write() {
    // const data = {};
    for (let b = this.getBodyList(); b; b = b.getNext()) {
      if (b.getUserData().type === 'user') {
        this.writeUser(b);
      }
    }
  }

  writeUser(user) {
    db.ref('games/testGame/users/testUser').set({
      x: user.getPosition().x,
      y: user.getPosition().y,
    });
  }

  update() {
    // this.step();
    this.step(dt / 1000);
    this.clearForces();
    // if (this.shouldWriteData) {
    //   this.write();
    //   this.shouldWriteData = false;
    // } else {
    //   this.shouldWriteData = true;
    // }
  }
}

exports.Game = Game;
