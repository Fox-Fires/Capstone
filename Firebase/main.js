// const db = firebase.database()

const preObject = document.getElementById("object");

const dbRefobject = firebase.database().ref().child("object");

dbRefobject.on("value", (snap) => console.log(snap.val()));
