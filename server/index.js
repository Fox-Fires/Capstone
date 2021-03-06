const path = require("path");
const express = require("express");
const morgan = require("morgan");
const PORT = process.env.PORT || 1337;
const app = express();
const socketio = require("socket.io");
module.exports = app;

//Testing Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin")
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request,response)=>{
  response.send('hello world')
})

app.use(morgan("dev"));

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  if (path.extname(req.path).length) {
    const err = new Error("Not found");
    err.status = 404;
    next(err);
  } else {
    next();
  }
});

// sends index.html
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

const server = app.listen(PORT, () =>
  console.log(`⛳️Teeing off on port ${PORT} ⛳️`)
);

// set up our socket control center
//  const io = socketio(server)
//  require('./socket')(io)
