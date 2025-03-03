import { DatabaseService } from '../services/database.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            // Charger les données
            const departments = await DatabaseService.getDepartments();
            console.log('Loaded departments:', departments);

            this.departmentsList.innerHTML = '';
            if (!departments || departments.length === 0) {
                this.departmentsList.innerHTML = `
                    <tr>
                        <td colspan="6">Aucun département trouvé</td>
                    </tr>`;
                return;
            }

            departments.forEach(dept => {
                this.addDepartmentToList(dept);
            });

        } catch (error) {
            console.error('Error loading departments:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    initializeEventListeners() {
        // Gestionnaire du formulaire d'ajout
        this.form?.addEventListener('submit', this.handleAddDepartment.bind(this));

        // Gestionnaire des actions sur les départements
        this.departmentsList?.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const deptId = row.dataset.id;
            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(deptId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(deptId);
            }
        });
    }

    async handleAddDepartment(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const departmentData = {
                name: this.form.nom.value,
                averageGrade: 0,
                createdAt: new Date().toISOString(),
                departmentsCount: 0,
                studentsCount: 0,
                website: this.form.website?.value || 'N/A'
            };

            const deptId = await DatabaseService.addDepartment(departmentData);
            this.addDepartmentToList({
                id: deptId,
                ...departmentData
            });
            
            this.form.reset();
            this.showNotification('Département ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding department:', error);
            this.showNotification('Erreur lors de l\'ajout du département', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter le département';
        }
    }

    async handleDelete(deptId, row) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
            try {
                await DatabaseService.deleteDocument('departments', deptId);
                row.remove();
                this.showNotification('Département supprimé avec succès', 'success');
            } catch (error) {
                console.error('Error deleting department:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    addDepartmentToList(department) {
        const row = document.createElement('tr');
        row.dataset.id = department.id;
        row.innerHTML = `
            <td>${department.name}</td>
            <td>${department.website || 'N/A'}</td>
            <td>${department.studentsCount || 0}</td>
            <td>${department.departmentsCount || 0}</td>
            <td>${department.averageGrade || 0}</td>
            <td>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.departmentsList.appendChild(row);
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
    new DepartmentManager();
});