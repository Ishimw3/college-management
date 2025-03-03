import { DatabaseService } from '../services/database.js';
import { validateSubject } from '../models/types.js';

class SubjectManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.subjectsList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadSubjects();
    }

    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleAddSubject.bind(this));
        }

        // Gestionnaire d'événements pour les boutons d'action
        this.subjectsList?.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const subjectId = row.dataset.id;

            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(subjectId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(subjectId);
            }
        });
    }

    async loadSubjects() {
        try {
            const subjects = await DatabaseService.getSubjects();
            this.subjectsList.innerHTML = '';
            subjects.forEach(subject => this.addSubjectToList(subject));
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showNotification('Erreur lors du chargement des matières', 'error');
        }
    }

    async handleAddSubject(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const subjectData = {
                name: this.form.nom_matiere.value,
                room: this.form.salle.value,
                capacity: parseInt(this.form.capacite.value),
                createdAt: new Date().toISOString(),
                averageGrade: 0,
                teachersCount: 0
            };

            const subjectId = await DatabaseService.addSubject(subjectData);
            this.addSubjectToList({ id: subjectId, ...subjectData });
            this.form.reset();
            this.showNotification('Matière ajoutée avec succès', 'success');
        } catch (error) {
            console.error('Error adding subject:', error);
            this.showNotification('Erreur lors de l\'ajout de la matière', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter la matière';
        }
    }

    async handleDelete(subjectId, row) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
            try {
                await DatabaseService.deleteDocument('subjects', subjectId);
                row.remove();
                this.showNotification('Matière supprimée avec succès', 'success');
            } catch (error) {
                console.error('Error deleting subject:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    handleEdit(subjectId) {
        // À implémenter : logique de modification
        console.log('Edit subject:', subjectId);
    }

    addSubjectToList(subject) {
        const row = document.createElement('tr');
        row.dataset.id = subject.id;
        row.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.room}</td>
            <td>${subject.capacity}</td>
            <td>${subject.teachersCount || 0}</td>
            <td>${subject.averageGrade || 0}</td>
            <td>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.subjectsList.appendChild(row);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SubjectManager();
});
