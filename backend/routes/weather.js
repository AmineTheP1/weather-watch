import express from 'express';
import { geocodeLocation, getCurrentWeather, getForecast } from '../utils/weatherAPI.js';

const router = express.Router();

// Get current weather by location
router.post('/current', async (req, res) => {
  try {
    const { location, lat, lon } = req.body;

    let coordinates;
    let locationInfo;

    if (lat && lon) {
      // Direct coordinates provided
      coordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      locationInfo = { formatted: `Lat: ${lat}, Lon: ${lon}` };
    } else if (location) {
      // Geocode location string
      locationInfo = await geocodeLocation(location);
      coordinates = {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude
      };
    } else {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    const weather = await getCurrentWeather(coordinates.latitude, coordinates.longitude);
    
    // Try to get forecast, but don't fail if it's unavailable (free plan limitations)
    let forecast = null;
    try {
      forecast = await getForecast(coordinates.latitude, coordinates.longitude);
    } catch (forecastError) {
      console.warn('Forecast unavailable (may be free plan limitation):', forecastError.message);
      // Continue without forecast - current weather is still available
    }

    res.json({
      location: locationInfo.formatted || location,
      coordinates: {
        lat: coordinates.latitude,
        lon: coordinates.longitude
      },
      current: weather,
      forecast: forecast
    });
  } catch (error) {
    console.error('Weather route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get forecast only
router.post('/forecast', async (req, res) => {
  try {
    const { location, lat, lon } = req.body;

    let coordinates;
    let locationInfo;

    if (lat && lon) {
      coordinates = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      locationInfo = { formatted: `Lat: ${lat}, Lon: ${lon}` };
    } else if (location) {
      locationInfo = await geocodeLocation(location);
      coordinates = {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude
      };
    } else {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    const forecast = await getForecast(coordinates.latitude, coordinates.longitude);

    res.json({
      location: locationInfo.formatted || location,
      forecast: forecast
    });
  } catch (error) {
    console.error('Forecast route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
