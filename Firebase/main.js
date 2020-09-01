import * as firebase from 'firebase/app';
import 'firebase/database';
import config from './firebaseConfig';

firebase.initializeApp(config);

// Get a reference to the database service
export const database = firebase.database();
