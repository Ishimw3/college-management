const API_KEY = '387ac15cc2db53f9a5c30f7d5fff42f0';

export class WeatherManager {
    constructor() {
        this.getWeather();
    }

    async getWeather() {
        try {
            // Bujumbura coordinates
            const lat = -3.3822;
            const lon = 29.3644;
            
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
            const data = await response.json();

            this.updateUI(data);
        } catch (error) {
            console.error('Erreur lors de la récupération de la météo:', error);
        }
    }

    updateUI(data) {
        document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = data.weather[0].description;
        document.getElementById('location').textContent = 'Bujumbura, Burundi';
        document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    }
}
