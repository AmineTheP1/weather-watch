-- Create database 
-- CREATE DATABASE weather_watch;

-- Connect to the database
-- \c weather_watch;

-- Create weather_queries table
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
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_location_name ON weather_queries(location_name);
CREATE INDEX IF NOT EXISTS idx_created_at ON weather_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_start_date ON weather_queries(start_date);
CREATE INDEX IF NOT EXISTS idx_end_date ON weather_queries(end_date);

-- Verify table creation
SELECT * FROM information_schema.tables WHERE table_name = 'weather_queries';
