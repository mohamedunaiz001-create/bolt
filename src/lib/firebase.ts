import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

// Firebase Web SDK configuration is supplied through Vite environment variables.
// These values are safe to expose to the browser; Firebase Security Rules and
// Authentication settings are what protect the backend resources.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig: Array<[string, string | undefined]> = [
  ["VITE_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["VITE_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["VITE_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["VITE_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["VITE_FIREBASE_APP_ID", firebaseConfig.appId],
];

const missingFirebaseConfig = requiredFirebaseConfig
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingFirebaseConfig.length > 0) {
  throw new Error(
    `Missing Firebase web configuration: ${missingFirebaseConfig.join(", ")}. ` +
      "Add these variables to your local .env or Vercel Environment Variables."
  );
}

// Initialize Firebase App singleton.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth.
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize the default Firestore database.
export const db = getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
};

export type { FirebaseUser };
