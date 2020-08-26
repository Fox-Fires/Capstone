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

export class Game extends planck.World {
  constructor(config) {
    super(config || {});
    this.shouldWriteData = true;
    this.users = {};
    // this.gameId = admin.database().ref('games').push().key;
  }

  startGame() {
    setInterval(this.step, dt);
  }

  endGame() {
    clearInterval(this.step);
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
      type: 'player',
      id,
    });
    this.users[id] = user;
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
      db.ref('games/testGame/users/testUser').set({
        x: b.getPosition().x,
        y: b.getPosition().y,
      });
    }
  }

  step() {
    super().step(dt);
    this.clearForces();
    if (this.shouldWriteData) {
      // write to database
      this.shouldWriteData = false;
    } else {
      this.shouldWriteData = true;
    }
  }
}
