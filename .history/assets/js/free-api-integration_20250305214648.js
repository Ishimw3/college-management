// Updated API endpoints with proper CORS handling
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Initialize APIs
function initializeAPIs() {
    fetchOpenLibrary('education');
    fetchWikipediaArticles('education');
    fetchQuotes();
}

async function fetchOpenLibrary(searchTerm = 'education') {
    try {
        const container = document.getElementById('open-library-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=3`);
        const data = await response.json();
        
        if (!data.docs || !Array.isArray(data.docs)) {
            throw new Error('Invalid response from Open Library');
        }
        
        displayOpenLibrary(data.docs);
    } catch (error) {
        console.error('Open Library Error:', error);
        displayError('open-library-content', 'Impossible de charger les livres');
    }
}

async function fetchWikipediaArticles(searchTerm = 'education') {
    try {
        const container = document.getElementById('wikipedia-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        const params = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: searchTerm,
            format: 'json',
            srlimit: '3',
            origin: '*'
        });

        const response = await fetch(`https://fr.wikipedia.org/w/api.php?${params}`);
        const data = await response.json();
        
        if (!data.query?.search) {
            throw new Error('Invalid Wikipedia response');
        }
        
        displayWikipediaArticles(data.query.search);
    } catch (error) {
        console.error('Wikipedia Error:', error);
        displayError('wikipedia-content', 'Impossible de charger les articles');
    }
}

// Quotes API with better fallback
const FALLBACK_QUOTES = [
    {
        content: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde.",
        author: "Nelson Mandela"
    },
    {
        content: "Le plus grand obstacle à l'apprentissage est ce que l'on croit déjà savoir.",
        author: "Lao Tseu"
    },
    {
        content: "L'éducation ne consiste pas à remplir un seau mais à allumer un feu.",
        author: "William Butler Yeats"
    }
];

async function fetchQuotes() {
    try {
        const container = document.getElementById('quotes-content');
        if (!container) return;
        
        container.innerHTML = '<div class="loading">Chargement...</div>';
        
        // Try fetching from multiple quote APIs
        const apis = [
            'https://api.quotable.io/quotes/random?limit=3&tags=education,knowledge',
            'https://type.fit/api/quotes'
        ];

        for (const apiUrl of apis) {
            try {
                const response = await fetch(apiUrl, {
                    headers: { 'Accept': 'application/json' },
                    timeout: 5000 // 5 second timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let quotes;
                const data = await response.json();

                // Handle different API response formats
                if (Array.isArray(data)) {
                    quotes = data.slice(0, 3).map(quote => ({
                        content: quote.text || quote.content,
                        author: quote.author || 'Anonyme'
                    }));
                }

                if (quotes && quotes.length > 0) {
                    displayQuotes(quotes);
                    return;
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${apiUrl}:`, error);
                continue;
            }
        }

        // If all APIs fail, use fallback quotes
        throw new Error('All quote APIs failed');

    } catch (error) {
        console.error('Error fetching quotes:', error);
        displayQuotes(FALLBACK_QUOTES);
    }
}

// Add error display function
function displayError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="api-error">
                <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                <button onclick="retryLoad('${containerId}')">Réessayer</button>
            </div>
        `;
    }
}

// Add retry function
function retryLoad(containerId) {
    switch(containerId) {
        case 'open-library-content':
            fetchOpenLibrary(document.getElementById('searchInput')?.value || 'education');
            break;
        case 'wikipedia-content':
            fetchWikipediaArticles(document.getElementById('searchInput')?.value || 'education');
            break;
        case 'quotes-content':
            fetchQuotes();
            break;
    }
}

// Display functions
function displayOpenLibrary(books) {
    const container = document.getElementById('open-library-content');
    if (!container) return;
    
    if (!books || books.length === 0) {
        container.innerHTML = '<p>Aucun résultat trouvé</p>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-item">
            <h4>${book.title}</h4>
            <p>Par: ${book.author_name?.[0] || 'Auteur Inconnu'}</p>
            <a href="https://openlibrary.org${book.key}" target="_blank" rel="noopener">Plus d'infos</a>
        </div>
    `).join('');
}

function displayWikipediaArticles(articles) {
    const container = document.getElementById('wikipedia-content');
    container.innerHTML = articles.map(article => `
        <div class="wiki-item">
            <h4>${article.title}</h4>
            <p>${article.snippet.replace(/<\/?span[^>]*>/g, '')}...</p>
            <a href="https://fr.wikipedia.org/wiki/${encodeURIComponent(article.title)}" 
               target="_blank">Lire plus</a>
        </div>
    `).join('');
}

function displayQuotes(quotes) {
    const container = document.getElementById('quotes-content');
    if (!container) return;

    if (!quotes || quotes.length === 0) {
        container.innerHTML = '<p>Aucune citation disponible</p>';
        return;
    }

    container.innerHTML = quotes.map(quote => `
        <div class="quote-item">
            <blockquote>
                <p>"${quote.content}"</p>
                <footer>— ${quote.author || 'Anonyme'}</footer>
            </blockquote>
        </div>
    `).join('');
}

// Initialize search functionality
function initializeSearch() {
    const form = document.getElementById('resourceSearchForm');
    const input = document.getElementById('searchInput');
    
    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = input.value.trim();
            if (searchTerm) {
                fetchOpenLibrary(searchTerm);
                fetchWikipediaArticles(searchTerm);
            }
        });

        // Add input event listener for real-time search (optional)
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = input.value.trim();
                if (searchTerm) {
                    fetchOpenLibrary(searchTerm);
                    fetchWikipediaArticles(searchTerm);
                }
            }, 500);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add the new styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles + additionalStyles;
    document.head.appendChild(styleSheet);

    console.log('Initializing APIs and search...');
    initializeAPIs();
    initializeSearch();
});

// Add loading indicator styles to your CSS
const styles = `
    .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .loading::after {
        content: '...';
        animation: dots 1.5s steps(4, end) infinite;
    }
    
    @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60% { content: '...'; }
        80%, 100% { content: ''; }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Add to your CSS styles
const additionalStyles = `
    .quote-item {
        background: #f8f9fa;
        padding: 1.5rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        border-left: 4px solid var(--sky-blue);
    }

    .quote-item blockquote {
        margin: 0;
        font-style: italic;
    }

    .quote-item footer {
        margin-top: 1rem;
        text-align: right;
        color: var(--light-charcoal);
    }
`;
