import { auth } from '../firebase-config.js';
import { DatabaseService } from '../services/database.js';
import router from '../router.js';

class DashboardManager {
    constructor() {
        // Vérifier l'authentification d'abord
        this.checkAuth();
    }

    async checkAuth() {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.redirectToLogin();
                return;
            }
            // Initialiser le tableau de bord une fois authentifié
            await this.initializeDashboard();
        });
    }

    async initializeDashboard() {
        this.statsElements = {
            collegesCount: document.querySelector('[data-stat="collegesCount"]'),
            departmentsCount: document.querySelector('[data-stat="departmentsCount"]'),
            teachersCount: document.querySelector('[data-stat="teachersCount"]'),
            studentsCount: document.querySelector('[data-stat="studentsCount"]'),
            averageGrade: document.querySelector('[data-stat="averageGrade"]')
        };
        this.activityList = document.querySelector('.activity-list');
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            // Charger toutes les données nécessaires
            const [colleges, departments, teachers, students, grades] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getDepartments(),
                DatabaseService.getTeachers(),
                DatabaseService.getStudents(),
                DatabaseService.getAllGrades()
            ]);

            // Mettre à jour les compteurs
            this.updateStats({
                collegesCount: colleges.length,
                departmentsCount: departments.length,
                teachersCount: teachers.length,
                studentsCount: students.length,
                averageGrade: this.calculateAverageGrade(grades)
            });

            // Mettre à jour les activités récentes
            this.updateRecentActivities([
                ...colleges,
                ...departments,
                ...teachers,
                ...students,
                ...grades
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateStats(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            const element = this.statsElements[key];
            if (element) {
                if (key === 'averageGrade') {
                    element.textContent = value.toFixed(2);
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    calculateAverageGrade(grades) {
        if (!grades || grades.length === 0) return 0;
        const sum = grades.reduce((acc, grade) => acc + grade.value, 0);
        return sum / grades.length;
    }

    updateRecentActivities(items) {
        if (!this.activityList) return;

        const sortedItems = items
            .filter(item => item.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.activityList.innerHTML = sortedItems.map(item => {
            const timeAgo = this.getTimeAgo(new Date(item.createdAt));
            let icon, text;

            if ('value' in item) {
                icon = 'fas fa-star';
                text = 'Nouvelle note ajoutée';
            } else if ('lastName' in item) {
                icon = 'fas fa-user-plus';
                text = `${item.firstName} ${item.lastName} ajouté(e)`;
            } else if ('name' in item) {
                icon = 'fas fa-plus-circle';
                text = `Nouveau ${this.getItemType(item)}: ${item.name}`;
            }

            return `
                <li>
                    <i class="${icon}"></i>
                    <span>${text}</span>
                    <small>${timeAgo}</small>
                </li>
            `;
        }).join('');
    }

    getItemType(item) {
        if ('departmentsCount' in item) return 'collège';
        if ('studentsCount' in item) return 'département';
        return 'élément';
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            année: 31536000,
            mois: 2592000,
            semaine: 604800,
            jour: 86400,
            heure: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `Il y a ${interval} ${unit}${interval > 1 ? 's' : ''}`;
            }
        }
        return "À l'instant";
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
