import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getFirestore, 
    enableIndexedDbPersistence,
    initializeFirestore,
    CACHE_SIZE_UNLIMITED,
    persistentLocalCache,
    persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence,
    initializeAuth,
    indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4SyYr7R7CcwsNLPT5Am4_OsydDKAMmJg",
    authDomain: "collegemanagement-58ff9.firebaseapp.com",
    projectId: "collegemanagement-58ff9",
    storageBucket: "collegemanagement-58ff9.appspot.com",
    messagingSenderId: "449033733330",
    appId: "1:449033733330:web:0efdfa2488ad429ca5d90b"
};

// Initialize Firebase with optimized settings
const app = initializeApp(firebaseConfig);

// Initialize Firestore with caching
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
});

// Initialize Auth with IndexedDB persistence
const auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
});

// Enable offline persistence
try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled');
} catch (err) {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
        console.warn('Browser doesn\'t support persistence');
    }
}

// Set auth persistence
try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence enabled');
} catch (err) {
    console.error('Error setting auth persistence:', err);
}

export { app, auth, db };
