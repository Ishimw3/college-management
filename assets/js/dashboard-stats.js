import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    Timestamp 
} from 'firebase/firestore';

export class DashboardStats {
    constructor(db) {
        this.db = db;
        this.initializeStats();
    }

    async initializeStats() {
        try {
            await Promise.all([
                this.updateAverageGrade(),
                this.loadRecentActivities()
            ]);
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
        }
    }

    async updateAverageGrade() {
        try {
            const gradesRef = collection(this.db, 'grades');
            const gradesSnapshot = await getDocs(gradesRef);
            
            let totalGrade = 0;
            let count = 0;
            
            gradesSnapshot.forEach(doc => {
                const data = doc.data();
                const grade = Number(data.grade);
                if (!isNaN(grade)) {
                    totalGrade += grade;
                    count++;
                }
            });

            const average = count > 0 ? (totalGrade / count).toFixed(2) : '0.00';
            const element = document.querySelector('[data-stat="averageGrade"]');
            if (element) element.textContent = average;
            
            const progress = document.getElementById('gradeProgress');
            if (progress) {
                progress.style.width = `${(average / 20) * 100}%`;
            }
        } catch (error) {
            console.error('Erreur lors du calcul de la moyenne:', error);
            throw error;
        }
    }

    async loadRecentActivities() {
        try {
            const activityList = document.getElementById('activityList');
            if (!activityList) return;

            const activities = [];
            
            // Notes récentes
            const gradesQuery = query(
                collection(this.db, 'grades'),
                orderBy('timestamp', 'desc'),
                limit(3)
            );
            
            const [gradesSnapshot, studentsSnapshot] = await Promise.all([
                getDocs(gradesQuery),
                getDocs(query(
                    collection(this.db, 'students'),
                    orderBy('createdAt', 'desc'),
                    limit(3)
                ))
            ]);

            gradesSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.studentName && data.grade) {
                    activities.push({
                        type: 'note',
                        text: `Note ajoutée pour ${data.studentName}: ${data.grade}/20`,
                        timestamp: data.timestamp instanceof Timestamp ? 
                            data.timestamp.toDate() : new Date()
                    });
                }
            });

            studentsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.firstName && data.lastName) {
                    activities.push({
                        type: 'student',
                        text: `Nouvel étudiant inscrit: ${data.firstName} ${data.lastName}`,
                        timestamp: data.createdAt instanceof Timestamp ? 
                            data.createdAt.toDate() : new Date()
                    });
                }
            });

            activities.sort((a, b) => b.timestamp - a.timestamp);

            activityList.innerHTML = activities.length ? activities.map(activity => `
                <li class="activity-item">
                    <i class="fas ${activity.type === 'note' ? 'fa-graduation-cap' : 'fa-user-plus'}"></i>
                    <span>${activity.text}</span>
                </li>
            `).join('') : '<li class="no-activity">Aucune activité récente</li>';

        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            throw error;
        }
    }
}
