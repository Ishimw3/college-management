export class DashboardStats {
    constructor(db) {
        this.db = db;
        this.initializeStats();
    }

    async initializeStats() {
        await this.updateAverageGrade();
        await this.loadRecentActivities();
    }

    async updateAverageGrade() {
        try {
            const gradesRef = this.db.collection('grades');
            const gradesSnapshot = await gradesRef.get();
            
            let totalGrade = 0;
            let count = 0;
            
            gradesSnapshot.forEach(doc => {
                const grade = doc.data().grade;
                if (typeof grade === 'number') {
                    totalGrade += grade;
                    count++;
                }
            });

            const average = count > 0 ? (totalGrade / count).toFixed(2) : '0.00';
            document.querySelector('[data-stat="averageGrade"]').textContent = average;
            
            // Mettre à jour la barre de progression
            const progress = document.getElementById('gradeProgress');
            if (progress) {
                progress.style.width = `${(average / 20) * 100}%`;
            }
        } catch (error) {
            console.error('Erreur lors du calcul de la moyenne:', error);
        }
    }

    async loadRecentActivities() {
        try {
            const activityList = document.getElementById('activityList');
            if (!activityList) return;

            // Combiner les activités récentes de différentes collections
            const activities = [];
            
            // Récupérer les dernières notes
            const gradesSnapshot = await this.db.collection('grades')
                .orderBy('timestamp', 'desc')
                .limit(3)
                .get();
            
            gradesSnapshot.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'note',
                    text: `Note ajoutée pour ${data.studentName}: ${data.grade}/20`,
                    timestamp: data.timestamp
                });
            });

            // Récupérer les derniers étudiants ajoutés
            const studentsSnapshot = await this.db.collection('students')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();
            
            studentsSnapshot.forEach(doc => {
                const data = doc.data();
                activities.push({
                    type: 'student',
                    text: `Nouvel étudiant inscrit: ${data.firstName} ${data.lastName}`,
                    timestamp: data.createdAt
                });
            });

            // Trier toutes les activités par date
            activities.sort((a, b) => b.timestamp - a.timestamp);

            // Afficher les activités
            activityList.innerHTML = activities.length ? activities.map(activity => `
                <li class="activity-item">
                    <i class="fas ${activity.type === 'note' ? 'fa-graduation-cap' : 'fa-user-plus'}"></i>
                    <span>${activity.text}</span>
                </li>
            `).join('') : '<li class="no-activity">Aucune activité récente</li>';

        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            document.getElementById('activityList').innerHTML = 
                '<li class="error-activity">Erreur lors du chargement des activités</li>';
        }
    }
}
