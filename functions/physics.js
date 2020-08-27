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
    this.shouldWriteData = true;
    this.users = {};
    this.timer = null;
    this.gameId = db.ref('games').push().key;
    this.update = this.update.bind(this);
    // this.write = this.write.bind(this);

    db.ref(`games/${this.gameId}`).onDisconnect().set({});
  }

  startGame() {
    // update physics engine 60 time per second
    this.timer = setInterval(this.update, dt);
  }

  endGame() {
    // stop updating physics engine
    if (this.timer) clearInterval(this.timer);

    // remove any users still in the game
    Object.keys(this.users).forEach((userId) =>
      this.removeUser(this.users[userId])
    );

    // delete reference to game in db
    db.ref(`games/${this.gameId}`).set({});
  }

  addUser(x, y, userName) {
    // make new user in DB
    const id = db.ref(`games/${this.gameId}/users`).push().key;
    db.ref(`games/${this.gameId}/users/${id}`).set({
      x,
      y,
      bodyAngle: 0,
    });

    // add user to physics
    const user = this.createDynamicBody(ballBodyDef);
    user.createFixture(planck.Circle(userRadius / worldScale), ballFixtureDef);
    user.setPosition(planck.Vec2(x / worldScale, y / worldScale));
    user.setMassData(ballMassData);
    user.setUserData({
      type: 'user',
      userName,
      id,
      prevX: x,
      prevY: y,
    });

    // make prev x
    // user.prevX = x;
    // user.prevY = y;

    // add user to object for quick access
    this.users[id] = user;
    return user;
  }

  removeUser(user) {
    // remove user form engine
    this.destroyBody(user);

    // remove user from this.users
    const userId = user.getUserData().id;
    delete this.users[userId];

    // remove user reference in db
    db.ref(`games/${this.gameId}/users/${userId}`).set({});
  }

  addBarrier(x, y, w, h) {
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

    barrier.setUserData({
      type: 'barrier',
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
    const userData = user.getUserData();
    const userId = userData.id;
    const bodyAngle = user.getAngle();
    const prevX = userData.prevX;
    const prevY = userData.prevY;

    if (pos.x !== prevX || pos.y !== prevY) {
      db.ref(`games/${gameId}/users/${userId}`).set({
        x: pos.x,
        y: pos.y,
        bodyAngle: bodyAngle,
      });
      user.setUserData({
        ...user.getUserData(),
        prevX: pos.x,
        prevY: pos.y,
      });
    }
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
