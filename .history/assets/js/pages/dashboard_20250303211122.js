import { DatabaseService } from '../services/database.js';

class DashboardManager {
    constructor() {
        this.loadStatistics();
    }

    async loadStatistics() {
        try {
            const [colleges, departments, teachers, students] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getDepartments(),
                DatabaseService.getTeachers(),
                DatabaseService.getStudents()
            ]);

            // Mettre à jour les statistiques
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = colleges.length;
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = departments.length;
            document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = teachers.length;
            document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = students.length;
        } catch (error) {
            console.error('Error loading dashboard statistics:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
