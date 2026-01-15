// Cloudflare Pages Function: GET /api/videos
// Fetches videos from a YouTube channel's uploads playlist using YouTube Data API v3

interface Env {
  YOUTUBE_API_KEY: string;
}

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      default?: { url: string; width: number; height: number };
    };
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  year: string;
  thumbnailUrl: string;
  videoUrl: string;
}

// Channel ID: UCclL76UlbKiqAOZxhdkXN1Q
// Uploads playlist ID is channel ID with "UC" replaced by "UU"
const UPLOADS_PLAYLIST_ID = 'UUclL76UlbKiqAOZxhdkXN1Q';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.error('YOUTUBE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch videos from the uploads playlist
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', UPLOADS_PLAYLIST_ID);
    url.searchParams.set('maxResults', '50'); // Max allowed per request
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch videos from YouTube',
          details: response.status,
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data: YouTubePlaylistResponse = await response.json();

    // Transform YouTube data to our format
    const videos: VideoData[] = data.items.map((item) => {
      const snippet = item.snippet;
      const publishDate = new Date(snippet.publishedAt);

      return {
        id: snippet.resourceId.videoId,
        title: snippet.title,
        description: snippet.description,
        publishedAt: snippet.publishedAt,
        year: publishDate.getFullYear().toString(),
        thumbnailUrl:
          snippet.thumbnails.high?.url ||
          snippet.thumbnails.medium?.url ||
          snippet.thumbnails.default?.url ||
          '',
        videoUrl: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
      };
    });

    return new Response(
      JSON.stringify({
        videos,
        totalResults: data.pageInfo.totalResults,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch videos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
