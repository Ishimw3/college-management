const UIManager = {
    // Gestion des formulaires
    initializeForms() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Détermine le type de formulaire
                if (form.closest('#colleges-form')) {
                    this.handleCollegeSubmit(data);
                } else if (form.closest('#enseignants-form')) {
                    this.handleEnseignantSubmit(data);
                } // etc...
                
                form.reset();
            });
        });
    },

    // Gestion des tableaux
    initializeTables() {
        // Tri des colonnes
        document.querySelectorAll('th').forEach(header => {
            header.addEventListener('click', () => {
                const table = header.closest('table');
                const index = Array.from(header.parentNode.children).indexOf(header);
                this.sortTable(table, index);
            });
        });

        // Filtres
        document.querySelectorAll('.filters select').forEach(filter => {
            filter.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    },

    // Fonctions d'affichage
    displayAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.querySelector('.container').prepend(alert);
        setTimeout(() => alert.remove(), 3000);
    },

    // Mise à jour des moyennes
    updateAverages() {
        // Moyennes par matière
        const matiereAverages = this.calculateMatiereAverages();
        document.querySelectorAll('.matiere-moyenne').forEach(elem => {
            const matiereId = elem.dataset.matiereId;
            elem.textContent = matiereAverages[matiereId]?.toFixed(2) || 'N/A';
        });

        // Moyennes par département
        const deptAverages = this.calculateDepartementAverages();
        document.querySelectorAll('.dept-moyenne').forEach(elem => {
            const deptId = elem.dataset.deptId;
            elem.textContent = deptAverages[deptId]?.toFixed(2) || 'N/A';
        });
    },

    // Gestion de l'impression
    setupPrintButtons() {
        document.querySelectorAll('.btn-print').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.closest('.card').cloneNode(true);
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <html>
                        <head>
                            <link rel="stylesheet" href="styles.css">
                            <style>
                                body { padding: 20px; }
                                .no-print { display: none; }
                            </style>
                        </head>
                        <body>${content.outerHTML}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            });
        });
    },

    // Gestion des détails
    initializeDetailViews() {
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.closest('tr').dataset.id;
                const type = btn.closest('section').id.replace('-list', '');
                this.showDetails(type, id);
            });
        });
    },

    showDetails(type, id) {
        const item = DataManager.get(type, id);
        if (!item) return;

        const detailSection = document.querySelector(`#${type}-details`);
        if (!detailSection) return;

        // Remplir les détails
        Object.keys(item).forEach(key => {
            const elem = detailSection.querySelector(`#detail-${key}`);
            if (elem) {
                elem.textContent = item[key];
            }
        });

        // Afficher la section
        detailSection.style.display = 'block';
        detailSection.scrollIntoView({ behavior: 'smooth' });
    },

    // Calculs
    calculateMatiereAverages() {
        const averages = {};
        data.matieres.forEach(matiere => {
            const notes = data.notes.filter(n => n.matiereId === matiere.id);
            if (notes.length > 0) {
                averages[matiere.id] = notes.reduce((sum, n) => sum + n.note, 0) / notes.length;
            }
        });
        return averages;
    },

    calculateDepartementAverages() {
        const averages = {};
        data.departements.forEach(dept => {
            const matieres = data.matieres.filter(m => m.departementId === dept.id);
            const notes = [];
            matieres.forEach(matiere => {
                notes.push(...data.notes.filter(n => n.matiereId === matiere.id));
            });
            if (notes.length > 0) {
                averages[dept.id] = notes.reduce((sum, n) => sum + n.note, 0) / notes.length;
            }
        });
        return averages;
    },

    // Utilitaires
    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isNumeric = rows.every(row => 
            !isNaN(row.children[columnIndex].textContent.trim())
        );

        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.trim();
            const bValue = b.children[columnIndex].textContent.trim();
            
            if (isNumeric) {
                return parseFloat(aValue) - parseFloat(bValue);
            }
            return aValue.localeCompare(bValue);
        });

        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    },

    applyFilters() {
        const filters = {};
        document.querySelectorAll('.filters select').forEach(filter => {
            if (filter.value) {
                filters[filter.id.replace('filter-', '')] = filter.value;
            }
        });

        document.querySelectorAll('tbody tr').forEach(row => {
            let show = true;
            Object.entries(filters).forEach(([key, value]) => {
                if (row.dataset[key] !== value) {
                    show = false;
                }
            });
            row.style.display = show ? '' : 'none';
        });
    }
};
