import { auth } from '../firebase-config.js';
import { DatabaseService } from '../services/database.js';
import router from '../router.js';

class DashboardManager {
    constructor() {
        this.initializeElements();
        this.initializeDashboard();
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

    async initializeDashboard() {
        try {
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
                const averageGrade = this.calculateAverageGrade(grades);
                this.updateStats({ averageGrade });
                this.updateRecentActivities([...grades]);
            });

        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Erreur lors du chargement du tableau de bord');
        }
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
        if ('value' in item) {
            return `Note ajoutée: ${item.value}/20`;
        }
        if ('name' in item) {
            return `${item.name} ajouté(e)`;
        }
        return 'Nouvelle activité';
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
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication before initializing
    auth.onAuthStateChanged(user => {
        if (user) {
            new DashboardManager();
        } else {
            router.redirectToLogin();
        }
    });
});
