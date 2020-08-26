const planck = require('planck-js');
const {
  ballFixtureDef,
  ballBodyDef,
  railFixtureDef,
  radius,
  worldScale,
  dt,
} = require('./constants');
const { db } = require('./admin');

class Game extends planck.World {
  constructor(config) {
    super(config || {});
    this.shouldWriteData = true;
    this.users = {};
    this.timer = null;
    // this.gameId = admin.database().ref('games').push().key;
    this.update = this.update.bind(this);
    this.write = this.write.bind(this);
  }

  startGame() {
    this.timer = setInterval(this.update, dt);
  }

  endGame() {
    clearInterval(this.timer);
  }

  addUser(id) {
    const user = this.createDynamicBody(ballBodyDef);
    user.createFixture(planck.Circle(radius / worldScale), ballFixtureDef);
    user.setPosition(planck.Vec2(600 / worldScale, 190 / worldScale));
    user.setMassData({
      mass: 1,
      center: planck.Vec2(),
      I: 0,
    });
    user.setUserData({
      type: 'user',
      id,
    });
    this.users[id] = user;

    user.applyLinearImpulse(planck.Vec2(-300, 0), user.getUserData(), true);

    return user;
  }

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
    console.log(user.getPosition());
    db.ref('games/testGame/users/testUser').set({
      x: user.getPosition().x,
      y: user.getPosition().y,
    });
  }

  update() {
    this.step();
    this.clearForces();
    if (this.shouldWriteData) {
      this.write();
      this.shouldWriteData = false;
    } else {
      this.shouldWriteData = true;
    }
  }
}

exports.Game = Game;
