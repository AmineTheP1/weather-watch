# Weather Watch - Tech Assessment

A full-stack weather application built with React (Vite), Express, and PostgreSQL that provides real-time weather information with CRUD functionality and optional API integrations.

## Features

### Tech Assessment 1 ✅
- **Location Input**: Support for multiple location formats (City, Zip Code, GPS Coordinates, Landmarks, etc.)
- **Current Weather**: Real-time weather data from OpenWeatherMap API
- **5-Day Forecast**: Extended weather forecast with daily summaries
- **Current Location**: Automatic weather detection using browser geolocation
- **Weather Icons**: Visual weather representation using OpenWeatherMap icons
- **Responsive Design**: Works on desktop and mobile devices

### Tech Assessment 2 ✅
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
  - **CREATE**: Store weather queries with location and date range (with validations)
  - **READ**: View all stored weather queries with filtering
  - **UPDATE**: Modify existing weather queries (with validations)
  - **DELETE**: Remove weather queries from database
- **Data Validation**: Date range validation, location verification
- **Database Persistence**: PostgreSQL database for storing weather queries
- **Data Export**: Export data in multiple formats (JSON, CSV, PDF, Markdown, XML)
- **Optional API Integration**: 
  - YouTube videos for locations
  - Google Maps integration
- **PM Accelerator Info**: Information button with company details

## Tech Stack

- **Frontend**: React 18, Vite, React Icons
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **APIs**: OpenWeatherMap, YouTube Data API, Google Maps API

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- OpenWeatherMap API key (free tier available)
- Optional: YouTube API key, Google Maps API key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-watch
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb weather_watch
   # Or using psql
   psql -U postgres
   CREATE DATABASE weather_watch;
   ```

4. **Configure environment variables**
   
   Copy `backend/env.example` to `backend/.env` and fill in your values:
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=weather_watch
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   OPENWEATHER_API_KEY=your_openweather_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key (optional)
   YOUTUBE_API_KEY=your_youtube_api_key (optional)
   
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

5. **Get API Keys**
   - **OpenWeatherMap**: Sign up at https://openweathermap.org/api (free tier available)
   - **Google Maps**: Get API key from https://console.cloud.google.com/ (optional)
   - **YouTube**: Get API key from https://console.cloud.google.com/ (optional)

## Running the Application

1. **Start the backend server**
   ```bash
   npm run server
   ```
   The backend will start on http://localhost:3001

2. **Start the frontend** (in a new terminal)
   ```bash
   npm run client
   ```
   The frontend will start on http://localhost:5173

3. **Or run both simultaneously**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to http://localhost:5173

## Database Setup

The database tables are automatically created when you start the backend server. The initialization script will:
- Create the `weather_queries` table
- Set up necessary indexes
- Handle database connection

## API Endpoints

### Weather
- `POST /api/weather/current` - Get current weather and forecast
- `POST /api/weather/forecast` - Get forecast only

### CRUD Operations
- `POST /api/crud/create` - Create a new weather query
- `GET /api/crud/read` - Get all weather queries (with optional filters)
- `GET /api/crud/read/:id` - Get a specific weather query
- `PUT /api/crud/update/:id` - Update a weather query
- `DELETE /api/crud/delete/:id` - Delete a weather query

### Data Export
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV
- `GET /api/export/pdf` - Export as PDF
- `GET /api/export/markdown` - Export as Markdown
- `GET /api/export/xml` - Export as XML

### External APIs
- `POST /api/external/location-info` - Get YouTube videos and Google Maps info

## Usage

1. **Search for Weather**
   - Enter a location (city, zip code, coordinates, landmark)
   - Or click "Use Current Location" to get weather for your location
   - View current weather and 5-day forecast

2. **Create Weather Query**
   - Fill in location, start date, and end date
   - Click "Create Query" to save to database
   - Location is validated and geocoded automatically

3. **View Stored Queries**
   - All previously created queries are displayed
   - Filter and search functionality available

4. **Update/Delete Queries**
   - Click edit button to modify a query
   - Click delete button to remove a query
   - All updates include validation

5. **Export Data**
   - Use export buttons to download data in various formats

## Project Structure

```
weather-watch/
├── backend/
│   ├── db/
│   │   └── init.js          # Database initialization
│   ├── routes/
│   │   ├── weather.js       # Weather API routes
│   │   ├── crud.js          # CRUD operations
│   │   ├── export.js        # Data export routes
│   │   └── external.js      # External API routes
│   ├── utils/
│   │   ├── weatherAPI.js    # OpenWeatherMap integration
│   │   └── externalAPIs.js  # YouTube/Google Maps integration
│   ├── server.js            # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── WeatherSearch.jsx
│   │   │   ├── WeatherDisplay.jsx
│   │   │   ├── ForecastDisplay.jsx
│   │   │   ├── ExternalInfo.jsx
│   │   │   └── CRUDInterface.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json
└── README.md
```

## Notes

- The app uses OpenWeatherMap's free tier which has rate limits
- Historical weather data requires a paid API plan, so current weather is used as approximation
- External API features (YouTube, Google Maps) are optional and require API keys
- The database automatically validates dates and locations before storing
- All user inputs are validated on both frontend and backend

## Demo Video



https://github.com/user-attachments/assets/6f5acd52-022b-4806-82e5-5edd323f901a



## Developer Information

- **Name**: Amine Aichane
- **Project**: Weather Watch - Tech Assessment
- **Company**: PM Accelerator (Product Manager Accelerator)

## License

MIT

## Contact

For questions about this project, please refer to the PM Accelerator LinkedIn page.
