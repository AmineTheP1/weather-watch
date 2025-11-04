import { useState } from 'react';
import WeatherSearch from './components/WeatherSearch';
import WeatherDisplay from './components/WeatherDisplay';
import ForecastDisplay from './components/ForecastDisplay';
import ExternalInfo from './components/ExternalInfo';
import CRUDInterface from './components/CRUDInterface';
import Header from './components/Header';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleWeatherFetch = async (location, coords) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/weather/current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location || undefined,
          lat: coords?.lat,
          lon: coords?.lon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch weather');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="container">
        <WeatherSearch 
          onSearch={handleWeatherFetch}
          loading={loading}
        />
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {weatherData && (
          <>
            <WeatherDisplay data={weatherData.current} location={weatherData.location} />
            <ForecastDisplay forecast={weatherData.forecast} />
            <ExternalInfo location={weatherData.location} coordinates={weatherData.coordinates} />
          </>
        )}

        <CRUDInterface />
      </div>
    </div>
  );
}

export default App;
