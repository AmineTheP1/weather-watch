import axios from 'axios';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

/**
 * Geocode location to coordinates using Open-Meteo Geocoding API
 */
export const geocodeLocation = async (location) => {
  try {
    const params = new URLSearchParams({
      name: location,
      count: '1',
      language: 'en',
      format: 'json'
    });
    const geocodeUrl = `${GEOCODING_BASE_URL}/search?${params.toString()}`;
    
    console.log(`[Weather API] Geocoding location: ${location}`);
    
    const geocodeResponse = await axios.get(geocodeUrl);

    if (geocodeResponse.data && geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
      const result = geocodeResponse.data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country,
        admin1: result.admin1,
        formatted: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}, ${result.country}`
      };
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode location: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get current weather by coordinates using Open-Meteo API
 */
export const getCurrentWeather = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      hourly: 'temperature_2m,relative_humidity_2m,weather_code',
      timezone: 'auto'
    });
    const url = `${OPEN_METEO_BASE_URL}/forecast?${params.toString()}`;
    
    console.log(`[Weather API] Requesting current weather for lat=${lat}, lon=${lon}`);
    
    const response = await axios.get(url);
    const data = response.data;
    const current = data.current;
    
    // Get weather description from weather code
    const weatherCode = current.weather_code;
    const weatherDescription = getWeatherDescription(weatherCode);
    
    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      description: weatherDescription,
      icon: getWeatherIcon(weatherCode),
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      pressure: current.pressure_msl,
      cloudCover: current.cloud_cover,
      timestamp: new Date(current.time).getTime() / 1000
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error(`Failed to fetch weather: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get 5-day forecast by coordinates using Open-Meteo API
 */
export const getForecast = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
      hourly: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      timezone: 'auto',
      forecast_days: '5'
    });
    const url = `${OPEN_METEO_BASE_URL}/forecast?${params.toString()}`;
    
    console.log(`[Weather API] Requesting 5-day forecast for lat=${lat}, lon=${lon}`);
    
    const response = await axios.get(url);
    const data = response.data;
    
    if (!data.daily || !data.daily.time) {
      throw new Error('Invalid forecast data received');
    }

    // Process daily forecasts
    const dailyForecasts = data.daily.time.slice(0, 5).map((date, index) => {
      const weatherCode = data.daily.weather_code[index];
      return {
        date: new Date(date),
        minTemp: data.daily.temperature_2m_min[index],
        maxTemp: data.daily.temperature_2m_max[index],
        description: getWeatherDescription(weatherCode),
        icon: getWeatherIcon(weatherCode),
        humidity: null, // Daily humidity not directly available
        windSpeed: data.daily.wind_speed_10m_max[index],
        precipitation: data.daily.precipitation_sum[index]
      };
    });

    return dailyForecasts;
  } catch (error) {
    console.error('Forecast API error:', error.message);
    throw new Error(`Failed to fetch forecast: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get historical weather (using current weather as approximation for demo)
 */
export const getHistoricalWeather = async (lat, lon, date) => {
  // For demo purposes, we'll use current weather
  // Open-Meteo does support historical data but requires different endpoint
  return await getCurrentWeather(lat, lon);
};

/**
 * Convert WMO weather code to description
 */
const getWeatherDescription = (code) => {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return codes[code] || 'Unknown';
};

/**
 * Convert WMO weather code to icon identifier
 */
const getWeatherIcon = (code) => {
  if (code === 0) return '01d'; // Clear
  if (code <= 3) return '02d'; // Partly cloudy
  if (code === 45 || code === 48) return '50d'; // Fog
  if (code >= 51 && code <= 67) return '09d'; // Rain
  if (code >= 71 && code <= 77) return '13d'; // Snow
  if (code >= 80 && code <= 82) return '10d'; // Rain showers
  if (code >= 85 && code <= 86) return '13d'; // Snow showers
  if (code >= 95 && code <= 99) return '11d'; // Thunderstorm
  return '01d';
};
