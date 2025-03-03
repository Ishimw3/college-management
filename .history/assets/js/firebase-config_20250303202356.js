import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

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
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
