document.addEventListener('DOMContentLoaded', () => {
    // Remove the local data initialization since we're using Firebase
    const initialize = () => {
        UIManager.initializeForms();
        UIManager.initializeTables();
        UIManager.setupPrintButtons();
        UIManager.initializeDetailViews();
    };

    initialize();
});
