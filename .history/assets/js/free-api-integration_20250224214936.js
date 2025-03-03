// Open Library API Integration
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

// Wikipedia
async function fetchWikipediaArticles() {
    try {
        const query = 'education';
        const response = await fetch(
            `https://fr.wikipedia.org/w/api.php?origin=*&action=query&list=search&srsearch=${query}&format=json`
        );
        const data = await response.json();
        displayWikipediaArticles(data.query.search);
    } catch (error) {
        console.error('Error fetching Wikipedia articles:', error);
    }
}

async function fetchQuotes() {
    try {
        const response = await fetch('https://api.quotable.io/quotes/random?tags=education,knowledge&limit=3');
        const data = await response.json();
        displayQuotes(data);
    } catch (error) {
        console.error('Error fetching quotes:', error);
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
