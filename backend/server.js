import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import weatherRoutes from './routes/weather.js';
import crudRoutes from './routes/crud.js';
import exportRoutes from './routes/export.js';
import externalRoutes from './routes/external.js';
import { initializeDatabase } from './db/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Using Open-Meteo API (no API key required)
console.log('✓ Using Open-Meteo Weather API (free, no API key required)');

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://*.vercel.app',
  'https://vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Catch-all handler for React Router (must be after API routes)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes in production
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
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
