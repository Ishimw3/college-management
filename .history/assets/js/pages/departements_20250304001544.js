import { DatabaseService } from '../services/database.js';
import { UIManager } from '../modules/UIManager.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.collegeSelect = document.getElementById('college');
        this.responsableSelect = document.getElementById('responsable');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.collegeMap = new Map();
        this.teacherMap = new Map();
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            console.log('Loading initial data...'); // Debug

            // Fetch data
            const [colleges, teachers] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getTeachers()
            ]);

            console.log('Loaded data:', { colleges, teachers }); // Debug

            // Update maps
            this.collegeMap = new Map(colleges.map(c => [c.id, c]));
            this.teacherMap = new Map(teachers.map(t => [t.id, t]));

            // Populate college select
            this.collegeSelect.innerHTML = '<option value="">Sélectionner un collège</option>';
            colleges.forEach(college => {
                const option = document.createElement('option');
                option.value = college.id;
                option.textContent = college.name;
                this.collegeSelect.appendChild(option);
            });

            console.log('College select options:', this.collegeSelect.innerHTML); // Debug

            // Populate responsible teacher select
            this.responsableSelect.innerHTML = '<option value="">Sélectionner un responsable</option>';
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = `${teacher.lastName} ${teacher.firstName}`;
                this.responsableSelect.appendChild(option);
            });

            console.log('Responsible select options:', this.responsableSelect.innerHTML); // Debug

            // Load departments
            await this.loadDepartments();

        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    async loadDepartments() {
        try {
            const departments = await DatabaseService.getDepartments();
            console.log('Loaded departments:', departments); // Debug

            this.departmentsList.innerHTML = '';
            if (!departments || departments.length === 0) {
                this.departmentsList.innerHTML = `
                    <tr>
                        <td colspan="6">Aucun département trouvé</td>
                    </tr>`;
                return;
            }

            // Puisque les docs n'ont pas de "collegeId" ou "responsibleTeacherId", on utilise directement leurs données
            departments.forEach(dept => {
                this.addDepartmentToList(dept);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showNotification('Erreur lors du chargement des départements', 'error');
        }
    }

    initializeEventListeners() {
        // Form submission handler
        this.form?.addEventListener('submit', this.handleAddDepartment.bind(this));

        // Log changes in college select
        this.collegeSelect?.addEventListener('change', (e) => {
            console.log('College selected:', e.target.value);
        });

        // Log changes in responsible select
        this.responsableSelect?.addEventListener('change', (e) => {
            console.log('Responsible selected:', e.target.value);
        });

        // Department actions handler
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
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const departmentData = {
                name: this.form.nom.value,
                collegeId: this.form.college.value,
                responsibleTeacherId: this.form.responsable.value,
                createdAt: new Date().toISOString(),
                teachersCount: 0,
                studentsCount: 0,
                averageGrade: 0
            };

            await DatabaseService.addDepartment(departmentData);
            await this.loadDepartments(); // Reload the list
            this.form.reset();
            this.showNotification('Département ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding department:', error);
            this.showNotification('Erreur lors de l\'ajout du département', 'error');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Ajouter le département';
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
        // Utilisez les champs présents dans vos documents (ex. website au lieu de "college", pas de responsable)
        row.innerHTML = `
            <td>${department.name}</td>
            <td>${department.website || 'N/A'}</td>
            <td>N/A</td>
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