import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBusaNmEHgq_9ALNW8rJK0gNmbg9iXLHgI",
  authDomain: "project-mobile-a1dc0.firebaseapp.com",
  projectId: "project-mobile-a1dc0",
  storageBucket: "project-mobile-a1dc0.appspot.com",
  messagingSenderId: "174871916702",
  appId: "1:174871916702:web:df040f9906c27de7740b8f",
  measurementId: "G-60TE2BJFE1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };