// global fields/constants
const isCelsius = true;
const celsiusSymbol = '℃'
const fahrenheitSymbol = '\u{2109}';

// dom elements
const locationInput = document.getElementById('location-input');
const locationForm = document.getElementById('location-form');
const locationCard =
  document.querySelector('#current-weather-container .location-card');
const iconSection =
  document.querySelector('#current-weather-container .icon-section');
  const currentWeatherCard = 
  document.querySelector('#current-weather-container .weather-card');
const currentTemperatureSection =
  document.querySelector('#current-weather-container .temperature-section');
const miscSection = 
  document.querySelector('#current-weather-container .other-data-section');

// ============== weather data fetch and process functions =================

async function fetchWeather(location) {
  const api_key = 'cb860b1f8539f7a914fba1442263cc0c';
  const findLimit = 1;
  const units = isCelsius ? 'metric' : 'imperial';
  const coordsResponse = 
    await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=${findLimit}&appid=${api_key}`,  {mode: 'cors'});
  const coordsData = await coordsResponse.json();
  const lat = coordsData[0].lat;
  const lon = coordsData[0].lon;
  const country = coordsData[0].country;
  const response = 
    await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&APPID=${api_key}`, {mode: 'cors'});
  const weatherData = await response.json();
  console.log({weatherData});
  return { weatherData, country };
};

function processWeatherData(data) {
  return {
    time: data.dt,
    temp: data.temp,
    feels_like: data.feels_like,
    humidity: data.humidity,
    wind_speed: data.wind_speed,
    weather: data.weather[0].description,
    icon_id: data.weather[0].icon
  }
};

function getCountry(data) {
  return data.country;
}

function getCurrentWeather(data) {
  return data.weatherData.current;
};

function getDailyWeather(data) {
  return data.weatherData.daily;
};

function getHourlyWeather(data) {
  return data.weatherData.hourly;
};

// ========================= event listeners ===============================

async function onLocationSubmit() {
  const locationValue = locationInput.value;
  const weatherData = await fetchWeather(locationValue);
  const country = getCountry(weatherData);
  const location = `${locationValue}, ${country}`
  const currentWeather = getCurrentWeather(weatherData);
  const dailyWeather = getDailyWeather(weatherData);
  const hourlyWeather = getHourlyWeather(weatherData);
  
  populateCurrentWeatherSection(
    processWeatherData(currentWeather), 
    location
  );
}

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  onLocationSubmit();
});

// ========================= dom modifier functions ========================

function populateLocationCard(data, location) {
  addParagraph(locationCard, location, 'location');
  const currTime = formatDate(data.time);
  addParagraph(locationCard, currTime);
  addParagraph(locationCard, toUppercaseWords(data.weather));
};

function populateWeatherCard(data) {
  const unit = isCelsius ? celsiusSymbol : fahrenheitSymbol;

  addImg(
    iconSection,
    `http://openweathermap.org/img/wn/${data.icon_id}@2x.png`
  )

  addParagraph(
    currentTemperatureSection,
    `${Math.round(data.temp)}${unit}`
  );
  addParagraph(
    miscSection, 
    `Feels like: ${Math.round(data.feels_like)} ${unit}`
  );
  addParagraph(
    miscSection, 
    `Humidity: ${data.humidity}%`
  );
  addParagraph(miscSection, 
    `Wind speed: ${Math.round(toKmH(data.wind_speed))} km/h`
  );
};

function populateCurrentWeatherSection(data, location) {
  resetCurrentWeatherSection();
  populateWeatherCard(data);
  populateLocationCard(data, location);
};

function resetCurrentWeatherSection() {
  locationInput.value = '';
  removeChildren(iconSection);
  removeChildren(currentTemperatureSection);
  removeChildren(miscSection);
  removeChildren(locationCard);
}

// ========================= helpers ===================================

function removeChildren(element) {
  while(element.firstChild) {
    element.removeChild(element.lastChild);
  }
}

function addParagraph(container, text, classes) {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  if (classes) {
    paragraph.className = classes;
  }
  container.appendChild(paragraph);
  return paragraph;
};

function addImg(container, src) {
  const img = document.createElement('img');
  img.src = src;
  container.appendChild(img);
  return img;
}

function toKmH(num) {
  return num / 1000 * 3600;
};

function formatTime(time) {
  const timeArray = time.split(':');
  return `${timeArray[0]}:${timeArray[1]}`;
};

function formatDate(date) {
  const dateArray = Date(date).split(" ");
  return `${dateArray[0]} ${dateArray[1]} ${dateArray[2]} ${formatTime(dateArray[4])}`
};

function toUppercaseWords(str) {
  const strArray = str.split(" ");
  let newStr = '';
  strArray.forEach(s => {
    newStr += s.charAt(0).toUpperCase() + s.slice(1) + " ";
  });
  return newStr.slice(0, newStr.length-1);
}