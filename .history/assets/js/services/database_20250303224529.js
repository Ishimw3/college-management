import { db } from '../firebase-config.js';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    getDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export class DatabaseService {
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
            const querySnapshot = await getDocs(collection(db, "colleges"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting departments:", error);
            throw error;
        }
    }

    static async getDepartments() {
        try {
            const querySnapshot = await getDocs(collection(db, "departments"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting teachers:", error);
            throw error;
        }
    }

    static async getTeachers() {
        try {
            const querySnapshot = await getDocs(collection(db, "teachers"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting all teachers:", error);
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting grades:", error);
            throw error;
        }
    }

    static async getAllGrades() {
        try {
            const querySnapshot = await getDocs(collection(db, "grades"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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
