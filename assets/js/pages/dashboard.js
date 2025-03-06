import { auth } from '../firebase-config.js';
import { DatabaseService } from '../services/database.js';
import router from '../router.js';
import { collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export default class DashboardManager {
    constructor(db) {
        this.db = db;
        this.initializeListeners();
    }

    initializeListeners() {
        // Écouter les collections
        this.listenToCollection('colleges', 'collegesCount');
        this.listenToCollection('departments', 'departmentsCount');
        this.listenToCollection('teachers', 'teachersCount');
        this.listenToCollection('students', 'studentsCount');
        this.calculateAverageGrade();
    }

    listenToCollection(collectionName, statElementId) {
        const q = query(collection(this.db, collectionName));
        onSnapshot(q, (snapshot) => {
            const count = snapshot.size;
            const element = document.querySelector(`[data-stat="${statElementId}"]`);
            if (element) element.textContent = count;
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
        });
    }

    async calculateAverageGrade() {
        const q = query(collection(this.db, 'grades'));
        onSnapshot(q, (snapshot) => {
            let total = 0;
            let count = 0;
            
            snapshot.forEach(doc => {
                const grade = doc.data().grade;
                if (typeof grade === 'number') {
                    total += grade;
                    count++;
                }
            });

            const average = count > 0 ? (total / count).toFixed(2) : '0.00';
            const element = document.querySelector('[data-stat="averageGrade"]');
            if (element) element.textContent = average;
        });
    }
}

// Initialize dashboard when DOM is loaded
const initDashboard = () => {
    console.log('DOM loaded, initializing dashboard...'); // Debug log
    const dashboard = new DashboardManager();
};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User authenticated, creating dashboard...'); // Debug log
            initDashboard();
        } else {
            console.log('User not authenticated, redirecting...'); // Debug log
            router.redirectToLogin();
        }
    });
});
