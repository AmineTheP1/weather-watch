import { format } from 'date-fns';
import { FaThermometerHalf, FaTint, FaWind, FaEye, FaSun, FaMoon } from 'react-icons/fa';
import './WeatherDisplay.css';

const WeatherDisplay = ({ data, location }) => {
  if (!data) return null;

  const formatTime = (timestamp) => {
    return format(new Date(timestamp * 1000), 'HH:mm');
  };

  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

  return (
    <div className="weather-display">
      <div className="weather-main">
        <div className="weather-header">
          <h2>{location}</h2>
          <p className="weather-date">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <div className="weather-content">
          <div className="weather-icon-section">
            <img src={iconUrl} alt={data.description} className="weather-icon" />
            <p className="weather-description">{data.description}</p>
          </div>
          
          <div className="weather-temp-section">
            <div className="temp-main">
              <span className="temp-value">{Math.round(data.temperature)}</span>
              <span className="temp-unit">°C</span>
            </div>
            <p className="temp-feels">Feels like {Math.round(data.feelsLike)}°C</p>
          </div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <FaTint className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{data.humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <FaWind className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">{data.windSpeed} m/s</span>
          </div>
        </div>

        <div className="detail-item">
          <FaThermometerHalf className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{data.pressure} hPa</span>
          </div>
        </div>

        <div className="detail-item">
          <FaEye className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{data.visibility} km</span>
          </div>
        </div>

        {data.sunrise && (
          <div className="detail-item">
            <FaSun className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Sunrise</span>
              <span className="detail-value">{formatTime(data.sunrise)}</span>
            </div>
          </div>
        )}

        {data.sunset && (
          <div className="detail-item">
            <FaMoon className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Sunset</span>
              <span className="detail-value">{formatTime(data.sunset)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDisplay;
