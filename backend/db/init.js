import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'weather_watch',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

export const query = (text, params) => pool.query(text, params);

export const initializeDatabase = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_queries (
        id SERIAL PRIMARY KEY,
        location_name VARCHAR(255) NOT NULL,
        location_type VARCHAR(50),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        start_date DATE,
        end_date DATE,
        temperature DECIMAL(5, 2),
        description VARCHAR(255),
        humidity INTEGER,
        wind_speed DECIMAL(5, 2),
        weather_icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_location_name ON weather_queries(location_name);
      CREATE INDEX IF NOT EXISTS idx_created_at ON weather_queries(created_at);
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export default pool;
