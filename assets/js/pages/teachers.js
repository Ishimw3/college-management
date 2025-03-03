import { DatabaseService } from '../services/database.js';

class TeacherManager {
    constructor() {
        this.form = document.querySelector('.form-section form');
        this.teachersList = document.querySelector('tbody');
        this.ficheSection = document.getElementById('fiche');
        this.initializeEventListeners();
        this.loadTeachers();
        this.loadDepartmentsAndSubjects();
    }

    async loadDepartmentsAndSubjects() {
        try {
            const [departments, subjects] = await Promise.all([
                DatabaseService.getDepartments(),
                DatabaseService.getSubjects()
            ]);

            // Remplir le select des départements
            const departmentSelect = document.getElementById('departement');
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentSelect.appendChild(option);
            });

            // Remplir le select des matières
            const subjectSelect = document.getElementById('matiere');
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments and subjects:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }

    async loadTeachers() {
        try {
            const [teachers, departments, subjects] = await Promise.all([
                DatabaseService.getTeachers(),
                DatabaseService.getDepartments(),
                DatabaseService.getSubjects()
            ]);

            // Créer des maps pour un accès rapide aux noms
            const departmentMap = new Map(departments.map(d => [d.id, d.name]));
            const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

            this.teachersList.innerHTML = '';
            teachers.forEach(teacher => this.addTeacherToList(
                teacher,
                departmentMap.get(teacher.departmentId) || 'N/A',
                subjectMap.get(teacher.subjectId) || 'N/A'
            ));
        } catch (error) {
            console.error('Error loading teachers:', error);
            this.showNotification('Erreur lors du chargement des enseignants', 'error');
        }
    }

    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleAddTeacher.bind(this));
        }

        this.teachersList?.addEventListener('click', async (e) => {
            const button = e.target;
            const row = button.closest('tr');
            if (!row) return;

            const teacherId = row.dataset.id;

            if (button.classList.contains('btn-delete')) {
                await this.handleDelete(teacherId, row);
            } else if (button.classList.contains('btn-edit')) {
                this.handleEdit(teacherId);
            } else if (button.classList.contains('btn-view')) {
                await this.handleView(teacherId);
            }
        });
    }

    async handleAddTeacher(event) {
        event.preventDefault();
        const submitButton = this.form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';

        try {
            const teacherData = {
                lastName: this.form.nom.value,
                firstName: this.form.prenom.value,
                phone: this.form.tel.value,
                email: this.form.email.value,
                startDate: this.form.date_fonction.value,
                index: parseInt(this.form.indice.value),
                departmentId: this.form.departement.value,
                subjectId: this.form.matiere.value,
                createdAt: new Date().toISOString()
            };

            const teacherId = await DatabaseService.addTeacher(teacherData);
            this.addTeacherToList({ id: teacherId, ...teacherData });
            this.form.reset();
            this.showNotification('Enseignant ajouté avec succès', 'success');
        } catch (error) {
            console.error('Error adding teacher:', error);
            this.showNotification('Erreur lors de l\'ajout de l\'enseignant', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Ajouter l\'enseignant';
        }
    }

    async handleView(teacherId) {
        try {
            const teacher = await DatabaseService.getTeacherById(teacherId);
            if (!teacher) return;

            const [department, subject] = await Promise.all([
                DatabaseService.getDepartmentById(teacher.departmentId),
                DatabaseService.getSubjectById(teacher.subjectId)
            ]);

            // Remplir la fiche signalétique
            document.getElementById('fiche-nom').textContent = teacher.lastName;
            document.getElementById('fiche-prenom').textContent = teacher.firstName;
            document.getElementById('fiche-tel').textContent = teacher.phone;
            document.getElementById('fiche-email').textContent = teacher.email;
            document.getElementById('fiche-date').textContent = new Date(teacher.startDate).toLocaleDateString();
            document.getElementById('fiche-indice').textContent = teacher.index;
            document.getElementById('fiche-departement').textContent = department?.name || 'N/A';
            document.getElementById('fiche-matiere').textContent = subject?.name || 'N/A';

            this.ficheSection.style.display = 'block';
            this.ficheSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading teacher details:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }

    addTeacherToList(teacher, departmentName, subjectName) {
        const row = document.createElement('tr');
        row.dataset.id = teacher.id;
        row.innerHTML = `
            <td>${teacher.lastName}</td>
            <td>${teacher.firstName}</td>
            <td>${departmentName}</td>
            <td>${subjectName}</td>
            <td>
                <span class="contact-info">
                    Tél: ${teacher.phone}<br>
                    Email: ${teacher.email}
                </span>
            </td>
            <td>
                <button class="btn-view">Voir fiche</button>
                <button class="btn-edit">Modifier</button>
                <button class="btn-delete">Supprimer</button>
            </td>
        `;
        this.teachersList.appendChild(row);
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
    new TeacherManager();
});