import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Get YouTube videos for a location
 */
export const getYouTubeVideos = async (location, maxResults = 5) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const searchQuery = `${location} travel guide`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
    
    const response = await axios.get(url);
    
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube API error:', error.message);
    throw new Error(`Failed to fetch YouTube videos: ${error.message}`);
  }
};

/**
 * Get Google Maps embed URL for a location
 */
export const getGoogleMapsUrl = (location, lat, lon) => {
  if (lat && lon) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

/**
 * Get Google Maps embed iframe HTML
 */
export const getGoogleMapsEmbed = (location, lat, lon) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  if (lat && lon) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lon}`;
  }
  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location)}`;
};

/**
 * Get location information from external APIs
 */
export const getLocationInfo = async (location, lat, lon) => {
  const info = {
    mapsUrl: getGoogleMapsUrl(location, lat, lon),
    mapsEmbed: getGoogleMapsEmbed(location, lat, lon)
  };

  try {
    info.youtubeVideos = await getYouTubeVideos(location);
  } catch (error) {
    console.warn('Could not fetch YouTube videos:', error.message);
  }

  return info;
};
