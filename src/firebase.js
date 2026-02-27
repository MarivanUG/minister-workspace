// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration. 
// Note: You should replace this with your own project config for the Minister Workspace.
// Currently reusing the provided config to avoid block. Ideally, create a new Firebase Project.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "prosperledger-2066e.firebaseapp.com",
    projectId: "prosperledger-2066e",
    storageBucket: "prosperledger-2066e.firebasestorage.app",
    messagingSenderId: "935082227118",
    appId: "1:935082227118:web:905af7687583940486443f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
