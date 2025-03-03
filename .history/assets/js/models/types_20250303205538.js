// Define interfaces for type checking

export const CollectionNames = {
    COLLEGES: 'colleges',
    DEPARTMENTS: 'departments',
    TEACHERS: 'teachers',
    STUDENTS: 'students',
    SUBJECTS: 'subjects',
    GRADES: 'grades'
};

export const validateCollege = (data) => {
    const required = ['name', 'website'];
    return required.every(field => data[field]);
};

export const validateDepartment = (data) => {
    const required = ['name', 'collegeId', 'responsibleTeacherId'];
    return required.every(field => data[field]);
};

export const validateTeacher = (data) => {
    const required = ['firstName', 'lastName', 'email', 'departmentId', 'startDate'];
    return required.every(field => data[field]);
};

export const validateStudent = (data) => {
    const required = ['firstName', 'lastName', 'email', 'enrollmentYear'];
    return required.every(field => data[field]);
};

export const validateGrade = (data) => {
    const required = ['studentId', 'subjectId', 'value', 'date'];
    return required.every (field => data[field]);
};
