import { format } from 'date-fns';
import './ForecastDisplay.css';

const ForecastDisplay = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="forecast-display">
      <h2>5-Day Forecast</h2>
      <div className="forecast-grid">
        {forecast.map((day, index) => {
          const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
          
          return (
            <div key={index} className="forecast-card">
              <div className="forecast-date">
                {index === 0 ? 'Today' : format(day.date, 'EEEE')}
                <span className="forecast-date-full">
                  {format(day.date, 'MMM d')}
                </span>
              </div>
              
              <img src={iconUrl} alt={day.description} className="forecast-icon" />
              
              <p className="forecast-description">{day.description}</p>
              
              <div className="forecast-temps">
                <span className="temp-high">{Math.round(day.maxTemp)}°</span>
                <span className="temp-low">{Math.round(day.minTemp)}°</span>
              </div>
              
              <div className="forecast-details">
                {day.humidity !== null && (
                  <div className="forecast-detail">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{day.humidity}%</span>
                  </div>
                )}
                <div className="forecast-detail">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{day.windSpeed ? day.windSpeed.toFixed(1) : 'N/A'} m/s</span>
                </div>
                {day.precipitation !== undefined && (
                  <div className="forecast-detail">
                    <span className="detail-label">Precipitation</span>
                    <span className="detail-value">{day.precipitation.toFixed(1)} mm</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastDisplay;
