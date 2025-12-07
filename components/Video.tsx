import React from 'react';
import { Language } from '../App';
import { TYPOGRAPHY } from '../styles';

interface VideoProps {
  language: Language;
}

interface VideoProject {
  id: string;
  title: string;
  year: string;
  imageUrl: string;
  link?: string;
}

const Video: React.FC<VideoProps> = ({ language }) => {
  // Sample video projects - replace with actual data
  const videoProjects: VideoProject[] = [
    {
      id: '1',
      title: language === 'en' ? 'Brand Video' : '品牌影片',
      year: '2025',
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600',
    },
    {
      id: '2',
      title: language === 'en' ? 'Documentary' : '纪录片',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&h=600',
    },
    {
      id: '3',
      title: language === 'en' ? 'Commercial' : '商业广告',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600',
    },
    {
      id: '4',
      title: language === 'en' ? 'Short Video' : '短片',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600',
    },
    {
      id: '5',
      title: language === 'en' ? 'Music Video' : '音乐录影',
      year: '2023',
      imageUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=600',
    },
    {
      id: '6',
      title: language === 'en' ? 'Event Coverage' : '活动纪录',
      year: '2023',
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600',
    },
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-12">
        <h2 className={`${TYPOGRAPHY.h2}`}>
          {language === 'en' ? 'Film & Video' : '影片作品'}
        </h2>
        <p className={`${TYPOGRAPHY.bodySmall} mt-4`}>
          {language === 'en'
            ? 'A collection of cinematic work exploring visual storytelling through film and video.'
            : '通过影片和视频探索视觉叙事的电影作品集。'}
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {videoProjects.map((project) => (
          <div
            key={project.id}
            className="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 aspect-[4/3]"
          >
            {/* Image */}
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-serif text-2xl md:text-3xl mb-2">
                  {project.title}
                </h3>
                <p className="text-white/80 text-sm tracking-wider uppercase">
                  {project.year}
                </p>
              </div>
            </div>

            {/* Always visible title overlay (minimal) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-0 transition-opacity duration-300">
              <h3 className="text-white font-sans text-lg md:text-xl font-light">
                {project.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Add more content message */}
      <div className="mt-16 text-center">
        <p className={`${TYPOGRAPHY.bodySmall} text-gray-400`}>
          {language === 'en'
            ? 'More projects coming soon...'
            : '更多项目即将推出...'}
        </p>
      </div>
    </div>
  );
};

export default Video;
