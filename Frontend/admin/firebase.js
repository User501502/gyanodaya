// frontend/admin/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔐 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBY0KLm2zl6vgCK0Uf8C9UlX8r5CSyiXNs",
  authDomain: "gyanodayaschool-c1024.firebaseapp.com",
  projectId: "gyanodayaschool-c1024"
};

/* 🔥 INIT */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* 🌍 EXPORTS */
export {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
