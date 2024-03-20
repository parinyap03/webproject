import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbRAbnHG487LrPU-noFe2qeKDgSfQfvrw",
  authDomain: "webproject-25d5d.firebaseapp.com",
  projectId: "webproject-25d5d",
  storageBucket: "webproject-25d5d.appspot.com",
  messagingSenderId: "940584762206",
  appId: "1:940584762206:web:eb568adfe4658b4edaadcf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };