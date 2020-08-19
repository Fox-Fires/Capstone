const { Children } = require("react");

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyC9CS5RnuZBn_aTD0uayQoDXwZDyM_nXuU",
  authDomain: "capstonegolf-67769.firebaseapp.com",
  databaseURL: "https://capstonegolf-67769.firebaseio.com",
  projectId: "capstonegolf-67769",
  storageBucket: "capstonegolf-67769.appspot.com",
  messagingSenderId: "459683519058",
  appId: "1:459683519058:web:f8c93b8cfb98b971e4dd8b",
  measurementId: "G-2H80DTSPCY",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get the elements
const preObj = document.getElementById("game");
// create the refrences
const dbrefobj = firebase.dabase().ref().child("game");
// sync the object changes
dbrefobj.on("value", (snap) => console.log(snap.val()));
