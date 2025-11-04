import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import './WeatherSearch.css';

const WeatherSearch = ({ onSearch, loading }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim(), null);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch(null, {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          alert('Unable to get your location. Please enter a location manually.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="weather-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <FaMapMarkerAlt className="search-icon" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (City, Zip Code, Coordinates, Landmark...)"
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading || !location.trim()}
          >
            <FaSearch />
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="current-location-button"
          disabled={loading}
        >
          <FaMapMarkerAlt />
          Use Current Location
        </button>
      </form>
    </div>
  );
};

export default WeatherSearch;
