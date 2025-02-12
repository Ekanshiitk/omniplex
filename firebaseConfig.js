import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyAxwDtjm1IikmHjR0m5YnjfRrFSJSrXvac",
  authDomain: "omniplex-d18aa.firebaseapp.com",
  projectId: "omniplex-d18aa",
  storageBucket: "omniplex-d18aa.firebasestorage.app",
  messagingSenderId: "920370301318",
  appId: "1:920370301318:web:a21a8786b9bf4870118407",
  measurementId: "G-4872MF2ZR4"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const initializeFirebase = () => {
  return app;
};

export default app;