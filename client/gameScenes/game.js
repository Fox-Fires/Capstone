import planck from 'planck-js';
import { database } from '../../Firebase/main';
import axios from 'axios';

import { createBall, createBox, createHole } from './helpers';

const userRadius = 15;

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: 'Game',
    });
    this.me = null;
    this.clicked = false;
    this.line1;
    this.graphics;
    this.pointer;
    // this.graphics = this.add.graphics({
    //   fillStyle: { color: 0xff0000 },
    // });
    // firebase.initializeApp(firebaseConfig);
    this.previousX = 0;
    this.previousY = 0;
    this.userId = null;
    this.gameId = null;
    this.allPlayers = {};
    this.updatePlayerPositions = this.updatePlayerPositions.bind(this);
    this.others = {};
  }

  preload() {
    // try {
    this.load.image('Gerg', './assets/Gerg.png');
    const loadedData = JSON.parse(localStorage.getItem('User-form'));
    const apiRoute =
      'http://localhost:5001/capstonegolf-67769/us-central1/api/game';

    const { data } = axios
      .post(apiRoute, {
        userName: loadedData.name,
      })
      .then(({ data }) => {
        this.userId = data.userId;
        this.gameId = data.gameId;
        return database
          .ref(`games/${this.gameId}/users/${this.userId}`)
          .once('value', (snapshot) => {
            const myData = snapshot.val();
            console.log('What is my data?', myData);
            this.me.x = myData.x;
            this.me.y = myData.y;
          });
      })
      .then(() => {
        return database
          .ref(`games/${this.gameId}/users/${this.userId}`)
          .onDisconnect()
          .set({});
      })
      .then(() => {
        console.log(`getting ready to bind to game ${this.gameId}`);
        // const f = updatePlayerPositions.bind(this);
        return database
          .ref(`games/${this.gameId}/users`)
          .on('value', (snapshot) => {
            this.updatePlayerPositions(snapshot.val());
          });
      })
      .then(() => {
        console.log('Done loading');
      })
      .catch(console.error);
  }

  updatePlayerPositions(data) {
    // remove players no longer in the game
    console.log(this.others);
    Object.keys(this.others).forEach((userId) => {
      if (!data[userId]) {
        this.others[userId].destroy();
        delete this.others[userId];
      }
    });

    // update other players
    Object.keys(data).forEach((userId) => {
      // update existin player's position
      if (this.others[userId] && userId !== this.userId) {
        const incomingData = data[userId];
        const player = this.others[userId];
        player.x = incomingData.x;
        player.y = incomingData.y;
        player.rotation = incomingData.bodyAngle;

        // add new players
      } else if (!this.others[userId] && userId !== this.userId) {
        const newPlayerData = data[userId];
        console.log('new player data', newPlayerData);
        const newPlayer = createBall(
          this,
          newPlayerData.x,
          newPlayerData.y,
          userRadius
        );
        this.others[userId] = newPlayer;

        // update my position
      } else if (userId === this.userId) {
        const myData = data[userId];
        this.me.x = myData.x;
        this.me.y = myData.y;
        this.me.rotation = myData.bodyAngle;
      }
    });
  }

  create() {
    this.worldScale = 30;
    createBox(this, 0, 0, 800, 40); // top
    createBox(this, 0, 560, 800, 40); // bottom
    createBox(this, 0, 0, 40, 600); // left
    createBox(this, 760, 0, 40, 600); // right
    createHole(this, 300, 300, 15); //The hole

    // load me
    this.me = createBall(this, 0, 0, userRadius);

    // add listener for new data

    //Pointer graphic
    this.graphics = this.add.graphics({
      fillStyle: { color: 0xff0000 },
    });
    this.input.on(
      'pointerdown',
      function (pointer) {
        let difx = 400 - pointer.x;
        let dify = 300 - pointer.y;

        // console.log("down, pointer, ball", pointer, this.me.m_userData);
        if (Math.hypot(difx, dify) <= 15 * this.cameras.main.zoom) {
          this.clicked = true;
          // console.log("me xy", this.me.m_userData.x, this.me.m_userData.y);
          // console.log("point xy", pointer.x, pointer.y);
          this.line1 = new Phaser.Geom.Line(
            this.me.x,
            this.me.y,
            this.me.x - difx / this.cameras.main.zoom,
            this.me.y - dify / this.cameras.main.zoom
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
      'pointermove',
      function (pointer) {
        if (this.clicked) {
          this.pointer = { x: pointer.x, y: pointer.y };
          // console.log(" while clicked pointer", this.pointer);
        }
      },
      this
    );
    this.input.on(
      'pointerup',
      function (pointer) {
        let difx = 400 - pointer.x;
        let dify = 300 - pointer.y;
        if (this.clicked) {
          // this.me.applyLinearImpulse(
          //   planck.Vec2(difx / 2, dify / 2),
          //   planck.Vec2(this.me.x, this.me.y),
          //   true
          // );
          axios.put(
            `http://localhost:5001/capstonegolf-67769/us-central1/api/${this.userId}`,
            { x: difx / 2, y: dify / 2 }
          );
        }
        this.clicked = false;
      },
      this
    );

    // camera
    // breaking over here
    this.cameras.main.startFollow(this.me);
    this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY) {
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

  update() {
    // advance the simulation by 1/60 seconds
    // this.world.step(1 / 60);

    // crearForces  method should be added at the end on each step
    // this.world.clearForces();

    // iterate through all bodies
    // for (let b = this.world.getBodyList(); b; b = b.getNext()) {
    //   // get body position
    //   let bodyPosition = b.getPosition();

    //   // get body angle, in radians
    //   let bodyAngle = b.getAngle();

    //   // get body user data, the graphics object
    //   let userData = b.getUserData();

    //   // adjust graphic object position and rotation
    //   userData.x = bodyPosition.x * this.worldScale;
    //   userData.y = bodyPosition.y * this.worldScale;
    //   userData.rotation = bodyAngle;
    // }

    //Graphics for dotted line indicator
    this.graphics.clear();
    if (this.clicked) {
      if (this.pointer) {
        let difx = 400 - this.pointer.x;
        let dify = 300 - this.pointer.y;
        this.line1.setTo(
          this.me.x,
          this.me.y,
          this.me.x - difx / this.cameras.main.zoom,
          this.me.y - dify / this.cameras.main.zoom
        );
      }
      const points = this.line1.getPoints(10);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        this.graphics.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
    }
    if (
      Math.round(this.me.x) != this.previousX ||
      Math.round(this.me.y) != this.previousY
    ) {
      this.previousX = Math.round(this.me.x);
      this.previousY = Math.round(this.me.y);
    }
  }
}
