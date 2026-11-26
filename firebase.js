// Shared Firebase setup for CityRush Client and the game iframe.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  runTransaction
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// Firebase web config is intended to be present in client-side web apps.
// Protect your data with Firestore Security Rules (see firestore.rules).
export const firebaseConfig = {
  apiKey: "AIzaSyCV6O3G2vVb6ohHTyJNWfIh5S8noj9r_vQ",
  authDomain: "cityrushclient.firebaseapp.com",
  projectId: "cityrushclient",
  storageBucket: "cityrushclient.firebasestorage.app",
  messagingSenderId: "381938754272",
  appId: "1:381938754272:web:414332982216b74ce16685",
  measurementId: "G-WHYJ9E343P"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver
});
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, runTransaction };
