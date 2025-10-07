// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ Firestore import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJzfaux4rtjqUmNS0olW5J2vHh1RV4MO8",
  authDomain: "venky-bill.firebaseapp.com",
  projectId: "venky-bill",
  storageBucket: "venky-bill.firebasestorage.app",
  messagingSenderId: "1043808811613",
  appId: "1:1043808811613:web:8290a78bbc45ce5c6cebb4",
  measurementId: "G-Q1TXHW24KH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore database
export const db = getFirestore(app);
