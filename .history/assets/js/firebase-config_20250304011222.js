import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";
import router from '../router.js';

// Vérifier l'authentification
if (!auth.currentUser) {
    router.redirectToLogin();
}

const firebaseConfig = {
    apiKey: "AIzaSyB4SyYr7R7CcwsNLPT5Am4_OsydDKAMmJg",
    authDomain: "collegemanagement-58ff9.firebaseapp.com",
    projectId: "collegemanagement-58ff9",
    storageBucket: "collegemanagement-58ff9.firebasestorage.app",
    messagingSenderId: "449033733330",
    appId: "1:449033733330:web:0efdfa2488ad429ca5d90b",
    measurementId: "G-H85ZZWBCT7"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
