import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbp_vZzC8tED6wZDTgvI8AB-TsD1G8vU0",
  authDomain: "caption-dan-hastag.firebaseapp.com",
  projectId: "caption-dan-hastag",
  storageBucket: "caption-dan-hastag.firebasestorage.app",
  messagingSenderId: "888956759856",
  appId: "1:888956759856:web:6473c1a242bf8b675f22f5",
  measurementId: "G-R8YN7R3LX2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
