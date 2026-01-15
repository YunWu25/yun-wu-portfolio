import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

interface DesignProps {
  language: Language;
}

interface Project {
  title: string;
  type: string;
  role: string;
  link: string | null;
  imageType: 'jpg' | 'gif';
}

const getScreenshotUrl = (title: string, type: string, imageType: 'jpg' | 'gif'): string => {
  const filename = `${title} ${type}.${imageType}`;
  return `https://media.yunwustudio.com/public/desgin/${encodeURIComponent(filename)}`;
};

const LaptopMockup: React.FC<{ project: Project }> = ({ project }) => {
  const screenshotUrl = getScreenshotUrl(project.title, project.type, project.imageType);
  
  return (
    <div className="relative w-48 md:w-56 lg:w-64 shrink-0">
      <div 
        className="absolute overflow-hidden z-0"
        style={{
          top: '3%',
          left: '11.5%',
          right: '11.5%',
          bottom: '15%',
          borderRadius: '2px',
        }}
      >
        <img 
          src={screenshotUrl} 
          alt={`${project.title} screenshot`}
          className={`w-full absolute top-0 left-0 ${project.imageType === 'jpg' ? 'animate-scroll-up' : ''}`}
          loading="lazy"
        />
      </div>
      
      <img 
        src="/images/macbook-gold.png" 
        alt="MacBook frame"
        className="w-full h-auto relative z-10 pointer-events-none"
      />
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; language: Language; onClick: () => void }> = ({ project, language, onClick }) => (
  <div 
    className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 flex items-center gap-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex-1 min-w-0">
      <h3 className={`font-sans text-xl md:text-2xl ${COLORS.gray400} mb-1 group-hover:text-coral transition-colors truncate`}>
        {project.title}
      </h3>
      <p className={`font-sans ${COLORS.gray300} text-xl md:text-2xl mb-3 truncate`}>
        {project.type}
      </p>
      <div className="flex items-baseline gap-2">
        <span className={`font-sans ${COLORS.gray300} text-lg whitespace-nowrap`}>
          {language === 'en' ? 'My role' : '我的角色'}
        </span>
        <span className={`font-sans text-xl ${COLORS.gray300} truncate`}>
          {project.role}
        </span>
      </div>
    </div>
    
    <LaptopMockup project={project} />
  </div>
);

const Design: React.FC<DesignProps> = ({ language }) => {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  const intro = language === 'en'
    ? `To me, the creative process is about more than just visual aesthetics; it is about building functional solutions. 
    Here, you will see how I tackle structural challenges, optimize user experiences through iterative prototyping, and craft digital products from the ground up. 
    Explore my work to see how I transform abstract ideas into tangible reality`
    : `对我来说，创意过程不仅仅关乎于视觉美学，  更在于构建实用的解决方案。在这里，您将看到我如何应对结构性挑战，通过迭代原型设计优化用户体验，
    以及如何从零开始打造数字产  品。欢迎探索我的作品，了解我是如何将抽象的想法实际转化。`;

  // Project data
  const projects: Project[] = [
    {
      title: 'HUADI',
      type: 'Web',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: '创智集客SCRM',
      type: 'Web',
      role: 'Designer',
      link: 'https://scrm_hc.hctcchina.com/',
      imageType: 'jpg',
    },
    {
      title: 'COC',
      type: 'Web',
      role: 'Designer',
      link: 'https://scrm_hc.hctcchina.com/',
      imageType: 'jpg',
    },
    {
      title: 'COC Backend',
      type: 'System',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'Game',
      type: 'Icon',
      role: 'Designer',
      link: 'https://www.zcool.com.cn/work/ZMzk1NjE3MTY=.html',
      imageType: 'jpg',
    },
    {
      title: '创客集成',
      type: 'App',
      role: 'Designer',
      link: 'https://www.zcool.com.cn/work/ZNTg4OTcwNDg=.html',
      imageType: 'gif',
    },
    {
      title: 'Get Fun',
      type: 'App',
      role: 'UI/UX Designer',
      link: null,
      imageType: 'gif',
    },
    {
      title: 'Beauty',
      type: 'Mini Program',
      role: 'UI/UX Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'Luna',
      type: 'Kitchen and Bath',
      role: 'Social Media Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'Hctc China',
      type: 'Web',
      role: 'Designer',
      link: 'https://scrm_hc.hctcchina.com/',
      imageType: 'jpg',
    },
    {
      title: 'Get Fun',
      type: 'Web',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'Shanbei China FlowNav Demo',
      type: 'System',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'Other',
      type: 'Icon',
      role: 'Designer',
      link: 'https://www.zcool.com.cn/work/ZNDAxMzgyODQ=.html',
      imageType: 'jpg',
    },
    {
      title: 'Other',
      type: 'Poster',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'CGH',
      type: 'EHCS',
      role: 'UI/UX Designer',
      link: null,
      imageType: 'jpg',
    },
    {
      title: 'COC',
      type: 'APP',
      role: 'UI/UX Designer',
      link: null,
      imageType: 'gif',
    },
    {
      title: 'Easy Go',
      type: 'App',
      role: 'Designer',
      link: null,
      imageType: 'jpg',
    },
  ];

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedProjectIndex === null) return;
    
    if (e.key === 'Escape') {
      setSelectedProjectIndex(null);
    } else if (e.key === 'ArrowRight') {
      setSelectedProjectIndex((prev) => 
        prev !== null ? (prev + 1) % projects.length : null
      );
    } else if (e.key === 'ArrowLeft') {
      setSelectedProjectIndex((prev) => 
        prev !== null ? (prev - 1 + projects.length) % projects.length : null
      );
    }
  }, [selectedProjectIndex, projects.length]);

  useEffect(() => {
    if (selectedProjectIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedProjectIndex, handleKeyDown]);

  const closeLightbox = () => {
    setSelectedProjectIndex(null);
  };

  const goToNext = () => {
    setSelectedProjectIndex((prev) => 
      prev !== null ? (prev + 1) % projects.length : null
    );
  };

  const goToPrev = () => {
    setSelectedProjectIndex((prev) => 
      prev !== null ? (prev - 1 + projects.length) % projects.length : null
    );
  };

  const selectedProject = selectedProjectIndex !== null ? projects[selectedProjectIndex] : null;

  return (
    <div id="design-root" className="w-full">
      {/* Intro text - matching Photography/Video pages */}
      <div id="design-header" className="mb-12 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>
          {intro}
        </p>
      </div>

      {/* Project Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard 
            key={index} 
            project={project} 
            language={language}
            onClick={() => { setSelectedProjectIndex(index); }}
          />
        ))}
      </div>

      {/* Lightbox Modal - same style as Photography page */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Previous project"
          >
            <ChevronLeft size={40} />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Next project"
          >
            <ChevronRight size={40} />
          </button>

          {/* Image container */}
          <div 
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <img
              src={getScreenshotUrl(selectedProject.title, selectedProject.type, selectedProject.imageType)}
              alt={`${selectedProject.title} screenshot`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {/* Project info */}
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-medium">{selectedProject.title}</h3>
              <p className="text-white/70 text-sm mt-1">
                {selectedProject.type} · {selectedProject.role}
              </p>
            </div>
          </div>

          {/* Project counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedProjectIndex !== null ? selectedProjectIndex + 1 : 0} / {projects.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Design;
