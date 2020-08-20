firebase.initializeApp(firebaseConfig);

const db = firebase.database();

db.ref("game/").set({
  name: "  ",
  current_position: "  ",
});
const nameVal = obj;
db.ref("name").set({
  name: "",
});
