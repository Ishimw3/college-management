let app, auth, db;

async function initializeFirebase() {
    if (!app) {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js");
        const { 
            getFirestore,
            initializeFirestore,
            CACHE_SIZE_UNLIMITED,
            persistentLocalCache,
            persistentMultipleTabManager
        } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js");
        const { 
            getAuth,
            setPersistence,
            browserLocalPersistence
        } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js");

        const firebaseConfig = {
            apiKey: "AIzaSyB4SyYr7R7CcwsNLPT5Am4_OsydDKAMmJg",
            authDomain: "collegemanagement-58ff9.firebaseapp.com",
            projectId: "collegemanagement-58ff9",
            storageBucket: "collegemanagement-58ff9",
            messagingSenderId: "449033733330",
            appId: "1:449033733330:web:0efdfa2488ad429ca5d90b"
        };

        // Initialize Firebase
        app = initializeApp(firebaseConfig);

        // Initialize Firestore with persistent cache
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            })
        });

        // Initialize Auth
        auth = getAuth(app);

        // Set auth persistence
        try {
            await setPersistence(auth, browserLocalPersistence);
            console.log('Auth persistence enabled');
        } catch (err) {
            console.error('Error setting auth persistence:', err);
        }
    }

    return { app, auth, db };
}

// Lazy initialization
export default await initializeFirebase();
