import { DatabaseService } from '../services/database.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.collegeSelect = document.getElementById('college');
        this.responsableSelect = document.getElementById('responsable');
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            // Charger les données des collèges et enseignants pour les selects
            const [colleges, teachers, departments] = await Promise.all([
                DatabaseService.getColleges(),
                DatabaseService.getTeachers(),
                DatabaseService.getDepartments()
            ]);

            console.log('Loaded data:', { colleges, teachers, departments });

            // Remplir le select des collèges
            colleges.forEach(college => {
                const option = document.createElement('option');
                option.value = college.id;
                option.textContent = college.name;
                this.collegeSelect.appendChild(option);
            });

            // Remplir le select des responsables
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = `${teacher.lastName} ${teacher.firstName}`;
                this.responsableSelect.appendChild(option);
            });

            // Créer les maps pour référence
            this.collegesMap = new Map(colleges.map(c => [c.id, c]));
            this.teachersMap = new Map(teachers.map(t => [t.id, t]));

            // Afficher les départements
            this.displayDepartments(departments);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    displayDepartments(departments) {
        this.departmentsList.innerHTML = '';
        if (!departments || departments.length === 0) {
            this.departmentsList.innerHTML = '<tr><td colspan="6">Aucun département trouvé</td></tr>';
            return;
        }

        departments.forEach(dept => this.addDepartmentToList(dept));
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
                collegeId: this.form.college.value,
                responsibleTeacherId: this.form.responsable.value,
                studentsCount: 0,
                averageGrade: 0,
                createdAt: new Date().toISOString()
            };

            const deptId = await DatabaseService.addDepartment(departmentData);
            
            // Récupérer les noms pour l'affichage
            const college = this.collegesMap.get(departmentData.collegeId);
            const teacher = this.teachersMap.get(departmentData.responsibleTeacherId);
            
            this.addDepartmentToList({
                id: deptId,
                ...departmentData,
                collegeName: college?.name,
                responsibleName: teacher ? `${teacher.lastName} ${teacher.firstName}` : 'N/A'
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
            <td>${department.collegeName || 'N/A'}</td>
            <td>${department.responsibleName || 'N/A'}</td>
            <td>${department.studentsCount || 0}</td>
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