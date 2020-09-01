const planck = require('planck-js');
const {
  bHoleDef,
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

// convenient lil func
const round = (dec) => {
  return parseFloat(dec.toFixed(2));
};

// class Physics {
class Physics extends planck.World {
  constructor(config) {
    super(config || {});
    this.shouldWriteData = true;
    this.users = {};
    this.barriers = [];
    this.hole = null;
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

  async addUser(x, y, userName) {
    // make new user in DB
    const id = db.ref(`games/${this.gameId}/users`).push().key;
    await db.ref(`games/${this.gameId}/users/${id}`).set({
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
    const user = this.users[userId];
    this.destroyBody(user);

    // remove user from this.users
    delete this.users[userId];

    // remove user reference in db
    db.ref(`games/${this.gameId}/users/${userId}`).set({});
  }

  loadLevel(barriers) {
    // clear all barriers
    this.clearLevel();

    // add in new barriers
    barriers.forEach(({ x, y, w, h }) => {
      this.addBarrier(x, y, w, h);
    });
  }

  clearLevel() {
    // remove barriers from physics engine
    this.barriers.forEach((barrier) => {
      this.destroyBody(barrier);
    });

    // clear list of barriers
    this.barriers = [];
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

    // add barrier to collection
    this.barriers.push(barrier);

    return barrier;
  }

  //Add hole ie: the goal
  addHole(x,y){
    const hole = this.createBody()
    hole.createFixture(
      planck.Circle(30/worldScale),
      bHoleDef
    );
    hole.setPosition(planck.Vec2(x / worldScale, y / worldScale))
    //set user data
    hole.setUserData({
      type: 'hole',
    })
    this.hole = hole;
    return hole
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
    const pos = user.getPosition();
    const gameId = this.gameId;
    const userData = user.getUserData();
    const userId = userData.id;
    const bodyAngle = user.getAngle();
    const prevX = userData.prevX;
    const prevY = userData.prevY;
    const prevAng = userData.prevAng;

    // check for move from client
    this.puttUser(userId);

    // only update if user has moved since last update
    if (
      round(pos.x) !== prevX ||
      round(pos.y) !== prevY ||
      round(bodyAngle) !== prevAng
    ) {
      db.ref(`games/${gameId}/users/${userId}`).set({
        x: round(pos.x) * worldScale,
        y: round(pos.y) * worldScale,
        bodyAngle: round(bodyAngle),
      });

      // update prev x and y
      user.setUserData({
        ...userData,
        prevX: round(pos.x),
        prevY: round(pos.y),
        prevAng: round(bodyAngle),
      });
    }
  }

  puttUser(userId) {
    const user = this.users[userId];
    const pos = user.getPosition();

    // Look for move on user, and apply move
    db.ref(`games/${this.gameId}/users/${userId}/move`).once(
      'value',
      (snapshot) => {
        const userMove = snapshot.val();

        // check if there's a move waiting to be applied
        if (userMove && userMove.waiting === false) {
          console.log(
            'sending move:',
            userMove.vec2x,
            userMove.vec2y,
            'to:',
            pos.x * worldScale,
            pos.y * worldScale
          );

          // apply it
          user.applyLinearImpulse(
            planck.Vec2(userMove.vec2x, userMove.vec2y),
            planck.Vec2(pos.x * worldScale, pos.y * worldScale),
            true
          );

          // clear move in db
          db.ref(`games/${this.gameId}/users/${userId}/move`).set(
            { what: 'the', waiting: true },
            function (error) {
              if (error) {
              } else {
                console.log('Applied Move');
              }
            }
          );
        }
      }
    );
    // if (userMove.waiting === 'false') {
    //   console.log(
    //     'where is this logging to?:',
    //     userMove.waiting,
    //     userMove.vec2x,
    //     userMove.vec2y
    //   );
    //   userMove.set({ waiting: true });
    // }
  }

  puttUser2(userId, x, y) {
    const user = this.users[userId];
    const pos = user.getPosition();

    if (user) {
      console.log('impulse applied to', user.getUserData().userName);
      user.applyLinearImpulse(
        planck.Vec2(x, y),
        planck.Vec2(pos.x, pos.y).mul(worldScale),
        true
      );
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
