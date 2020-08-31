import planck from 'planck-js';
import { database } from '../../Firebase/main';
import axios from 'axios';

import { createBall, createBox, updatePlayerPositions } from './helpers';

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
  }

  async preload() {
    try {
      this.load.image('Gerg', './assets/Gerg.png');
      const loadedData = JSON.parse(localStorage.getItem('User-form'));
      const { data } = await axios.post(
        'http://localhost:5001/capstonegolf-67769/us-central1/api/game',
        {
          userName: loadedData.name,
        }
      );
      // .then((response) => {
      //   console.log('initial load', response);
      //   return response;
      // });
      console.log('what is the response?', data);
      this.userId = data.userId;
      this.gameId = data.gameId;
      console.log('got IDs?', this.userId, this.gameId);

      database
        .ref(`games/${this.gameId}/users/${this.userId}`)
        .onDisconnect()
        .set({});
    } catch (err) {
      console.error(err);
    }
  }

  async create() {
    this.worldScale = 30;
    createBox(this, 800 / 2, 600 - 20, 800, 40);
    createBox(this, 800 / 2, 20, 800, 40);
    createBox(this, 20, 600 / 2, 40, 600);
    createBox(this, 800 - 20, 600 / 2, 40, 600);

    // load me
    const out = await database
      .ref(`games/${this.gameId}/users/${this.userId}`)
      .once('value', (snapshot) => {
        const myData = snapshot.val();
        console.log('initial data', myData);
        this.me = createBall(this, myData.x, myData.y, 15);
      });

    // add listener for new data
    const f = updatePlayerPositions.bind(this);
    // database.ref(`games/${this.gameId}/users`).on('value', (snapshot) => {
    //   f(snapshot.val());
    // });

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
        if (Math.hypot(difx, dify) <= 15) {
          this.clicked = true;
          // console.log("me xy", this.me.m_userData.x, this.me.m_userData.y);
          // console.log("point xy", pointer.x, pointer.y);
          this.line1 = new Phaser.Geom.Line(
            this.me.m_userData.x,
            this.me.m_userData.y,
            this.me.m_userData.x - difx,
            this.me.m_userData.y - dify
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
          this.me.applyLinearImpulse(
            planck.Vec2(difx / 2, dify / 2),
            planck.Vec2(this.me.m_userData.x, this.me.m_userData.y),
            true
          );
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
    this.cameras.main.startFollow(this.me.getUserData());
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
          this.me.m_userData.x,
          this.me.m_userData.y,
          this.me.m_userData.x - difx,
          this.me.m_userData.y - dify
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
      this.previousX = Math.round(this.me.m_userData.x);
      this.previousY = Math.round(this.me.m_userData.y);
    }
  }
}
