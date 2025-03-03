import { DatabaseService } from '../services/database.js';

class GradesManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.gradesList = document.querySelector('tbody');
        this.initializeEventListeners();
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            const [students, subjects, grades] = await Promise.all([
                DatabaseService.getStudents(),
                DatabaseService.getSubjects(),
                this.loadAllGrades()
            ]);

            // Mise à jour des selects pour les étudiants
            const studentSelect = document.getElementById('etudiant');
            const filterStudentSelect = document.getElementById('filter-etudiant');
            
            // Vider les selects avant d'ajouter les nouvelles options
            studentSelect.innerHTML = '<option value="">Sélectionner un étudiant</option>';
            filterStudentSelect.innerHTML = '<option value="">Tous les étudiants</option>';
            
            // Ajouter les étudiants aux selects
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.lastName} ${student.firstName}`;
                studentSelect.appendChild(option);
                filterStudentSelect.appendChild(option.cloneNode(true));
            });

            // Mise à jour des selects pour les matières
            const subjectSelect = document.getElementById('matiere');
            const filterSubjectSelect = document.getElementById('filter-matiere');
            
            // Vider les selects avant d'ajouter les nouvelles options
            subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>';
            filterSubjectSelect.innerHTML = '<option value="">Toutes les matières</option>';
            
            // Ajouter les matières aux selects
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
                filterSubjectSelect.appendChild(option.cloneNode(true));
            });

            // Créer les maps pour référence rapide
            this.studentsMap = new Map(students.map(s => [s.id, s]));
            this.subjectsMap = new Map(subjects.map(s => [s.id, s]));

            // Afficher les notes existantes
            this.displayGrades(grades);
            this.updateStatistics(grades);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    async loadAllGrades() {
        try {
            const querySnapshot = await DatabaseService.getAllGrades();
            return querySnapshot;
        } catch (error) {
            console.error('Error loading grades:', error);
            return [];
        }
    }

    initializeEventListeners() {
        // Gestionnaire du formulaire d'ajout
        this.form?.addEventListener('submit', this.handleAddGrade.bind(this));

        // Gestionnaires des filtres
        document.getElementById('filter-etudiant')?.addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('filter-matiere')?.addEventListener('change', this.handleFilter.bind(this));

        // Gestionnaire des actions sur les notes
        this.gradesList?.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const gradeId = row.dataset.id;
            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(gradeId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(gradeId);
            }
        });
    }

    async handleAddGrade(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const gradeData = {
                studentId: this.form.etudiant.value,
                subjectId: this.form.matiere.value,
                value: parseFloat(this.form.note.value),
                date: this.form.date.value,
                createdAt: new Date().toISOString()
            };

            const gradeId = await DatabaseService.addGrade(gradeData);
            const student = this.studentsMap.get(gradeData.studentId);
            const subject = this.subjectsMap.get(gradeData.subjectId);

            this.addGradeToList({
                id: gradeId,
                ...gradeData,
                studentName: `${student.lastName} ${student.firstName}`,
                subjectName: subject.name
            });

            this.form.reset();
            this.showNotification('Note ajoutée avec succès', 'success');
            await this.updateStatistics();
        } catch (error) {
            console.error('Error adding grade:', error);
            this.showNotification('Erreur lors de l\'ajout de la note', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter la note';
        }
    }

    async handleDelete(gradeId, row) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            try {
                await DatabaseService.deleteDocument('grades', gradeId);
                row.remove();
                this.showNotification('Note supprimée avec succès', 'success');
                await this.updateStatistics();
            } catch (error) {
                console.error('Error deleting grade:', error);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        }
    }

    async updateStatistics(grades) {
        if (!grades) {
            grades = await this.loadAllGrades();
        }

        // Calculer les moyennes par matière
        const averagesBySubject = new Map();
        grades.forEach(grade => {
            if (!averagesBySubject.has(grade.subjectId)) {
                averagesBySubject.set(grade.subjectId, { sum: 0, count: 0 });
            }
            const stats = averagesBySubject.get(grade.subjectId);
            stats.sum += grade.value;
            stats.count++;
        });

        // Mettre à jour le tableau des moyennes
        const statsBody = document.querySelector('.stats-section tbody');
        if (statsBody) {
            statsBody.innerHTML = '';
            for (const [subjectId, stats] of averagesBySubject) {
                const subject = this.subjectsMap.get(subjectId);
                const average = stats.sum / stats.count;
                statsBody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td>${subject.name}</td>
                        <td>${average.toFixed(2)}</td>
                    </tr>
                `);
            }
        }
    }

    displayGrades(grades) {
        this.gradesList.innerHTML = '';
        grades.forEach(grade => {
            const student = this.studentsMap.get(grade.studentId);
            const subject = this.subjectsMap.get(grade.subjectId);
            if (student && subject) {
                this.addGradeToList({
                    ...grade,
                    studentName: `${student.lastName} ${student.firstName}`,
                    subjectName: subject.name
                });
            }
        });
    }

    addGradeToList(grade) {
        const row = document.createElement('tr');
        row.dataset.id = grade.id;
        row.innerHTML = `
            <td>${grade.studentName}</td>
            <td>${grade.subjectName}</td>
            <td>${grade.value}</td>
            <td>${new Date(grade.date).toLocaleDateString()}</td>
            <td>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.gradesList.appendChild(row);
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
    new GradesManager();
});
