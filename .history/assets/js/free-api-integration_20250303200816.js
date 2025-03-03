// Open Library
async function fetchOpenLibrary(searchTerm = 'education') {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchTerm)}&limit=3`);
        const data = await response.json();
        displayOpenLibrary(data.docs);
    } catch (error) {
        console.error('Error fetching Open Library books:', error);
    }
}

// Wikipedia API 
async function fetchWikipediaArticles(searchTerm = 'Mathematiques') {
    try {
        const response = await fetch(
            `https://fr.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&srlimit=3`
        );
        const data = await response.json();
        displayWikipediaArticles(data.query.search);
    } catch (error) {
        console.error('Error fetching Wikipedia articles:', error);
    }
}

// Updated Quotes
async function fetchQuotes() {
    try {
        const response = await fetch('https://api.quotable.io/quotes/random?limit=3&tags=education,knowledge,wisdom');
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid response from Quotes API');
        }
        
        const formattedQuotes = data.map(quote => ({
            content: quote.content,
            author: quote.author
        }));
        
        displayQuotes(formattedQuotes);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        // Fallback quotes in case API fails
        const fallbackQuotes = [
            {
                content: "L'éducation est l'arme la plus puissante pour changer le monde.",
                author: "Nelson Mandela"
            },
            {
                content: "Le savoir est la seule matière qui s'accroît quand on la partage.",
                author: "Socrate"
            },
            {
                content: "Apprendre sans réfléchir est vain. Réfléchir sans apprendre est dangereux.",
                author: "Confucius"
            }
        ];
        displayQuotes(fallbackQuotes);
    }
}

function displayOpenLibrary(books) {
    const container = document.getElementById('open-library-content');
    if (!books || books.length === 0) {
        container.innerHTML = '<p>Aucun résultat trouvé</p>';
        return;
    }
    container.innerHTML = books.map(book => `
        <div class="book-item">
            <h4>${book.title}</h4>
            <p>Par: ${book.author_name ? book.author_name[0] : 'Auteur Inconnu'}</p>
            <a href="https://openlibrary.org${book.key}" target="_blank">Plus d'infos</a>
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

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('resourceSearchForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    // Initial load
    fetchOpenLibrary();
    fetchWikipediaArticles();
    fetchQuotes();

    // Search handling
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            fetchOpenLibrary(searchTerm);
            fetchWikipediaArticles(searchTerm);
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                fetchOpenLibrary(searchTerm);
                fetchWikipediaArticles(searchTerm);
            }
            e.preventDefault();
        }
    });
});
