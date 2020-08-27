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
    // super(config || {});
    super(planck.Vec2(0, 30));
    this.shouldWriteData = true;
    this.users = {};
    this.timer = null;
    this.gameId = admin.database().ref('games').push().key;
    this.update = this.update.bind(this);
    // this.write = this.write.bind(this);
  }

  startGame() {
    // update physics engine 60 time per second
    this.timer = setInterval(this.update, dt);
  }

  endGame() {
    // stop updating physics engine
    clearInterval(this.timer);

    // remove any users still in the game
    Object.keys(this.users).forEach((userId) =>
      this.removeUser(this.users[userId])
    );

    // delete reference to game in db
    db.ref(`games/${this.gameId}`).set({});
  }

  addUser(x, y, userName) {
    // make new user in DB
    const id = db.ref(`games/${this.gameId}/users`).push({
      x,
      y,
      bodyAngle: 0,
    }).key;

    // add user to physics
    const user = this.createDynamicBody(ballBodyDef);
    user.createFixture(planck.Circle(userRadius / worldScale), ballFixtureDef);
    user.setPosition(planck.Vec2(x / worldScale, y / worldScale));
    user.setMassData(ballMassData);
    user.setUserData({
      type: 'user',
      userName,
      id,
    });

    // add user to object for quick access
    this.users[id] = user;
    return user;
  }

  removeUser(user) {
    // remove user form engine
    this.destroyBody(user);

    // remove user from this.users
    const userName = user.getUserData().id;
    delete this.users[userId];

    // remove user reference in db
    const userId = user.getUserData().id;
    db.ref(`games/${this.gameId}/users/${userId}`).set({});
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

  putBall(vector, userName) {
    this.users[userName].applyLinearImpulse();
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
    const pos = user.getPosition().mul(worldScale);
    const gameId = this.gameId;
    const userId = user.getUserData().id;
    const bodyAngle = user.getAngle();
    db.ref(`games/${gameId}/users/${userId}`).set({
      x: pos.x,
      y: pos.y,
      bodyAngle: bodyAngle,
    });
  }

  update() {
    // move physics engine forward (units: seconds)
    this.step(dt / 1000);
    this.clearForces();

    // write to database every other update
    if (this.shouldWriteData) {
      this.write();
      this.shouldWriteData = false;
    } else {
      this.shouldWriteData = true;
    }
  }
}

exports.Game = Game;
