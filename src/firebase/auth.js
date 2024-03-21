import { auth } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import Swal from 'sweetalert2';

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (user) {
      await setDoc(doc(db, "students", user.email), {
        displayName: user.displayName,
        id: user.uid,
        section: "",
      });
    }
  } catch (error) {
    console.error("Error creating user: ", error);
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // add user to firestore
  if (
    user.email.endsWith("@kkumail.com") ||
    user.email.endsWith("@gmail.com")
  ) {
    await setDoc(doc(db, "students", user.email), {
      displayName: user.displayName,
      id: user.uid,
      section: "",
    });
  } else if (user.email.endsWith("@kku.ac.th")) {
    await setDoc(doc(db, "teachers", user.email), {
      displayName: user.displayName,
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Not a KKU email or Gmail!',
    });
  }
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};
