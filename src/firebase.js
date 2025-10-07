import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJzFaux4rtjQUmnN5oOLW5J2vVh1RV4MOB",
  authDomain: "venky-bill.firebaseapp.com",
  projectId: "venky-bill",
  storageBucket: "venky-bill.firebasestorage.app",
  messagingSenderId: "1043808811613",
  appId: "1:1043808811613:web:8290a78bbc45ce5c6cebb4",
  measurementId: "G-Q1TXHW24KH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);