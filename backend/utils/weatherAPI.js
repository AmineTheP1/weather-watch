import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Geocode location to coordinates
 */
export const geocodeLocation = async (location) => {
  try {
    // Try direct geocoding API
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);

    if (geocodeResponse.data && geocodeResponse.data.length > 0) {
      const { lat, lon, name, country, state } = geocodeResponse.data[0];
      return {
        latitude: lat,
        longitude: lon,
        name: name,
        country: country,
        state: state,
        formatted: `${name}${state ? ', ' + state : ''}, ${country}`
      };
    }

    // Try zip code API if first attempt fails
    if (/^\d{5}(-\d{4})?$/.test(location) || /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(location.toUpperCase())) {
      const zipUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}`;
      const zipResponse = await axios.get(zipUrl);
      
      if (zipResponse.data && zipResponse.data.lat) {
        return {
          latitude: zipResponse.data.lat,
          longitude: zipResponse.data.lon,
          name: zipResponse.data.name,
          country: zipResponse.data.country,
          formatted: `${zipResponse.data.name}, ${zipResponse.data.country}`
        };
      }
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode location: ${error.message}`);
  }
};

/**
 * Get current weather by coordinates
 */
export const getCurrentWeather = async (lat, lon) => {
  try {
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    return {
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      pressure: response.data.main.pressure,
      visibility: response.data.visibility / 1000, // Convert to km
      city: response.data.name,
      country: response.data.sys.country,
      sunrise: response.data.sys.sunrise,
      sunset: response.data.sys.sunset,
      timestamp: response.data.dt
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
};

/**
 * Get 5-day forecast by coordinates
 */
export const getForecast = async (lat, lon) => {
  try {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    
    // Group forecasts by date
    const forecasts = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!forecasts[date]) {
        forecasts[date] = [];
      }
      forecasts[date].push({
        time: new Date(item.dt * 1000),
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      });
    });

    // Get daily summaries (next 5 days)
    const dailyForecasts = Object.keys(forecasts)
      .slice(0, 5)
      .map(date => {
        const dayForecasts = forecasts[date];
        const temps = dayForecasts.map(f => f.temperature);
        return {
          date: new Date(date),
          minTemp: Math.min(...temps),
          maxTemp: Math.max(...temps),
          description: dayForecasts[0].description,
          icon: dayForecasts[0].icon,
          humidity: Math.round(dayForecasts.reduce((sum, f) => sum + f.humidity, 0) / dayForecasts.length),
          windSpeed: dayForecasts.reduce((sum, f) => sum + f.windSpeed, 0) / dayForecasts.length,
          hourly: dayForecasts
        };
      });

    return dailyForecasts;
  } catch (error) {
    console.error('Forecast API error:', error.message);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
};

/**
 * Get historical weather (using current weather as approximation for demo)
 * Note: OpenWeatherMap historical data requires paid plan
 */
export const getHistoricalWeather = async (lat, lon, date) => {
  // For demo purposes, we'll use current weather
  // In production, you'd use a historical weather API
  return await getCurrentWeather(lat, lon);
};
