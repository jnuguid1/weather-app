// global fields/constants
let isCelsius = true;
const celsiusSymbol = '℃';
const fahrenheitSymbol = '℉';
let unit = celsiusSymbol;

// dom elements
const unitsButton = document.getElementById('units-button');
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
const dailyWeatherContainer = document.getElementById('daily-weather-container');

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

function processWeatherDayData(data) {
  return {
    time: data.dt,
    temp: data.temp.day,
    icon_id: data.weather[0].icon
  }
}

function getCountry(data) {
  return data.country;
}

function getCurrentWeather(data) {
  return data.weatherData.current;
};

function getDailyWeather(data) {
  return data.weatherData.daily.map(dayData => processWeatherDayData(dayData));
};

function getHourlyWeather(data) {
  return data.weatherData.hourly;
};

// ========================= event listeners ===============================

async function onLocationSubmit() {
  try {
    const locationValue = locationInput.value;
    const weatherData = await fetchWeather(locationValue);
    const country = getCountry(weatherData);
    const location = `${locationValue}, ${country}`
    const currentWeather = getCurrentWeather(weatherData);
    const dailyWeather = getDailyWeather(weatherData);
    
    populateCurrentWeatherSection(
      processWeatherData(currentWeather), 
      location
    );
    populateDailyWeatherSection(dailyWeather);
  } catch (error) {
    alert('Could not find this location');
  }
};

function onUnitsChanged() {
  if (unitsButton.textContent === '℉') {
    unitsButton.textContent = '℃';
    unit = '℉';
  } else {
    unitsButton.textContent = '℉';
    unit = '℃';
  }
  isCelsius = !isCelsius;
  if (currentTemperatureSection.children.length !== 0) {
    const currentTemp = document.querySelector('.temperature-section p');
    const currentFeelsLike = document.querySelector('.other-data-section p:first-of-type');
    const dailyWeatherText = document.querySelectorAll('.daily-card p:last-child');
    if (isCelsius) {
      currentTemp.textContent = `${toCelsius(parseInt(currentTemp.textContent))}℃`;
      currentFeelsLike.textContent = `Feels like: ${toCelsius(parseInt(parseFeelsLike(currentFeelsLike.textContent)))}℃`;
      for (let i = 0; i < dailyWeatherText.length; i++) {
        dailyWeatherText[i].textContent = `${toCelsius(parseInt(dailyWeatherText[i].textContent))}℃`;
      }
    } else {
      currentTemp.textContent = `${toFahrenheit(parseInt(currentTemp.textContent))}℉`;
      currentFeelsLike.textContent = `Feels like: ${toFahrenheit(parseInt(parseFeelsLike(currentFeelsLike.textContent)))}℉`;
      for (let i = 0; i < dailyWeatherText.length; i++) {
        dailyWeatherText[i].textContent = `${toFahrenheit(parseInt(dailyWeatherText[i].textContent))}℉`;
      }
    }
  } 
}

locationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  onLocationSubmit();
});

unitsButton.addEventListener('click', onUnitsChanged);

// ========================= dom modifier functions ========================

function populateLocationCard(data, location) {
  addParagraph(locationCard, location, 'location');
  const currTime = formatDate(data.time);
  addParagraph(locationCard, currTime);
  addParagraph(locationCard, toUppercaseWords(data.weather));
};

function populateWeatherCard(data) {
  addImg(
    iconSection,
    `http://openweathermap.org/img/wn/${data.icon_id}@2x.png`
  );
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

function populateDailyCard(data) {
  const dailyCard = addDiv(dailyWeatherContainer, null, 'daily-card');
  addParagraph(dailyCard, formatDay(data.time));
  addImg(
    dailyCard, 
    `http://openweathermap.org/img/wn/${data.icon_id}@2x.png`
  );
  addParagraph(dailyCard, `${Math.round(data.temp)}${unit}`);
}

function populateCurrentWeatherSection(data, location) {
  resetCurrentWeatherSection();
  resetDailyWeatherSection();
  populateWeatherCard(data);
  populateLocationCard(data, location);
};

function populateDailyWeatherSection(dailyArray) {
  dailyArray.forEach(weatherData => populateDailyCard(weatherData));
}

function resetCurrentWeatherSection() {
  locationInput.value = '';
  removeChildren(iconSection);
  removeChildren(currentTemperatureSection);
  removeChildren(miscSection);
  removeChildren(locationCard);
};

function resetDailyWeatherSection() {
  removeChildren(dailyWeatherContainer);
}

// ========================= helpers ===================================

function removeChildren(element) {
  while(element.firstChild) {
    element.removeChild(element.lastChild);
  }
};

function addDiv(container, id, classes) {
  const div = document.createElement('div');
  if (id) {
    div.id = id;
  }
  if (classes) {
    div.className = classes;
  }
  container.appendChild(div);
  return div;
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
  const dateArray = new Date(date*1000).toString().split(" ");
  return `${dateArray[0]} ${dateArray[1]} ${dateArray[2]} ${formatTime(dateArray[4])}`
};

function formatDay(date) {
  const dateArray = new Date(date*1000).toString().split(" ");
  return `${dateArray[0]}`;
}

function toUppercaseWords(str) {
  const strArray = str.split(" ");
  let newStr = '';
  strArray.forEach(s => {
    newStr += s.charAt(0).toUpperCase() + s.slice(1) + " ";
  });
  return newStr.slice(0, newStr.length-1);
}

function toCelsius(temp) {
  return Math.round((temp - 32) * (5/9));
};

function toFahrenheit(temp) {
  return Math.round((temp * (9/5)) + 32);
}

function parseFeelsLike(str) {
  return str.split(' ')[2];
}