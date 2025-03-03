import { DatabaseService } from '../services/database.js';
import { UIManager } from '../modules/UIManager.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.initializeListeners();
        this.loadDepartments();
    }

    initializeListeners() {
        this.form?.addEventListener('submit', this.handleAddDepartment.bind(this));
    }

    async handleAddDepartment(event) {
        event.preventDefault();
        const button = event.submitter;
        const stopLoading = UIManager.showLoading(button);

        try {
            const departmentData = {
                name: this.form.nom.value,
                collegeId: this.form.college.value,
                responsibleTeacherId: this.form.responsable.value,
                createdAt: new Date().toISOString()
            };

            const id = await DatabaseService.addDepartment(departmentData);
            this.addDepartmentToList({ id, ...departmentData });
            this.form.reset();
            UIManager.showNotification('Département ajouté avec succès');
        } catch (error) {
            console.error('Error:', error);
            UIManager.showNotification('Erreur lors de l\'ajout du département', 'error');
        } finally {
            stopLoading();
        }
    }

    async loadDepartments() {
        try {
            const departments = await DatabaseService.getDepartments();
            this.departmentsList.innerHTML = '';
            departments.forEach(dept => this.addDepartmentToList(dept));
        } catch (error) {
            console.error('Error loading departments:', error);
            UIManager.showNotification('Erreur lors du chargement des départements', 'error');
        }
    }

    addDepartmentToList(department) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${department.name}</td>
            <td>${department.collegeId}</td>
            <td>${department.responsibleTeacherId}</td>
            <td>0</td>
            <td>0</td>
            <td>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.departmentsList.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DepartmentManager();
});