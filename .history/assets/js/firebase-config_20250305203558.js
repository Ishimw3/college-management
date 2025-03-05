import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    // Make sure these values match your Firebase project settings
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let db;

async function initializeFirebase() {
    if (!db) {
        const { 
            getFirestore,
            initializeFirestore,
            CACHE_SIZE_UNLIMITED,
            persistentLocalCache,
            persistentMultipleTabManager
        } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js");

        // Initialize Firestore with persistent cache
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
        });
    }

    return { app, auth, db };
}

// Lazy initialization
export default await initializeFirebase();
