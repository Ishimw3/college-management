// Open Library
async function fetchOpenLibrary() {
    try {
        const subject = 'education';
        const response = await fetch(`https://openlibrary.org/subjects/${subject}.json?limit=3`);
        const data = await response.json();
        displayOpenLibrary(data.works);
    } catch (error) {
        console.error('Error fetching Open Library books:', error);
    }
}

// Wikipedia API - updated to limit results to 5
async function fetchWikipediaArticles() {
    try {
        const query = 'Mathematiques';
        const response = await fetch(
            `https://fr.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${query}&format=json&srlimit=5`
        );
        const data = await response.json();
        displayWikipediaArticles(data.query.search);
    } catch (error) {
        console.error('Error fetching Wikipedia articles:', error);
    }
}

// Updated Quotes API to use a different endpoint
async function fetchQuotes() {
    try {
        const quotes = [
            {
                content: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde.",
                author: "Nelson Mandela"
            },
            {
                content: "La connaissance est le seul bien qui s'accroît quand on le partage.",
                author: "Socrate"
            },
            {
                content: "L'éducation est la clé pour ouvrir la porte d'or de la liberté.",
                author: "George Washington Carver"
            }
        ];
        displayQuotes(quotes);
    } catch (error) {
        console.error('Error with quotes:', error);
    }
}

// Display Functions
function displayOpenLibrary(books) {
    const container = document.getElementById('open-library-content');
    container.innerHTML = books.map(book => `
        <div class="book-item">
            <h4>${book.title}</h4>
            <p>Par: ${book.authors[0]?.name || 'Auteur Inconnu'}</p>
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
    container.innerHTML = quotes.map(quote => `
        <div class="quote-item">
            <blockquote>
                "${quote.content}"
                <footer>— ${quote.author}</footer>
            </blockquote>
        </div>
    `).join('');
}


document.addEventListener('DOMContentLoaded', () => {
    fetchOpenLibrary();
    fetchWikipediaArticles();
    fetchQuotes();
});

setInterval(() => {
    fetchOpenLibrary();
    fetchWikipediaArticles();
    fetchQuotes();
}, 300000);
