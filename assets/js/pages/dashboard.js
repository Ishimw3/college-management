import { auth } from '../firebase-config.js';
import { DatabaseService } from '../services/database.js';
import router from '../router.js';

export default class DashboardManager {
    constructor() {
        console.log('Initializing Dashboard Manager'); // Debug log
        if (!document.querySelector('.dashboard-container')) {
            console.error('Dashboard container not found');
            return;
        }
        this.initializeElements();
        this.loadInitialData();
    }

    initializeElements() {
        this.statsElements = {
            collegesCount: document.querySelector('[data-stat="collegesCount"]'),
            departmentsCount: document.querySelector('[data-stat="departmentsCount"]'),
            teachersCount: document.querySelector('[data-stat="teachersCount"]'),
            studentsCount: document.querySelector('[data-stat="studentsCount"]'),
            averageGrade: document.querySelector('[data-stat="averageGrade"]')
        };
        this.activityList = document.querySelector('.activity-list');
    }

    async loadInitialData() {
        try {
            console.log('Loading initial data...'); // Debug log
            
            // Clear any existing data
            this.updateStats({
                collegesCount: 0,
                departmentsCount: 0,
                teachersCount: 0,
                studentsCount: 0,
                averageGrade: 0
            });
            
            if (this.activityList) {
                this.activityList.innerHTML = '<li>Loading...</li>';
            }
            
            // Load all data at once
            const [colleges, departments, teachers, students, grades] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getDepartments(),
                DatabaseService.getTeachers(),
                DatabaseService.getStudents(),
                DatabaseService.getAllGrades()
            ]);

            console.log('Data loaded:', { // Debug log
                colleges: colleges.length,
                departments: departments.length,
                teachers: teachers.length,
                students: students.length,
                grades: grades.length
            });

            // Update stats immediately
            this.updateStats({
                collegesCount: colleges.length,
                departmentsCount: departments.length,
                teachersCount: teachers.length,
                studentsCount: students.length,
                averageGrade: this.calculateAverageGrade(grades)
            });

            // Sort all activities by date
            const allActivities = [
                ...colleges.map(c => ({ ...c, type: 'college' })),
                ...departments.map(d => ({ ...d, type: 'department' })),
                ...teachers.map(t => ({ ...t, type: 'teacher' })),
                ...students.map(s => ({ ...s, type: 'student' })),
                ...grades.map(g => ({ ...g, type: 'grade' }))
            ].filter(item => item.createdAt)
             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Update activities list
            this.updateRecentActivities(allActivities);

            // Set up real-time listeners after initial load
            this.initializeRealTimeListeners();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Erreur lors du chargement des données initiales');
        }
    }

    initializeRealTimeListeners() {
        // Set up real-time listeners for collections
        DatabaseService.addCollectionListener('colleges', (colleges) => {
            this.updateStats({ collegesCount: colleges.length });
        });

        DatabaseService.addCollectionListener('departments', (departments) => {
            this.updateStats({ departmentsCount: departments.length });
        });

        DatabaseService.addCollectionListener('teachers', (teachers) => {
            this.updateStats({ teachersCount: teachers.length });
        });

        DatabaseService.addCollectionListener('students', (students) => {
            this.updateStats({ studentsCount: students.length });
        });

        DatabaseService.addCollectionListener('grades', (grades) => {
            this.updateStats({ 
                averageGrade: this.calculateAverageGrade(grades)
            });
        });
    }

    updateStats(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            const element = this.statsElements[key];
            if (element) {
                if (key === 'averageGrade') {
                    element.textContent = value.toFixed(2);
                } else {
                    element.textContent = value.toString();
                }
                // Add animation class
                element.classList.add('updated');
                setTimeout(() => element.classList.remove('updated'), 1000);
            }
        });
    }

    calculateAverageGrade(grades) {
        if (!grades || grades.length === 0) return 0;
        const sum = grades.reduce((acc, grade) => acc + (Number(grade.value) || 0), 0);
        return sum / grades.length;
    }

    updateRecentActivities(items) {
        if (!this.activityList || !items.length) return;

        const sortedItems = items
            .filter(item => item.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.activityList.innerHTML = sortedItems.map(item => {
            const date = new Date(item.createdAt);
            return `
                <li>
                    <i class="fas fa-clock"></i>
                    <span>${this.getActivityDescription(item)}</span>
                    <small>${date.toLocaleDateString('fr-FR')}</small>
                </li>
            `;
        }).join('');
    }

    getActivityDescription(item) {
        const date = new Date(item.createdAt).toLocaleDateString('fr-FR');
        switch (item.type) {
            case 'college':
                return `Collège "${item.name}" ajouté`;
            case 'department':
                return `Département "${item.name}" créé`;
            case 'teacher':
                return `Enseignant ${item.firstName} ${item.lastName} ajouté`;
            case 'student':
                return `Étudiant ${item.firstName} ${item.lastName} inscrit`;
            case 'grade':
                return `Note de ${item.value}/20 ajoutée`;
            default:
                return 'Nouvelle activité';
        }
    }

    showError(message) {
        const container = document.querySelector('.dashboard-container');
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        container.prepend(error);
        setTimeout(() => error.remove(), 5000);
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
