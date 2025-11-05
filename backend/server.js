import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weather.js';
import crudRoutes from './routes/crud.js';
import exportRoutes from './routes/export.js';
import externalRoutes from './routes/external.js';
import { initializeDatabase } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Using Open-Meteo API (no API key required)
console.log('✓ Using Open-Meteo Weather API (free, no API key required)');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/crud', crudRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/external', externalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Weather Watch API is running' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    // Don't exit in production, allow server to start without database
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    } else {
      console.log('Starting server without database connection...');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (without database)`);
      });
    }
  });
