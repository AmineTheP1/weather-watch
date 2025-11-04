import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Get YouTube videos for a location
 */
export const getYouTubeVideos = async (locationName, maxResults = 5) => {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured, skipping YouTube videos');
    return [];
  }

  if (!locationName) {
    return [];
  }

  try {
    // Use the actual location name in the search query
    const searchQuery = `${locationName} city travel guide`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`;
    
    console.log(`[YouTube API] Searching for: ${searchQuery}`);
    
    const response = await axios.get(url);
    
    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }
    
    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return [];
  }
};

/**
 * Get Google Maps embed URL for a location (no API key needed)
 */
export const getGoogleMapsEmbed = (location, lat, lon) => {
  // Use simple embed URL without API key
  if (lat && lon) {
    return `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
  }
  // Use location name in embed
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
};

/**
 * Get Google Maps link URL
 */
export const getGoogleMapsUrl = (location, lat, lon) => {
  if (lat && lon) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }
  return `https://www.google.com/maps/search/?query=${encodeURIComponent(location)}`;
};

/**
 * Get location information
 */
export const getLocationInfo = async (locationName, lat, lon) => {
  const info = {
    mapsUrl: getGoogleMapsUrl(locationName, lat, lon),
    mapsEmbed: getGoogleMapsEmbed(locationName, lat, lon)
  };

  // Get YouTube videos using the actual location name
  if (YOUTUBE_API_KEY && locationName) {
    try {
      info.youtubeVideos = await getYouTubeVideos(locationName);
    } catch (error) {
      console.warn('Could not fetch YouTube videos:', error.message);
    }
  }

  return info;
};
