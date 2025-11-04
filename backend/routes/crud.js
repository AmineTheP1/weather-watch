import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db/init.js';
import { geocodeLocation, getHistoricalWeather } from '../utils/weatherAPI.js';
import { isWithinInterval } from 'date-fns';

const router = express.Router();

// Validation middleware
const validateDateRange = [
  body('start_date').custom((value) => {
    if (!value) {
      throw new Error('Start date is required');
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid start date format');
    }
    return true;
  }),
  body('end_date').custom((value) => {
    if (!value) {
      throw new Error('End date is required');
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid end date format');
    }
    return true;
  }),
  body('location').notEmpty().withMessage('Location is required'),
];

// CREATE - Store weather query with date range
router.post('/create', validateDateRange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, start_date, end_date } = req.body;
    
    // Parse dates - handle both ISO strings and YYYY-MM-DD format
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Validate date range
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Validate location exists
    let locationInfo;
    try {
      locationInfo = await geocodeLocation(location);
    } catch (error) {
      return res.status(400).json({ error: `Location not found: ${location}` });
    }

    // Get weather data (using current as approximation for historical)
    const weather = await getHistoricalWeather(
      locationInfo.latitude,
      locationInfo.longitude,
      startDate
    );

    // Store in database
    const result = await query(
      `INSERT INTO weather_queries 
       (location_name, location_type, latitude, longitude, start_date, end_date, 
        temperature, description, humidity, wind_speed, weather_icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        locationInfo.formatted || location,
        'location_string',
        locationInfo.latitude,
        locationInfo.longitude,
        startDate,
        endDate,
        weather.temperature,
        weather.description,
        weather.humidity,
        weather.windSpeed,
        weather.icon
      ]
    );

    res.status(201).json({
      message: 'Weather query created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ - Get all weather queries
router.get('/read', async (req, res) => {
  try {
    const { location, start_date, end_date, limit = 100 } = req.query;

    let queryText = 'SELECT * FROM weather_queries WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (location) {
      paramCount++;
      queryText += ` AND location_name ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (start_date) {
      paramCount++;
      queryText += ` AND start_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryText += ` AND end_date <= $${paramCount}`;
      params.push(end_date);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${++paramCount}`;
    params.push(parseInt(limit));

    const result = await query(queryText, params);

    res.json({
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ - Get single weather query by ID
router.get('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM weather_queries WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weather query not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Read by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update weather query
router.put('/update/:id', [
  body('start_date').optional().isISO8601().toDate(),
  body('end_date').optional().isISO8601().toDate(),
  body('location').optional().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { location, start_date, end_date, temperature, description } = req.body;

    // Check if record exists
    const existing = await query('SELECT * FROM weather_queries WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Weather query not found' });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    // Validate and update location if provided
    if (location) {
      try {
        const locationInfo = await geocodeLocation(location);
        paramCount++;
        updates.push(`location_name = $${paramCount}`);
        params.push(locationInfo.formatted || location);
        
        paramCount++;
        updates.push(`latitude = $${paramCount}`);
        params.push(locationInfo.latitude);
        
        paramCount++;
        updates.push(`longitude = $${paramCount}`);
        params.push(locationInfo.longitude);
      } catch (error) {
        return res.status(400).json({ error: `Invalid location: ${error.message}` });
      }
    }

    // Validate and update date range if provided
    if (start_date || end_date) {
      const startDate = start_date ? new Date(start_date) : new Date(existing.rows[0].start_date);
      const endDate = end_date ? new Date(end_date) : new Date(existing.rows[0].end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD format.' });
      }

      if (startDate > endDate) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }

      if (start_date) {
        paramCount++;
        updates.push(`start_date = $${paramCount}`);
        params.push(startDate);
      }

      if (end_date) {
        paramCount++;
        updates.push(`end_date = $${paramCount}`);
        params.push(endDate);
      }
    }

    // Update weather data if provided
    if (temperature !== undefined) {
      paramCount++;
      updates.push(`temperature = $${paramCount}`);
      params.push(temperature);
    }

    if (description) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    paramCount++;
    params.push(id);

    const queryText = `UPDATE weather_queries SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(queryText, params);

    res.json({
      message: 'Weather query updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete weather query
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM weather_queries WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weather query not found' });
    }

    res.json({
      message: 'Weather query deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
