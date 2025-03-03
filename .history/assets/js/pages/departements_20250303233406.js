import { DatabaseService } from '../services/database.js';
import { UIManager } from '../modules/UIManager.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.collegeMap = new Map();
        this.teacherMap = new Map();
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            // Ajouter des logs pour déboguer
            console.log('Démarrage du chargement des données...');

            const colleges = await DatabaseService.getColleges();
            console.log('Collèges chargés:', colleges);

            const teachers = await DatabaseService.getTeachers();
            console.log('Enseignants chargés:', teachers);

            // Vérifier et nettoyer les selects
            const collegeSelect = document.getElementById('college');
            const responsableSelect = document.getElementById('responsable');

            if (!collegeSelect || !responsableSelect) {
                console.error('Selects non trouvés dans le DOM');
                return;
            }

            // Vider les selects
            collegeSelect.innerHTML = '<option value="">Sélectionner un collège</option>';
            responsableSelect.innerHTML = '<option value="">Sélectionner un responsable</option>';

            // Remplir les selects et les maps
            if (colleges && colleges.length > 0) {
                console.log('Remplissage des collèges...');
                this.collegeMap = new Map();
                colleges.forEach(college => {
                    this.collegeMap.set(college.id, college);
                    const option = document.createElement('option');
                    option.value = college.id;
                    option.textContent = college.name;
                    collegeSelect.appendChild(option);
                });
            } else {
                console.warn('Aucun collège trouvé');
            }

            if (teachers && teachers.length > 0) {
                console.log('Remplissage des enseignants...');
                this.teacherMap = new Map();
                teachers.forEach(teacher => {
                    this.teacherMap.set(teacher.id, teacher);
                    const option = document.createElement('option');
                    option.value = teacher.id;
                    option.textContent = `${teacher.lastName} ${teacher.firstName}`;
                    responsableSelect.appendChild(option);
                });
            } else {
                console.warn('Aucun enseignant trouvé');
            }

            // Charger les départements
            await this.loadDepartments();

        } catch (error) {
            console.error('Erreur détaillée:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    async loadDepartments() {
        try {
            const departments = await DatabaseService.getDepartments();
            console.log('Départements chargés:', departments);
            console.log('College Map:', this.collegeMap);
            console.log('Teacher Map:', this.teacherMap);

            this.departmentsList.innerHTML = '';
            
            if (!departments || departments.length === 0) {
                this.departmentsList.innerHTML = `
                    <tr><td colspan="6">Aucun département trouvé</td></tr>`;
                return;
            }

            departments.forEach(dept => {
                const college = this.collegeMap.get(dept.collegeId);
                const teacher = this.teacherMap.get(dept.responsibleTeacherId);
                
                console.log('Département en cours:', dept);
                console.log('Collège trouvé:', college);
                console.log('Enseignant trouvé:', teacher);

                this.addDepartmentToList({
                    ...dept,
                    collegeName: college ? college.name : 'N/A',
                    responsibleName: teacher ? `${teacher.lastName} ${teacher.firstName}` : 'N/A'
                });
            });
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
            this.showNotification('Erreur lors du chargement des départements', 'error');
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
                collegeId: this.form.college.value,
                responsibleTeacherId: this.form.responsable.value,
                createdAt: new Date().toISOString(),
                teachersCount: 0,
                studentsCount: 0,
                averageGrade: 0
            };

            await DatabaseService.addDepartment(departmentData);
            await this.loadDepartments(); // Recharger la liste
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
            <td>${department.collegeName}</td>
            <td>${department.responsibleName}</td>
            <td>${department.teachersCount || 0}</td>
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