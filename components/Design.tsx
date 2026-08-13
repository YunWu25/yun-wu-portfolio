import React from 'react';
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
  displayText?: string[];
}

const getScreenshotUrl = (title: string, type: string, imageType: 'jpg' | 'gif'): string => {
  // Handle empty type (e.g., "Luna Kitchen and Bath" with no type suffix)
  const filename = type ? `${title} ${type}.${imageType}` : `${title}.${imageType}`;
  return `https://media.yunwustudio.com/public/design/${encodeURIComponent(filename)}`;
};

const LaptopMockup: React.FC<{ project: Project }> = ({ project }) => {
  const screenshotUrl = getScreenshotUrl(project.title, project.type, project.imageType);

  return (
    <div className="w-48 md:w-56 lg:w-64 shrink-0">
      {/* Screen with gray frame */}
      <div
        className="bg-gray-400 rounded-lg p-1"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        {/* Screen content */}
        <div
          className="relative overflow-hidden bg-white rounded-md flex items-center justify-center"
          style={{ aspectRatio: '16/10' }}
        >
          {project.displayText ? (
            <div className="flex flex-col items-center justify-center text-center px-2">
              {project.displayText.map((line, index) => (
                <span
                  key={index}
                  className="font-sans font-bold text-gray-800 leading-tight"
                  style={{ fontSize: 'clamp(12px, 3vw, 18px)' }}
                >
                  {line}
                </span>
              ))}
            </div>
          ) : (
            <img
              src={screenshotUrl}
              alt={`${project.title} screenshot`}
              className={`w-full absolute top-0 left-0 ${project.imageType === 'jpg' ? 'animate-scroll-up' : ''}`}
              loading="lazy"
            />
          )}
        </div>
      </div>
      {/* Base/Stand */}
      <div className="flex justify-center">
        <div
          className="h-2 rounded-b-sm"
          style={{
            width: '40%',
            background: 'linear-gradient(180deg, #c0c0c0 0%, #d4d4d4 100%)',
          }}
        />
      </div>
      <div className="flex justify-center">
        <div
          className="h-1 rounded-b"
          style={{
            width: '55%',
            background: 'linear-gradient(180deg, #d4d4d4 0%, #e8e8e8 100%)',
          }}
        />
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; language: Language }> = ({ project, language }) => {
  const cardContent = (
    <div className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 flex items-center gap-4 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
      <div className="flex-1 min-w-0">
        <h3
          className={`font-sans text-xl md:text-2xl ${COLORS.gray400} mb-1 group-hover:text-coral transition-colors truncate`}
        >
          {project.title}
        </h3>
        <p className={`font-sans ${COLORS.gray300} text-xl md:text-2xl mb-3 truncate`}>
          {project.type}
        </p>
        <div className="flex items-baseline gap-2">
          <span className={`font-sans ${COLORS.gray300} text-lg whitespace-nowrap`}>
            {language === 'en' ? 'Role' : '角色'}
          </span>
          <span className={`font-sans text-xl ${COLORS.gray300} truncate`}>{project.role}</span>
        </div>
      </div>

      <LaptopMockup project={project} />
    </div>
  );

  if (project.link) {
    return (
      <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

const Design: React.FC<DesignProps> = ({ language }) => {
  const intro =
    language === 'en'
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
      displayText: ['Hctcchina', 'China'],
    },
    {
      title: 'COC',
      type: 'Web',
      role: 'Designer',
      link: null,
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
      link: 'https://www.zcool.com.cn/work/ZNTg4OTcwNDg=.html',
      imageType: 'jpg',
    },
    {
      title: 'Luna Kitchen and Bath',
      type: '',
      role: 'Social Media Designer',
      link: null,
      imageType: 'jpg',
      displayText: ['Luna', 'Seattle'],
    },
    {
      title: 'Hctc China',
      type: 'Web',
      role: 'Designer',
      link: 'https://www.hctcchina.com/index.html',
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
      link: 'https://media.yunwustudio.com/public/design/CGH%20EHCS.jpg',
      imageType: 'jpg',
    },
    {
      title: 'COC',
      type: 'APP',
      role: 'UI/UX Designer',
      link: 'https://media.yunwustudio.com/public/design/COC%20APP.gif',
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

  return (
    <div id="design-root" className="w-full">
      {/* Intro text - matching Photography/Video pages */}
      <div id="design-header" className="mb-12 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{intro}</p>
      </div>

      {/* Project Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} language={language} />
        ))}
      </div>
    </div>
  );
};

export default Design;
