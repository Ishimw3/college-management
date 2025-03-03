import { DatabaseService } from '../services/database.js';

class DashboardManager {
    constructor() {
        this.initializeStats();
    }

    async initializeStats() {
        try {
            // Charger toutes les données nécessaires
            const [colleges, departments, teachers, students, grades] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getDepartments(),
                DatabaseService.getTeachers(),
                DatabaseService.getStudents(),
                DatabaseService.getAllGrades()
            ]);

            // Mise à jour des compteurs principaux
            this.updateMainStats({
                collegesCount: colleges.length,
                departmentsCount: departments.length,
                teachersCount: teachers.length,
                studentsCount: students.length
            });

            // Calcul et mise à jour des performances académiques
            this.updateAcademicPerformance(grades);

            // Mise à jour des activités récentes
            this.updateRecentActivities([...colleges, ...departments, ...teachers, ...students, ...grades]);

        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }

    updateMainStats(stats) {
        // Mettre à jour les compteurs avec animation
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
                // Ajouter une classe pour l'animation si nécessaire
                element.classList.add('updated');
            }
        });
    }

    updateAcademicPerformance(grades) {
        if (!grades || grades.length === 0) return;

        // Calculer la moyenne générale
        const average = grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length;
        
        // Trouver la meilleure moyenne
        const bestGrade = Math.max(...grades.map(g => g.value));
        
        // Calculer le taux de réussite (notes >= 10)
        const successCount = grades.filter(g => g.value >= 10).length;
        const successRate = (successCount / grades.length) * 100;

        // Mettre à jour l'affichage
        document.querySelector('.chart-value').textContent = average.toFixed(1);
        document.querySelector('[data-performance="best"]').textContent = bestGrade.toFixed(1);
        document.querySelector('[data-performance="success-rate"]').textContent = `${successRate.toFixed(0)}%`;
    }

    updateRecentActivities(allItems) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        // Trier par date de création
        const recentItems = allItems
            .filter(item => item.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5); // Garder les 5 plus récents

        activityList.innerHTML = recentItems.map(item => {
            const date = new Date(item.createdAt);
            const timeAgo = this.getTimeAgo(date);
            let icon, text;

            if ('value' in item) {
                icon = 'fas fa-star';
                text = `Nouvelle note ajoutée`;
            } else if ('firstName' in item) {
                icon = 'fas fa-user-plus';
                text = `Nouvel étudiant: ${item.firstName} ${item.lastName}`;
            } else if ('name' in item) {
                icon = 'fas fa-plus-circle';
                text = `Nouveau ${item.type || 'département'}: ${item.name}`;
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

// Initialiser le tableau de bord
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
