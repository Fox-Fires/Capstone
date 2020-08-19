const {
  APIKey,
  AuthDomain,
  DBURL,
  PorID,
  STORAGE_BUCKET,
  MESS_SEND_ID,
  APP_ID,
  MEAS_ID,
} = require("./secrets");

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: APIKey,
  authDomain: AuthDomain,
  databaseURL: DBURL,
  projectId: PorID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESS_SEND_ID,
  appId: APP_ID,
  measurementId: MEAS_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get the elements
const preObj = document.getElementById("game");
// create the refrences
const dbrefobj = firebase.dabase().ref().child("game");
// sync the object changes
dbrefobj.on("value", (snap) => console.log(snap.val()));
