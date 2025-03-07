import { auth } from '../firebase-config.js';
import { DatabaseService } from '../services/database.js';
import router from '../router.js';

export default class GradesManager {
    constructor(db) {
        this.db = db;
        this.initialize();
    }

    async initialize() {
        try {
            // Verify auth first
            const user = await DatabaseService.verifyAuth();
            console.log('Initializing grades as:', user.email);

            // Initialize DOM elements
            this.form = document.querySelector('.form-section form');
            this.gradesList = document.querySelector('.list-section tbody');
            
            // Initialize everything only after auth is confirmed
            await Promise.all([
                this.initializeEventListeners(),
                this.loadInitialData()
            ]);
        } catch (error) {
            console.error('Initialization error:', error);
            if (error.message === 'Authentication required') {
                router.redirectToLogin();
            }
        }
    }

    async loadInitialData() {
        try {
            const [students, subjects] = await Promise.all([
                DatabaseService.getStudents(),
                DatabaseService.getSubjects()
            ]);
            this.populateSelects(students, subjects);
            await this.loadGrades();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Erreur de chargement des données');
        }
    }

    async loadGrades() {
        try {
            const grades = await DatabaseService.getAllGrades();
            this.displayGrades(grades);
            this.updateStatistics(grades);
        } catch (error) {
            console.error('Error loading grades:', error);
            this.showError('Erreur de chargement des notes');
        }
    }

    populateSelects(students, subjects) {
        // Vider et remplir le select des étudiants
        const studentSelect = document.getElementById('etudiant');
        const filterStudentSelect = document.getElementById('filter-etudiant');
        
        studentSelect.innerHTML = '<option value="">Sélectionner un étudiant</option>';
        filterStudentSelect.innerHTML = '<option value="">Tous les étudiants</option>';
        
        if (students && students.length > 0) {
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.lastName} ${student.firstName}`;
                studentSelect.appendChild(option);
                filterStudentSelect.appendChild(option.cloneNode(true));
            });
        }

        // Vider et remplir le select des matières
        const subjectSelect = document.getElementById('matiere');
        const filterSubjectSelect = document.getElementById('filter-matiere');
        
        subjectSelect.innerHTML = '<option value="">Sélectionner une matière</option>';
        filterSubjectSelect.innerHTML = '<option value="">Toutes les matières</option>';
        
        if (subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
                filterSubjectSelect.appendChild(option.cloneNode(true));
            });
        }

        // Créer les maps pour référence rapide
        this.studentsMap = new Map(students.map(s => [s.id, s]));
        this.subjectsMap = new Map(subjects.map(s => [s.id, s]));
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
        const filterStudent = document.getElementById('filter-etudiant');
        const filterSubject = document.getElementById('filter-matiere');

        if (filterStudent) {
            filterStudent.addEventListener('change', this.handleFilter.bind(this));
        }
        if (filterSubject) {
            filterSubject.addEventListener('change', this.handleFilter.bind(this));
        }

        // Gestionnaire des actions sur les notes
        if (this.gradesList) {
            this.gradesList.addEventListener('click', async (e) => {
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
        if (!grades || grades.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5">Aucune note enregistrée</td>';
            this.gradesList.appendChild(emptyRow);
            return;
        }

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

    async handleFilter() {
        try {
            const studentFilter = document.getElementById('filter-etudiant').value;
            const subjectFilter = document.getElementById('filter-matiere').value;
            
            const allGrades = await this.loadAllGrades();
            let filteredGrades = allGrades;

            // Appliquer les filtres
            if (studentFilter) {
                filteredGrades = filteredGrades.filter(grade => 
                    grade.studentId === studentFilter
                );
            }
            
            if (subjectFilter) {
                filteredGrades = filteredGrades.filter(grade => 
                    grade.subjectId === subjectFilter
                );
            }

            // Actualiser l'affichage
            this.displayGrades(filteredGrades);
            this.updateStatistics(filteredGrades);
        } catch (error) {
            console.error('Error filtering grades:', error);
            this.showNotification('Erreur lors du filtrage des notes', 'error');
        }
    }
}
