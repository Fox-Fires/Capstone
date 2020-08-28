const planck = require('planck-js');
const {
  ballBodyDef,
  ballFixtureDef,
  ballMassData,
  railFixtureDef,
  railMassData,
  userRadius,
  worldScale,
  dt,
} = require('./constants');
const { db } = require('./admin');

// class Physics {
class Physics extends planck.World {
  constructor(config) {
    super(config || {});
    this.shouldWriteData = true;
    this.users = {};
    this.timer = null;
    this.gameId = db.ref('games').push().key;
    this.update = this.update.bind(this);
    // this.write = this.write.bind(this);

    // delete game instance if server unexpectedly disconnects
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

    // set user data for updating logic
    user.setUserData({
      type: 'user',
      userName,
      id,
      prevX: x,
      prevY: y,
      prevAng: 0,
    });

    // add user to object for quick access
    this.users[id] = user;
    return user;
  }

  removeUser(userId) {
    // remove user form engine
    const user = this.users[userId]
    this.destroyBody(user);

    // remove user from this.users
    delete this.users[userId];

    // remove user reference in db
    db.ref(`games/${this.gameId}/users/${userId}`).set({});
  }

  addBarrier(x, y, w, h) {
    // add barrier to physics world
    const barrier = this.createBody();
    barrier.createFixture(
      planck.Box(w / 2 / worldScale, h / 2 / worldScale),
      railFixtureDef
    );
    barrier.setPosition(planck.Vec2(x / worldScale, y / worldScale));
    barrier.setMassData(railMassData);

    // set user data
    barrier.setUserData({
      type: 'barrier',
    });

    return barrier;
  }

  write() {
    // const data = {};
    // write only users to db
    for (let b = this.getBodyList(); b; b = b.getNext()) {
      if (b.getUserData().type === 'user') {
        this.writeUser(b);
      }
    }
  }

  writeUser(user) {
    // pull out relevant information
    const pos = user.getPosition()
    const gameId = this.gameId;
    const userData = user.getUserData();
    const userId = userData.id;
    const bodyAngle = user.getAngle();
    const prevX = userData.prevX;
    const prevY = userData.prevY;
    const prevAng = userData.prevAng;

    // Check for player move input
    const currentMove = db.ref(`game/${gameId}/users/${userId}/move`)
    // Apply move input
    if(currentMove && !currentMove.waiting){
      user.applyLinearImpulse(
        planck.Vec2(currentMove.x,currentMove.y),
        planck.Vec2(pos.x,pos.y),
        true
      )
    }
    //return input to zero
    db.ref(`game/${gameId}/users/${userId}/move`).set({waiting:true})

    // only update if user has moved since last update
    if (pos.x !== prevX || pos.y !== prevY || bodyAngle !== prevAng) {
      db.ref(`games/${gameId}/users/${userId}`).set({
        x: pos.x*worldScale,
        y: pos.y*worldScale,
        bodyAngle: bodyAngle,
      });

      // update prev x and y
      user.setUserData({
        ...user.getUserData(),
        prevX: pos.x,
        prevY: pos.y,
        prevAng: bodyAngle,
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

exports.Physics = Physics;
