import { DatabaseService } from '../services/database.js';

class CollegeManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.collegesList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadColleges();
    }

    async loadColleges() {
        try {
            const colleges = await DatabaseService.getColleges();
            this.collegesList.innerHTML = ''; // Clear existing content
            colleges.forEach(college => this.addCollegeToList(college));
        } catch (error) {
            console.error('Error loading colleges:', error);
            this.showNotification('Erreur lors du chargement des collèges', 'error');
        }
    }

    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleAddCollege.bind(this));
        }

        // Add event listeners for action buttons
        this.collegesList.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const collegeId = row.dataset.id;

            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(collegeId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(collegeId);
            } else if (button.classList.contains('btn-view')) {
                this.handleView(collegeId);
            }
        });
    }

    async handleAddCollege(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

            const collegeData = {
                name: this.form.nom.value,
                website: this.form.site.value,
                createdAt: new Date().toISOString(),
                departmentsCount: 0,
                studentsCount: 0,
                averageGrade: 0
            };

            const collegeId = await DatabaseService.addCollege(collegeData);
            this.addCollegeToList({ id: collegeId, ...collegeData });
            this.form.reset();
            this.showNotification('Collège ajouté avec succès', 'success');

        } catch (error) {
            console.error('Error adding college:', error);
            this.showNotification('Erreur lors de l\'ajout du collège', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter le collège';
        }
    }

    async handleDelete(collegeId, row) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce collège ?')) {
            try {
                await DatabaseService.deleteDocument('colleges', collegeId);
                row.remove();
                this.showNotification('Collège supprimé avec succès', 'success');
            } catch (error) {
                console.error('Error deleting college:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    handleEdit(collegeId) {
        // Implement edit functionality
        console.log('Edit college:', collegeId);
    }

    handleView(collegeId) {
        const detailsSection = document.getElementById('college-details');
        if (detailsSection) {
            detailsSection.style.display = 'block';
            // Load college details
            this.loadCollegeDetails(collegeId);
        }
    }

    async loadCollegeDetails(collegeId) {
        try {
            const stats = await DatabaseService.getCollegeStatistics(collegeId);
            // Update the details view with the statistics
            // Implementation depends on your UI structure
        } catch (error) {
            console.error('Error loading college details:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    addCollegeToList(college) {
        const row = document.createElement('tr');
        row.dataset.id = college.id;
        row.innerHTML = `
            <td>${college.name}</td>
            <td><a href="${college.website}" target="_blank">${college.website}</a></td>
            <td>${college.departmentsCount || 0}</td>
            <td>${college.studentsCount || 0}</td>
            <td>${college.averageGrade || 0}</td>
            <td>
                <button class="btn-view">Voir détails</button>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.collegesList.appendChild(row);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CollegeManager();
});
