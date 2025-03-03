
import { DatabaseService } from '../services/database.js';

class TeacherManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.teachersList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadDepartments();
        this.loadSubjects();
    }

    async handleAddTeacher(event) {
        event.preventDefault();
        const teacherData = {
            firstName: this.form.prenom.value,
            lastName: this.form.nom.value,
            email: this.form.email.value,
            phone: this.form.tel.value,
            startDate: this.form.date_fonction.value,
            index: this.form.indice.value,
            departmentId: this.form.departement.value,
            subjectId: this.form.matiere.value,
            createdAt: new Date().toISOString()
        };

        try {
            const id = await DatabaseService.addTeacher(teacherData);
            this.addTeacherToList({ id, ...teacherData });
            this.form.reset();
            this.showNotification('Enseignant ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding teacher:', error);
            this.showNotification('Erreur lors de l\'ajout de l\'enseignant', 'error');
        }
    }

    // ...autres méthodes...
}

document.addEventListener('DOMContentLoaded', () => {
    new TeacherManager();
});