const {
  STORAGE_BUCKET,
  MESS_SEND_ID,
  APP_ID,
  MEAS_ID,
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
} = require("../secrets");

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  databaseURL: DATABASE_URL,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESS_SEND_ID,
  appId: APP_ID,
  measurementId: MEAS_ID,
};

// Initialize Firebase
export default firebaseConfig;
