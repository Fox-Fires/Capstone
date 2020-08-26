import config from './firebaseConfig';
firebase.initializeApp(config);

// Get a reference to the database service
const database = firebase.database();

export { database };
