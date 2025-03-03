import { DatabaseService } from '../services/database.js';

class StudentManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.studentsList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadStudents();
    }

    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleAddStudent.bind(this));
        }

        // Gestionnaire pour les boutons d'action
        this.studentsList?.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const studentId = row.dataset.id;

            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(studentId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(studentId);
            } else if (button.classList.contains('btn-view')) {
                this.handleView(studentId);
            }
        });
    }

    async loadStudents() {
        try {
            const students = await DatabaseService.getStudents();
            this.studentsList.innerHTML = '';
            students.forEach(student => this.addStudentToList(student));
        } catch (error) {
            console.error('Error loading students:', error);
            this.showNotification('Erreur lors du chargement des étudiants', 'error');
        }
    }

    async handleAddStudent(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const studentData = {
                firstName: this.form.prenom.value,
                lastName: this.form.nom.value,
                email: this.form.email.value,
                phone: this.form.tel.value,
                enrollmentYear: parseInt(this.form.annee_entree.value),
                createdAt: new Date().toISOString(),
                averageGrade: 0
            };

            const studentId = await DatabaseService.addStudent(studentData);
            this.addStudentToList({ id: studentId, ...studentData });
            this.form.reset();
            this.showNotification('Étudiant ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding student:', error);
            this.showNotification('Erreur lors de l\'ajout de l\'étudiant', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter l\'étudiant';
        }
    }

    async handleDelete(studentId, row) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
            try {
                await DatabaseService.deleteDocument('students', studentId);
                row.remove();
                this.showNotification('Étudiant supprimé avec succès', 'success');
            } catch (error) {
                console.error('Error deleting student:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    async handleView(studentId) {
        try {
            const details = document.getElementById('details');
            if (!details) return;

            const student = await DatabaseService.getStudentById(studentId);
            if (!student) return;

            // Mettre à jour les détails
            document.getElementById('detail-nom').textContent = student.lastName;
            document.getElementById('detail-prenom').textContent = student.firstName;
            document.getElementById('detail-tel').textContent = student.phone;
            document.getElementById('detail-email').textContent = student.email;
            document.getElementById('detail-annee').textContent = student.enrollmentYear;
            document.getElementById('detail-moyenne').textContent = student.averageGrade || 'N/A';

            details.style.display = 'block';
            details.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading student details:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    addStudentToList(student) {
        const row = document.createElement('tr');
        row.dataset.id = student.id;
        row.innerHTML = `
            <td>${student.lastName}</td>
            <td>${student.firstName}</td>
            <td>${student.enrollmentYear}</td>
            <td>${student.averageGrade || 'N/A'}</td>
            <td>
                <button class="btn-view">Voir détails</button>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.studentsList.appendChild(row);
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
    new StudentManager();
});