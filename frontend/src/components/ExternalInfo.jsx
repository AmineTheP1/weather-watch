import { useState, useEffect } from 'react';
import { FaYoutube, FaMapMarkerAlt } from 'react-icons/fa';
import './ExternalInfo.css';

const ExternalInfo = ({ location, coordinates }) => {
  const [externalData, setExternalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location || (coordinates?.lat && coordinates?.lon)) {
      fetchExternalInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, coordinates?.lat, coordinates?.lon]);

  const fetchExternalInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/external/location-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location || undefined,
          lat: coordinates?.lat,
          lon: coordinates?.lon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch external information');
      }

      const data = await response.json();
      setExternalData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="external-info loading">Loading location information...</div>;
  }

  if (error || !externalData) {
    return null;
  }

  return (
    <div className="external-info">
      <h3>Location Information</h3>
      
      {externalData.mapsEmbed && (
        <div className="external-section">
          <h4>
            <FaMapMarkerAlt /> Google Maps
          </h4>
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: '8px', marginTop: '1rem' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={externalData.mapsEmbed}
            title="Location Map"
          />
          {externalData.mapsUrl && (
            <a 
              href={externalData.mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Open in Google Maps
            </a>
          )}
        </div>
      )}

      {externalData.youtubeVideos && externalData.youtubeVideos.length > 0 && (
        <div className="external-section">
          <h4>
            <FaYoutube /> YouTube Videos
          </h4>
          <div className="youtube-videos">
            {externalData.youtubeVideos.map((video) => (
              <div key={video.videoId} className="youtube-video">
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-link"
                >
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-info">
                    <h5>{video.title}</h5>
                    <p>{video.channelTitle}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalInfo;
