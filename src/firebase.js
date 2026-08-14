// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvJLolEj39VYUrCWJmjrdK5XoOJ0fGMJw",
  authDomain: "ku-study-hub-25b40.firebaseapp.com",
  projectId: "ku-study-hub-25b40",
  storageBucket: "ku-study-hub-25b40.firebasestorage.app",
  messagingSenderId: "115339586827",
  appId: "1:115339586827:web:4cf14fc1b2e8274e27060e",
  measurementId: "G-WSMY6RE8TH"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);