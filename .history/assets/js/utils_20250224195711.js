// ...existing code...

const DataManager = {
    // Stockage local
    saveData() {
        localStorage.setItem('collegeData', JSON.stringify(data));
    },

    loadData() {
        const savedData = localStorage.getItem('collegeData');
        if (savedData) {
            data = JSON.parse(savedData);
        }
    },

    // CRUD Opérations génériques
    add(type, item) {
        item.id = Date.now(); // Simple ID unique
        data[type].push(item);
        this.saveData();
        return item;
    },

    update(type, id, updates) {
        const index = data[type].findIndex(item => item.id === id);
        if (index !== -1) {
            data[type][index] = { ...data[type][index], ...updates };
            this.saveData();
            return true;
        }
        return false;
    },

    delete(type, id) {
        data[type] = data[type].filter(item => item.id !== id);
        this.saveData();
    },

    get(type, id) {
        return data[type].find(item => item.id === id);
    },

    getAll(type) {
        return data[type];
    }
};

// ...existing code...
