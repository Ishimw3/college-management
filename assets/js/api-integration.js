// Coursera API Integration
async function fetchCourseraCourses() {
    try {
        const response = await fetch(`https://api.coursera.org/api/courses.v1?fields=name,description&limit=3`, {
            headers: { 'Authorization': `Bearer ${API_CONFIG.COURSERA_API}` }
        });
        const data = await response.json();
        displayCourseraCourses(data);
    } catch (error) {
        console.error('Error fetching Coursera courses:', error);
    }
}

// YouTube Educational Content
async function fetchYouTubeVideos(query = 'educational tutorials') {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=3&type=video&key=${API_CONFIG.YOUTUBE_DATA_API}`
        );
        const data = await response.json();
        displayYouTubeVideos(data.items);
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
    }
}

// Google Books API Integration
async function fetchGoogleBooks(subject = 'education') {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&maxResults=3&key=${API_CONFIG.GOOGLE_BOOKS_API}`
        );
        const data = await response.json();
        displayGoogleBooks(data.items);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Display Functions
function displayCourseraCourses(courses) {
    const container = document.getElementById('coursera-content');
    container.innerHTML = courses.elements.map(course => `
        <div class="course-item">
            <h4>${course.name}</h4>
            <p>${course.description.substring(0, 100)}...</p>
        </div>
    `).join('');
}

function displayYouTubeVideos(videos) {
    const container = document.getElementById('youtube-content');
    container.innerHTML = videos.map(video => `
        <div class="video-item">
            <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
            <h4>${video.snippet.title}</h4>
        </div>
    `).join('');
}

function displayGoogleBooks(books) {
    const container = document.getElementById('books-content');
    container.innerHTML = books.map(book => `
        <div class="book-item">
            <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}">
            <h4>${book.volumeInfo.title}</h4>
            <p>${book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
        </div>
    `).join('');
}

// Initialize API calls
document.addEventListener('DOMContentLoaded', () => {
    fetchCourseraCourses();
    fetchYouTubeVideos();
    fetchGoogleBooks();
});
