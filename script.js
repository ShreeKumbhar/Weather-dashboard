// Elements from the DOM
const userLocationInput = document.getElementById("userlocation");
const weatherIcon = document.querySelector(".weatherIcon");
const temperatureElement = document.querySelector(".temperature");
const feelslikeElement = document.querySelector(".feelslike");
const descriptionElement = document.querySelector(".description");
const dateElement = document.querySelector(".date");
const cityElement = document.querySelector(".city");
const humidityElement = document.getElementById("Hvalue");
const windSpeedElement = document.getElementById("Wvalue");
const sunriseElement = document.getElementById("SRvalue");
const sunsetElement = document.getElementById("SSvalue");
const cloudsElement = document.getElementById("Cvalue");
const pressureElement = document.getElementById("Pvalue");
const unitSelect = document.getElementById("converter");
const errorMessage = document.getElementById("error-message"); 
const forecastContainer = document.querySelector(".forecast");
const apiKey = "936a8fe4b67e57d5c9aa7ff10e887460"; 

// Function for fetching weather data
async function getWeatherData(city) {
    try {
        errorMessage.style.display = "none";

        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        if (!currentResponse.ok) throw new Error("City not found");
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        if (!forecastResponse.ok) throw new Error("Forecast data not available");
        const forecastData = await forecastResponse.json();

        displayWeatherData(currentData);
        displayForecast(forecastData);

    } catch (error) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `Error: ${error.message}. Please check the city name and try again.`;
    }
}

// Function to convert Celsius to Fahrenheit
function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Function to display weather data in the UI
function displayWeatherData(data) {
    const tempCelsius = data.main.temp;
    const feelsLikeCelsius = data.main.feels_like;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const selectedUnit = unitSelect.value;

    const temp = selectedUnit === "°F" ? convertToFahrenheit(tempCelsius) : tempCelsius;
    const feelsLike = selectedUnit === "°F" ? convertToFahrenheit(feelsLikeCelsius) : feelsLikeCelsius;

    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">`;
    temperatureElement.innerHTML = `${temp.toFixed(1)}${selectedUnit}`;
    feelslikeElement.innerHTML = `Feels Like: ${feelsLike.toFixed(1)}${selectedUnit}`;
    descriptionElement.innerHTML = description.charAt(0).toUpperCase() + description.slice(1);

    const currentDate = new Date();
    dateElement.innerHTML = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    cityElement.innerHTML = `${data.name}, ${data.sys.country}`;

    humidityElement.innerHTML = `${data.main.humidity}%`;
    windSpeedElement.innerHTML = `${data.wind.speed} m/s`;
    sunriseElement.innerHTML = "Sunrise " + new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    sunsetElement.innerHTML = "Sunset " + new Date(data.sys.sunset * 1000).toLocaleTimeString();
    cloudsElement.innerHTML = `${data.clouds.all}%`;
    pressureElement.innerHTML = `${data.main.pressure} hPa`;
}

// Function to display the 5-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = "";
    const forecastList = data.list.filter((item, index) => index % 8 === 0); 
    const selectedUnit = unitSelect.value;

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString();
        let temp = forecast.main.temp;
        if (selectedUnit === "°F") temp = convertToFahrenheit(temp);

        const description = forecast.weather[0].description;
        const iconCode = forecast.weather[0].icon;

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <div class="forecast-date">${day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">
            </div>
            <div class="forecast-temp">${temp.toFixed(1)}${selectedUnit}</div>
            <div class="forecast-description">${description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

// Event listeners
document.querySelector(".fa-magnifying-glass").addEventListener("click", () => {
    const city = userLocationInput.value;
    if (city) getWeatherData(city);
    else {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "Please enter a city name.";
    }
});

unitSelect.addEventListener("change", () => {
    const city = userLocationInput.value;
    if (city) getWeatherData(city);
});

userLocationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") getWeatherData(userLocationInput.value);
});

document.getElementById("geo-icon").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                errorMessage.style.display = "block";
                errorMessage.innerHTML = "Error getting your location. Please enable location services.";
            }
        );
    } else {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "Geolocation is not supported by this browser.";
    }
});

async function fetchWeatherByCoords(lat, lon) {
    try {
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!currentResponse.ok) throw new Error("Weather data not available");
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!forecastResponse.ok) throw new Error("Forecast data not available");
        const forecastData = await forecastResponse.json();

        displayWeatherData(currentData);
        displayForecast(forecastData);

    } catch (error) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `Error: ${error.message}. Please try again later.`;
    }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
    userLocationInput.value = "Mumbai";
    getWeatherData("Mumbai");
});
