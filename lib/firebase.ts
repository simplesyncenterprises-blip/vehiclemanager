import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCndeY2BmNI1wqvLdx-kyklmkiZmheG9dg",
  authDomain: "bikefirebase-c5803.firebaseapp.com",
  projectId: "bikefirebase-c5803",
  storageBucket: "bikefirebase-c5803.firebasestorage.app",
  messagingSenderId: "630634332539",
  appId: "1:630634332539:web:e3a3bda1f1c57ca7e97dde",
  measurementId: "G-FXF5HP8K6G",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
