import express from 'express';
import { getLocationInfo } from '../utils/externalAPIs.js';
import { geocodeLocation } from '../utils/weatherAPI.js';

const router = express.Router();

// Get external API information for a location
router.post('/location-info', async (req, res) => {
  try {
    const { location, lat, lon } = req.body;

    let locationInfo;
    let coordinates = { lat: null, lon: null };

    if (lat && lon) {
      coordinates.lat = parseFloat(lat);
      coordinates.lon = parseFloat(lon);
      locationInfo = { formatted: `Lat: ${lat}, Lon: ${lon}` };
    } else if (location) {
      locationInfo = await geocodeLocation(location);
      coordinates.lat = locationInfo.latitude;
      coordinates.lon = locationInfo.longitude;
    } else {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    // Use the original location name for better YouTube search results
    const locationName = location || locationInfo?.formatted || `${coordinates.lat}, ${coordinates.lon}`;
    
    const externalInfo = await getLocationInfo(
      locationName,
      coordinates.lat,
      coordinates.lon
    );

    res.json({
      location: locationInfo?.formatted || location,
      coordinates: coordinates,
      ...externalInfo
    });
  } catch (error) {
    console.error('External API route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
