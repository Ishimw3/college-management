
import { DatabaseService } from '../services/database.js';

class DepartmentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.departmentsList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadColleges();
        this.loadTeachers();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', this.handleAddDepartment.bind(this));
    }

    async loadColleges() {
        try {
            const colleges = await DatabaseService.getColleges();
            const select = document.getElementById('college');
            colleges.forEach(college => {
                const option = document.createElement('option');
                option.value = college.id;
                option.textContent = college.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading colleges:', error);
        }
    }

    async loadTeachers() {
        try {
            const teachers = await DatabaseService.getTeachers();
            const select = document.getElementById('responsable');
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = `${teacher.firstName} ${teacher.lastName}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    async handleAddDepartment(event) {
        event.preventDefault();
        const departmentData = {
            name: this.form.nom.value,
            collegeId: this.form.college.value,
            responsibleTeacherId: this.form.responsable.value,
            createdAt: new Date().toISOString()
        };

        try {
            const id = await DatabaseService.addDepartment(departmentData);
            this.addDepartmentToList({ id, ...departmentData });
            this.form.reset();
            this.showNotification('Département ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding department:', error);
            this.showNotification('Erreur lors de l\'ajout du département', 'error');
        }
    }

    // ...rest of the methods similar to CollegeManager...
}

document.addEventListener('DOMContentLoaded', () => {
    new DepartmentManager();
});