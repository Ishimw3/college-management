const API_KEY = '387ac15cc2db53f9a5c30f7d5fff42f0';

export class WeatherManager {
    constructor() {
        console.log('WeatherManager initialized');
        this.getWeather();
    }

    // Map OpenWeather icons to Font Awesome icons
    getWeatherIcon(weatherCode) {
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };
        return iconMap[weatherCode] || 'fa-sun';
    }

    async getWeather() {
        try {
            console.log('Fetching weather data...');
            const lat = -3.3822;
            const lon = 29.3644;
            
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Weather data received:', data);
            this.updateUI(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError();
        }
    }

    updateUI(data) {
        const iconElement = document.getElementById('weather-icon');
        const tempElement = document.getElementById('temperature');
        const descElement = document.getElementById('description');

        if (!iconElement || !tempElement || !descElement) {
            console.error('Weather elements not found in DOM');
            return;
        }

        console.log('Updating UI with weather data');
        
        // Update temperature
        tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        
        // Update description
        descElement.textContent = data.weather[0].description;
        
        // Update icon
        iconElement.className = '';
        iconElement.classList.add('fas', this.getWeatherIcon(data.weather[0].icon), 'fa-2x');
    }

    showError() {
        const tempElement = document.getElementById('temperature');
        const descElement = document.getElementById('description');
        const iconElement = document.getElementById('weather-icon');

        if (tempElement) tempElement.textContent = 'N/A';
        if (descElement) descElement.textContent = 'Erreur de chargement';
        if (iconElement) {
            iconElement.className = '';
            iconElement.classList.add('fas', 'fa-exclamation-triangle', 'fa-2x');
        }
    }
}
