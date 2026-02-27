import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDKw_uJDVEf1nMEQvdp8HTa6uAkqw-8UpI",
    authDomain: "prosperledger-2066e.firebaseapp.com",
    projectId: "prosperledger-2066e",
    storageBucket: "prosperledger-2066e.firebasestorage.app",
    messagingSenderId: "935082227118",
    appId: "1:935082227118:web:905af7687583940486443f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveKey() {
    try {
        const configRef = doc(db, 'config', 'minister_admin');
        await setDoc(configRef, { geminiApiKey: "AIzaSyA3PqVDYXj9jDMXtCwMErpBLtDTc3F4U7U" }, { merge: true });
        console.log("Successfully saved Gemini API Key to Firestore.");
        process.exit(0);
    } catch (error) {
        console.error("Error saving key:", error);
        process.exit(1);
    }
}

saveKey();
