// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-_FRf56SNxiKdgTQyHYLdEHiICL_EbXQ",
  authDomain: "smart-canteen-9951a.firebaseapp.com",
  projectId: "smart-canteen-9951a",
  storageBucket: "smart-canteen-9951a.appspot.com", // Corrected the storage bucket URL
  messagingSenderId: "15321307378",
  appId: "1:15321307378:web:bd4feb43058ba94b59586b",
  measurementId: "G-RNGPQ7MGCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
const analytics = getAnalytics(app);

export default app;