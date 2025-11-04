import { format } from 'date-fns';
import './ForecastDisplay.css';

const ForecastDisplay = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="forecast-display">
      <h2>5-Day Forecast</h2>
      <div className="forecast-grid">
        {forecast
          .filter((day) => day && day.date) // Filter out invalid entries
          .map((day, index) => {
            const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
            
            // Ensure date is a Date object
            let dateObj;
            if (day.date instanceof Date) {
              dateObj = day.date;
            } else if (typeof day.date === 'string') {
              dateObj = new Date(day.date);
            } else {
              console.error('Invalid date format:', day.date);
              return null;
            }
            
            // Validate date
            if (isNaN(dateObj.getTime())) {
              console.error('Invalid date value:', day.date);
              return null;
            }
            
            return (
            <div key={index} className="forecast-card">
              <div className="forecast-date">
                {index === 0 ? 'Today' : format(dateObj, 'EEEE')}
                <span className="forecast-date-full">
                  {format(dateObj, 'MMM d')}
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
