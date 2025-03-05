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
async function fetchQuotes() {
    try {
        const response = await fetch('https://api.quotable.io/quotes/random?limit=3&tags=education,knowledge', {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid response format');
        }

        displayQuotes(data);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        displayFallbackQuotes();
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
    
    container.innerHTML = quotes.map(quote => `
        <div class="quote-item">
            <blockquote>
                <p>"${quote.content}"</p>
                <footer>— ${quote.author}</footer>
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
