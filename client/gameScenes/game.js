import { database } from "../../Firebase/main";
import axios from "axios";

import {
  createBall,
  createHole,
  createBallSprite,
  createTextButt,
  toggleMenu,
  createBoxes,
  spectateRandom,
} from "./helpers";

const userRadius = 15;

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
    this.me = null;
    this.clicked = false;
    this.line1;
    this.graphics;
    this.pointer;
    this.menu = false;
    this.previousX = 0;
    this.previousY = 0;
    this.userId = null;
    this.gameId = null;
    this.allPlayers = {};
    this.updatePlayerPositions = this.updatePlayerPositions.bind(this);
    this.others = {};
    this.listener = null;
    this.spectating = null;

    this.apiRoute =
      location.hostname === "localhost"
        ? "http://localhost:5001/capstonegolf-67769/us-central1/api"
        : "https://us-central1-capstonegolf-67769.cloudfunctions.net/api";
  }

  preload() {
    // try {
    // Load Ball Sprites
    this.load.image("Gerg", "./assets/Gerg.png");
    this.load.image("Ben", "./assets/Ben's Head.png");
    this.load.image("golf", "./assets/golf_balls.png");
    this.load.image("Water", "./assets/Water Tribe.png");
    this.load.image("Earth", "./assets/Earth Kingdom.png");
    this.load.image("Fire", "./assets/Fire Nation.png");
    this.load.image("Air", "./assets/Air Nomads.png");
    // Load Flag
    this.load.image("Flag", "./assets/Flag.png");
    // Load grass background
    this.load.image("Grass5", "./assets/grassets/grass05.png");
    // Load Audio
    this.load.audio("audio_swing", "./assets/audio/golf-swing.mp3");

    const loadedData = JSON.parse(localStorage.getItem("User-form"));

    const { data } = axios
      .post(`${this.apiRoute}/game`, {
        userName: loadedData.name,
      })
      .then(({ data }) => {
        this.userId = data.userId;
        this.gameId = data.gameId;
        //   return database
        //     .ref(`games/${this.gameId}/users/${this.userId}`)
        //     .on("value", (snapshot) => {
        //       const myData = snapshot.val();
        //       // this.me = createBall(this, myData.x, myData.y, 15);
        //       this.me.x = myData.x;
        //       this.me.y = myData.y;
        //     });
        return database

          .ref(`games/${this.gameId}/users`)
          .on("value", (snapshot) => {
            this.updatePlayerPositions(snapshot.val());
          });
      })
      .then((listener) => {
        this.listener = listener;

        return database
          .ref(`games/${this.gameId}/users/${this.userId}`)
          .onDisconnect()
          .set({});
      })

      .then(() => {
        console.log("Done loading");
      })
      .catch(console.error);
  }

  updatePlayerPositions(data) {
    if (data) {
      // remove players no longer in the game
      Object.keys(this.others).forEach((userId) => {
        if (!data[userId]) {
          this.others[userId].destroy();
          const toDelete = this.others[userId];
          delete this.others[userId];

          if (toDelete === this.spectating) {
            this.spectating = spectateRandom(this);
          }
        }
      });
      //Delete 'me' if no longer in database
      if (this.userId && data && !data[this.userId]) {
        this.me.destroy();
        // this.spectating = true;
        !this.spectating && (this.spectating = spectateRandom(this));
      }

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
          console.log("new player data", newPlayerData);
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
    } else {
      database.ref(`games/${this.gameId}/users`).off("value", this.listener);
      this.scene.start("GameOver", { gameId: this.gameId });
    }
  }

  create() {
    //Initialize sound
    this.ballswing = this.sound.add("audio_swing");
    // Current scene variable
    let currScene = this;

    // Add background
    this.add.image(512 / 2, 512 / 2 + 10, "Grass5");
    this.add.image(512, 512 / 2 + 10, "Grass5");
    this.add.image(512 * 2 - 80, 512 / 2 + 10, "Grass5");

    // createBox(this, 400, 580, 800, 40); // top
    // createBox(this, 400, 20, 800, 40); // bottom
    // createBox(this, 20, 300, 40, 600); // left
    // createBox(this, 780, 300, 40, 600); // right

    // Coordinates for planck barriers
    const test = [
      { x: 400, y: 580, w: 800, h: 40 }, // Bottom
      { x: 400, y: 20, w: 800, h: 40 }, // Top
      { x: 20, y: 300, w: 40, h: 600 }, // Left
      { x: 780, y: 300, w: 40, h: 600 }, // Right
    ];
    const level1 = [
      { x: 400, y: 580, w: 800, h: 40 }, // bottom
      { x: 20, y: 0, w: 40, h: 1200 }, // left
      { x: 780, y: 0, w: 40, h: 1200 }, // right
    ];
    const vid = [
      { x: 600, y: 540, w: 1200, h: 40 }, // Bottom
      { x: 600, y: 20, w: 1200, h: 40 }, // Top
      { x: 20, y: 260, w: 40, h: 520 }, // Left
      { x: 1180, y: 260, w: 40, h: 520 }, // Right
    ];
    // Adds visuals for planck barriers
    createBoxes(this, vid);

    // Add hole visual
    createHole(this, 900, 260, 15); //The hole

    // load me
    this.me = createBallSprite(this, 0, 0, "Ben");

    // Array of Sprites
    // const spriteArr = ["Gerg", "Water", "Earth", "Fire", "Air", "golf"];

    // Init Switch Balls button
    this.switchSprite = createTextButt(this, 20, 20, "Switch Balls");
    // On-Click listener
    this.switchSprite.on("pointerdown", function () {
      toggleMenu(currScene);
    });

    //Pointer graphic
    this.graphics = this.add.graphics({
      fillStyle: { color: 0xff0000 },
    });
    this.input.on(
      "pointerdown",
      function (pointer) {
        let difx = 400 - pointer.x;
        let dify = 300 - pointer.y;

        if (Math.hypot(difx, dify) <= 15 * this.cameras.main.zoom) {
          this.clicked = true && !this.spectating;
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
          axios.put(`${this.apiRoute}/${this.userId}`, {
            x: difx / 2,
            y: dify / 2,
          });

          // Thwack!
          this.ballswing.play();
        }
        this.clicked = false;
      },
      this
    );

    // camera
    this.cameras.main.startFollow(this.me);
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

  update() {
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
    // Set previous coordinates
    // if (
    //   Math.round(this.me.x) != this.previousX ||
    //   Math.round(this.me.y) != this.previousY
    // ) {
    //   this.previousX = Math.round(this.me.x);
    //   this.previousY = Math.round(this.me.y);
    // }
  }
}
