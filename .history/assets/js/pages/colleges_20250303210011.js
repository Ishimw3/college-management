import { DatabaseService } from '../services/database.js';

class CollegeManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.collegesList = document.querySelector('tbody');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', this.handleAddCollege.bind(this));
    }

    async handleAddCollege(event) {
        event.preventDefault();
        
        // Récupérer les données du formulaire
        const collegeData = {
            name: this.form.nom.value,
            website: this.form.site.value,
            createdAt: new Date().toISOString(),
            departmentsCount: 0,
            studentsCount: 0,
            averageGrade: 0
        };

        try {
            // Désactiver le bouton pendant l'ajout
            const submitButton = this.form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

            // Ajouter le collège à Firebase
            const collegeId = await DatabaseService.addCollege(collegeData);
            
            // Ajouter à la liste
            this.addCollegeToList({
                id: collegeId,
                ...collegeData
            });

            // Réinitialiser le formulaire
            this.form.reset();
            
            // Afficher un message de succès
            this.showNotification('Collège ajouté avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout du collège:', error);
            this.showNotification('Erreur lors de l\'ajout du collège', 'error');
        } finally {
            // Réactiver le bouton
            const submitButton = this.form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter le collège';
        }
    }

    addCollegeToList(college) {
        const row = document.createElement('tr');
        row.dataset.id = college.id;
        row.innerHTML = `
            <td>${college.name}</td>
            <td><a href="${college.website}" target="_blank">${college.website}</a></td>
            <td>${college.departmentsCount}</td>
            <td>${college.studentsCount}</td>
            <td>${college.averageGrade}</td>
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

        // Supprimer la notification après 3 secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialiser le gestionnaire quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new CollegeManager();
});
