// Open Library API with better error handling
async function fetchOpenLibrary(searchTerm = 'education') {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=3`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.docs) {
            throw new Error('Invalid response format');
        }
        
        displayOpenLibrary(data.docs);
    } catch (error) {
        console.error('Error fetching Open Library books:', error);
        displayError('open-library-content', 'Impossible de charger les livres');
    }
}

// Wikipedia API with CORS handling
async function fetchWikipediaArticles(searchTerm = 'education') {
    try {
        const response = await fetch(
            `https://fr.wikipedia.org/w/api.php?` + 
            new URLSearchParams({
                origin: '*',
                action: 'query',
                list: 'search',
                srsearch: searchTerm,
                format: 'json',
                srlimit: '3'
            })
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.query?.search) {
            throw new Error('Invalid response format');
        }

        displayWikipediaArticles(data.query.search);
    } catch (error) {
        console.error('Error fetching Wikipedia articles:', error);
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

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        fetchOpenLibrary();
        fetchWikipediaArticles();
        fetchQuotes();

        const searchForm = document.getElementById('resourceSearchForm');
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput && searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    fetchOpenLibrary(searchTerm);
                    fetchWikipediaArticles(searchTerm);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing APIs:', error);
    }
});
