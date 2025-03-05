
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4SyYr7R7CcwsNLPT5Am4_OsydDKAMmJg",
    authDomain: "collegemanagement-58ff9.firebaseapp.com",
    projectId: "collegemanagement-58ff9",
    storageBucket: "collegemanagement-58ff9.firebasestorage.app",
    messagingSenderId: "449033733330",
    appId: "1:449033733330:web:0efdfa2488ad429ca5d90b",
    measurementId: "G-H85ZZWBCT7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db immediately for other modules
export { auth, db };