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

// Validate required environment variables
if (!process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'your_openweather_api_key') {
  console.warn('⚠️  WARNING: OPENWEATHER_API_KEY is not properly configured.');
  console.warn('   Weather API features will not work without a valid API key.');
  console.warn('   Get your API key from: https://openweathermap.org/api');
} else {
  const apiKey = process.env.OPENWEATHER_API_KEY.trim();
  const preview = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`✓ OpenWeatherMap API key loaded: ${preview}`);
  console.log(`  API key length: ${apiKey.length} characters`);
}

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
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
