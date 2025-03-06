import { auth, db } from '../firebase-config.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where,
    limit,
    startAfter,
    orderBy,
    enableNetwork,
    disableNetwork,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export class DatabaseService {
    static ITEMS_PER_PAGE = 10;
    static listeners = new Map();

    constructor(collectionName) {
        this.collectionName = collectionName;
        this.listeners = new Map();
    }

    checkAuth() {
        if (!auth.currentUser) {
            throw new Error('User must be authenticated');
        }
    }

    async add(data) {
        try {
            this.checkAuth();
            const docRef = await addDoc(collection(db, this.collectionName), {
                ...data,
                createdBy: auth.currentUser.uid,
                createdAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (error) {
            console.error(`Error adding ${this.collectionName}:`, error);
            throw error;
        }
    }

    handleError(error) {
        if (error.code === 'permission-denied') {
            console.error('Permission denied. Please check if you are logged in.');
            // Optionally redirect to login
            window.location.href = '/college-management/login.html';
        }
        throw error;
    }

    // Network status management
    static async goOffline() {
        await disableNetwork(db);
        console.log('App is offline');
    }

    static async goOnline() {
        await enableNetwork(db);
        console.log('App is online');
    }

    // Add real-time listeners with cleanup
    static addCollectionListener(collectionName, callback) {
        const q = query(collection(db, collectionName), limit(100));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(items);
        });
        this.listeners.set(collectionName, unsubscribe);
    }

    static removeListener(collectionName) {
        const unsubscribe = this.listeners.get(collectionName);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(collectionName);
        }
    }

    // Colleges
    static async addCollege(collegeData) {
        try {
            const docRef = await addDoc(collection(db, "colleges"), collegeData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding college:", error);
            throw error;
        }
    }

    static async getColleges() {
        try {
            const querySnapshot = await getDocs(query(
                collection(db, "colleges"),
                orderBy("name"),
                limit(this.ITEMS_PER_PAGE)
            ));
            const colleges = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched colleges:', colleges); // Debug
            return colleges;
        } catch (error) {
            console.error("Error getting colleges:", error);
            throw error;
        }
    }

    // Departments
    static async addDepartment(departmentData) {
        try {
            const docRef = await addDoc(collection(db, "departments"), departmentData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding department:", error);
            throw error;
        }
    }

    static async getDepartmentsByCollege(collegeId) {
        try {
            const q = query(collection(db, "departments"), where("collegeId", "==", collegeId));
            const querySnapshot = await getDocs(q);
            const departments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched departments by college:', departments); // Debug
            return departments;
        } catch (error) {
            console.error("Error getting departments:", error);
            throw error;
        }
    }

    static async getDepartments() {
        try {
            const querySnapshot = await getDocs(query(
                collection(db, "departments"),
                orderBy("createdAt", "desc"),
                limit(this.ITEMS_PER_PAGE)
            ));
            const departments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched departments:', departments); // Debug
            return departments;
        } catch (error) {
            console.error("Error getting all departments:", error);
            throw error;
        }
    }

    static async getDepartmentById(departmentId) {
        try {
            const docRef = doc(db, "departments", departmentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting department:", error);
            throw error;
        }
    }

    // Teachers
    static async addTeacher(teacherData) {
        try {
            const docRef = await addDoc(collection(db, "teachers"), teacherData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding teacher:", error);
            throw error;
        }
    }

    static async getTeachersByDepartment(departmentId) {
        try {
            const q = query(collection(db, "teachers"), where("departmentId", "==", departmentId));
            const querySnapshot = await getDocs(q);
            const teachers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched teachers by department:', teachers); // Debug
            return teachers;
        } catch (error) {
            console.error("Error getting teachers:", error);
            throw error;
        }
    }

    static async getTeachers() {
        try {
            const querySnapshot = await getDocs(collection(db, "teachers"));
            const teachers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched teachers:', teachers); // Debug
            return teachers;
        } catch (error) {
            console.error("Error getting teachers:", error);
            throw error;
        }
    }

    static async getTeacherById(teacherId) {
        try {
            const docRef = doc(db, "teachers", teacherId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting teacher:", error);
            throw error;
        }
    }

    // Students
    static async addStudent(studentData) {
        try {
            const docRef = await addDoc(collection(db, "students"), studentData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding student:", error);
            throw error;
        }
    }

    static async getStudents() {
        try {
            const querySnapshot = await getDocs(collection(db, "students"));
            const students = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched students:', students); // Debug
            return students;
        } catch (error) {
            console.error("Error getting all students:", error);
            throw error;
        }
    }

    static async getStudentById(studentId) {
        try {
            const docRef = doc(db, "students", studentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting student:", error);
            throw error;
        }
    }

    // Grades
    static async addGrade(gradeData) {
        try {
            const docRef = await addDoc(collection(db, "grades"), gradeData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding grade:", error);
            throw error;
        }
    }

    static async getStudentGrades(studentId) {
        try {
            const q = query(collection(db, "grades"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            const grades = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched grades by student:', grades); // Debug
            return grades;
        } catch (error) {
            console.error("Error getting grades:", error);
            throw error;
        }
    }

    static async getAllGrades() {
        try {
            const querySnapshot = await getDocs(collection(db, "grades"));
            const grades = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched all grades:', grades); // Debug
            return grades;
        } catch (error) {
            console.error("Error getting all grades:", error);
            throw error;
        }
    }

    // Subjects methods
    static async addSubject(subjectData) {
        try {
            const docRef = await addDoc(collection(db, "subjects"), subjectData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding subject:", error);
            throw error;
        }
    }

    static async getSubjects() {
        try {
            const querySnapshot = await getDocs(collection(db, "subjects"));
            const subjects = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched subjects:', subjects); // Debug
            return subjects;
        } catch (error) {
            console.error("Error getting subjects:", error);
            throw error;
        }
    }

    static async getSubjectById(subjectId) {
        try {
            const docRef = doc(db, "subjects", subjectId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting subject:", error);
            throw error;
        }
    }

    // Generic update and delete methods
    static async updateDocument(collectionName, docId, data) {
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, data);
            return true;
        } catch (error) {
            console.error(`Error updating ${collectionName}:`, error);
            throw error;
        }
    }

    static async deleteDocument(collectionName, docId) {
        try {
            await deleteDoc(doc(db, collectionName, docId));
            return true;
        } catch (error) {
            console.error(`Error deleting ${collectionName}:`, error);
            throw error;
        }
    }

    // Statistics methods
    static async getCollegeStatistics(collegeId) {
        try {
            const departments = await this.getDepartmentsByCollege(collegeId);
            const teachersPromises = departments.map(dept => this.getTeachersByDepartment(dept.id));
            const teachers = (await Promise.all(teachersPromises)).flat();
            
            return {
                departmentsCount: departments.length,
                teachersCount: teachers.length,
                // Add more statistics as needed
            };
        } catch (error) {
            console.error("Error getting statistics:", error);
            throw error;
        }
    }
}
