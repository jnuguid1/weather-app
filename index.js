// dom elements
const locationInput = document.getElementById('location-input');
const locationForm = document.getElementById('location-form');

// ============== weather data fetch and process functions =================

async function fetchWeather(location) {
  const api_key = 'cb860b1f8539f7a914fba1442263cc0c';
  const findLimit = 1;
  const units = 'metric';
  const coordsResponse = 
    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=${findLimit}&appid=${api_key}`,  {mode: 'cors'});
  const coordsData = await coordsResponse.json();
  const lat = coordsData[0].lat;
  const lon = coordsData[0].lon;
  const response = 
    await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&APPID=${api_key}`, {mode: 'cors'});
  const weatherData = await response.json();
  console.log({weatherData});
  return weatherData;
};

function processWeatherData(data) {
  return {
    temp: data.temp,
    feels_like: data.feels_like,
    humidity: data.humidity,
    wind_speed: data.wind_speed,
    weather: data.weather[0].description
  }
};

function getCurrentWeather(data) {
  return data.current;
};

function getDailyWeather(data) {
  return data.daily;
};

function getHourlyWeather(data) {
  return data.hourly;
};

// ========================= event listeners ===============================

async function onLocationSubmit() {
  const location = locationInput.value;
  const weatherData = await fetchWeather(location);
  const currentWeather = getCurrentWeather(weatherData);
  const dailyWeather = getDailyWeather(weatherData);
  const hourlyWeather = getHourlyWeather(weatherData);
  console.log({currentWeather});
}

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  onLocationSubmit();
});

// ========================= dom modifier functions ========================

