document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des données
    let data = {
        colleges: [],
        departements: [],
        enseignants: [],
        etudiants: [],
        matieres: [],
        notes: []
    };

    // Initialisation
    const initialize = () => {
        DataManager.loadData();
        UIManager.initializeForms();
        UIManager.initializeTables();
        UIManager.setupPrintButtons();
        UIManager.initializeDetailViews();
        UIManager.updateAverages();
    };

    initialize();
});
