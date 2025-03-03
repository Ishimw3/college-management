
import { DatabaseService } from '../services/database.js';

class StudentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.studentsList = document.querySelector('tbody');
        this.initializeEventListeners();
    }

    async handleAddStudent(event) {
        event.preventDefault();
        const studentData = {
            firstName: this.form.prenom.value,
            lastName: this.form.nom.value,
            email: this.form.email.value,
            phone: this.form.tel.value,
            enrollmentYear: this.form.annee_entree.value,
            createdAt: new Date().toISOString()
        };

        try {
            const id = await DatabaseService.addStudent(studentData);
            this.addStudentToList({ id, ...studentData });
            this.form.reset();
            this.showNotification('Étudiant ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding student:', error);
            this.showNotification('Erreur lors de l\'ajout de l\'étudiant', 'error');
        }
    }

    // ...autres méthodes...
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentManager();
});