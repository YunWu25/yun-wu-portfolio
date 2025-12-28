import React, { useEffect, useState } from 'react';
import { Language } from '../App';
import { TYPOGRAPHY, COLORS } from '../styles';

interface VideoProps {
  language: Language;
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

interface VideosApiResponse {
  videos: VideoData[];
  totalResults: number;
}

const Video: React.FC<VideoProps> = ({ language }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: VideosApiResponse = await response.json();
        if (data.videos.length > 0) {
          setVideos(data.videos);
          setError(null);
        } else {
          setError('No videos available');
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchVideos();
  }, []);

  const intro = language === 'en'
    ? 'A collection of cinematic work exploring visual storytelling through film and video.'
    : '通过影片和视频探索视觉叙事的电影作品集。';

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="w-full">
        <div className="mb-12 text-center">
          <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
        </div>
        <div className="flex flex-col justify-center items-center h-[50vh] text-center">
          <p className="text-gray-500 mb-4">
            {language === 'en' 
              ? error ?? 'No videos available at the moment.' 
              : error ?? '暂时没有可用的视频。'}
          </p>
          <button 
            onClick={() => { window.location.reload(); }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            {language === 'en' ? 'Try Again' : '重试'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          {intro}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {videos.map((video) => (
          <a
            key={video.id}
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 aspect-video"
          >
            {/* Thumbnail */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            
            {/* Hover overlay with info */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className={`${TYPOGRAPHY.cardOverlayTitle} mb-2 line-clamp-2`}>
                  {video.title}
                </h3>
                <p className={TYPOGRAPHY.cardOverlayMeta}>
                  {video.year}
                </p>
              </div>
            </div>

            {/* Always visible title overlay (minimal) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-linear-to-t from-black/50 to-transparent group-hover:opacity-0 transition-opacity duration-300">
              <h3 className={`${TYPOGRAPHY.cardTitle} line-clamp-2`}>
                {video.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Video;
