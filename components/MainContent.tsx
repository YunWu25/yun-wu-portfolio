
import React, { useState } from 'react';
import { Mail, Menu, X, ChevronDown } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { ViewState, NavItem } from '../types';
import { WaveDecoration } from './WaveDecoration';
import ProjectFlow from './ProjectFlow';
import Photography from './Photography';
import Design from './Design';
import Video from './Video';
import About from './About';
import Home from './Home';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../styles';
import { Language } from '../App';

// Custom outline LinkedIn icon to match Mail icon style
const LinkedInOutline: React.FC<{ size?: number; strokeWidth?: number; className?: string }> = ({ 
  size = 24, 
  strokeWidth = 1.5, 
  className = '' 
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface MainContentProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeView, onNavigate, language, setLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [homeExpanded, setHomeExpanded] = useState(
    activeView === ViewState.PHOTOGRAPHY || activeView === ViewState.DESIGN || activeView === ViewState.VIDEO
  );

  const navItems: NavItem[] = [
    { label: language === 'en' ? 'Home' : '主页', view: ViewState.HOME },
    { label: language === 'en' ? 'About' : '关于', view: ViewState.ABOUT },
    { label: language === 'en' ? 'Project Flow' : '项目流程', view: ViewState.PROJECT_FLOW },
  ];

  const homeSubItems = [
    { label: language === 'en' ? 'Design' : '设计', view: ViewState.DESIGN },
    { label: language === 'en' ? 'Video' : '影片', view: ViewState.VIDEO },
    { label: language === 'en' ? 'Photography' : '摄影', view: ViewState.PHOTOGRAPHY },
  ];

  const renderBodyContent = () => {
    switch (activeView) {
      case ViewState.PROJECT_FLOW:
        return <ProjectFlow language={language} />;
      case ViewState.ABOUT:
        return <About language={language} />;
      case ViewState.PHOTOGRAPHY:
        return <Photography language={language} />;
      case ViewState.DESIGN:
        return <Design language={language} />;
      case ViewState.VIDEO:
        return <Video language={language} />;
      case ViewState.HOME:
      default:
        return <Home onNavigate={onNavigate} language={language} />;
    }
  };

  const getCenterTitle = () => {
    switch (activeView) {
      case ViewState.ABOUT:
        return language === 'en' ? 'About' : '关于';
      case ViewState.PROJECT_FLOW:
        return language === 'en' ? 'Progress' : '进度';
      case ViewState.PHOTOGRAPHY:
        return language === 'en' ? 'Gallery' : '画廊';
      case ViewState.VIDEO:
        return language === 'en' ? 'Video' : '影片';
      case ViewState.HOME:
      default:
        return 'Yun Wu';
    }
  };

  return (
    <div id="container-card" className="w-screen h-screen bg-white">

      {/* MAIN CONTAINER */}
      <div id="main-card" className={`${LAYOUT.mainCard} overflow-y-auto custom-scrollbar`}>

        {/* === LANGUAGE SWITCHER === */}
        <div className="absolute md:top-4 top-8 md:right-4 right-8 z-20">
          {/* Mobile: Single toggle button */}
          <button
            onClick={() => { setLanguage(language === 'en' ? 'zh' : 'en'); }}
            className="md:hidden bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm text-sm font-medium text-coral hover:bg-coral hover:text-white transition-colors"
          >
            {language === 'en' ? '中文' : 'EN'}
          </button>
          
          {/* Desktop: Full switcher */}
          <div className="hidden md:flex bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm items-center gap-2">
            <button
              onClick={() => { setLanguage('en'); }}
              className={`px-2 py-1 rounded transition-colors text-sm ${
                language === 'en'
                  ? 'bg-coral text-white'
                  : 'text-gray-500 hover:text-coral'
              }`}
            >
              EN
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => { setLanguage('zh'); }}
              className={`px-2 py-1 rounded transition-colors text-sm ${
                language === 'zh'
                  ? 'bg-coral text-white'
                  : 'text-gray-500 hover:text-coral'
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* === HEADER SECTION === */}
        <div id="main-card-header" className="grid grid-cols-1 md:grid-cols-3 p-8 md:p-16 pb-4 md:pb-8 items-start">

          {/* Left Column: Navigation */}
          <nav id="main-card-nav" className="hidden md:flex flex-col space-y-6 items-start h-full justify-center">
            {navItems.map((item) => (
              <div key={item.label} className="w-full">
                <button
                  onClick={() => {
                    if (item.view === ViewState.HOME) {
                      setHomeExpanded(!homeExpanded);
                    }
                    onNavigate(item.view);
                  }}
                  className="flex items-center group w-fit text-left focus:outline-none"
                >
                  <span
                    className={`w-3 h-3 rounded-sm bg-coral mr-4 transition-all duration-300 ${activeView === item.view || (item.view === ViewState.HOME && (activeView === ViewState.PHOTOGRAPHY || activeView === ViewState.DESIGN || activeView === ViewState.VIDEO))
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 group-hover:opacity-40 scale-0 group-hover:scale-75'
                      }`}
                  />
                  <span
                    className={`${TYPOGRAPHY.navItem} transition-colors duration-300 ${activeView === item.view || (item.view === ViewState.HOME && (activeView === ViewState.PHOTOGRAPHY || activeView === ViewState.DESIGN || activeView === ViewState.VIDEO))
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 group-hover:text-coral'
                      }`}
                  >
                    {item.label}
                  </span>
                  {item.view === ViewState.HOME && (
                    <ChevronDown
                      size={20}
                      className={`ml-2 transition-transform duration-300 ${homeExpanded ? 'rotate-180' : ''
                        } ${activeView === ViewState.HOME || activeView === ViewState.PHOTOGRAPHY || activeView === ViewState.DESIGN || activeView === ViewState.VIDEO
                          ? 'text-gray-900'
                          : 'text-gray-500 group-hover:text-coral'
                        }`}
                    />
                  )}
                </button>

                {item.view === ViewState.HOME && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${homeExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="ml-7 mt-4 space-y-4">
                      {homeSubItems.map((subItem) => (
                        <button
                          key={subItem.label}
                          onClick={() => { onNavigate(subItem.view); }}
                          className="flex items-center group w-fit text-left focus:outline-none"
                        >
                          <span
                            className={`w-2 h-2 rounded-sm bg-coral mr-3 transition-all duration-300 ${activeView === subItem.view
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 group-hover:opacity-40 scale-0 group-hover:scale-75'
                              }`}
                          />
                          <span
                            className={`${TYPOGRAPHY.navSubItem} transition-colors duration-300 ${activeView === subItem.view
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-500 group-hover:text-coral'
                              }`}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Center Column: Title */}
          <div className="flex flex-col items-center justify-center h-full">
            <button onClick={() => { onNavigate(ViewState.HOME); }} className="text-center group">
              <h1 className={`${TYPOGRAPHY.h1} group-hover:opacity-90 transition-opacity whitespace-nowrap`}>
                {getCenterTitle()}
              </h1>
              <div className="w-32 md:w-64 mt-4 mx-auto opacity-90">
                <WaveDecoration />
              </div>
            </button>
          </div>

          {/* Right Column: Social Icons */}
          <div className="hidden md:flex flex-col space-y-6 items-end h-full justify-center">
            <a href="mailto:Yunwustudio@gmail.com" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <Mail size={32} strokeWidth={1.5} />
            </a>
            <a href="https://instagram.com/yun___wu" target="_blank" rel="noreferrer" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <FaInstagram size={30} />
            </a>
            <a href="https://linkedin.com/in/yun-w-0532b5190" target="_blank" rel="noreferrer" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <LinkedInOutline size={30} strokeWidth={1.5} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden absolute top-8 left-8">
            <button onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); }} className="text-gray-800">
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* === MOBILE NAV OVERLAY === */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-8 md:hidden">
            <button onClick={() => { setIsMobileMenuOpen(false); }} className="absolute top-8 right-8">
              <X size={32} />
            </button>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`${TYPOGRAPHY.h1} text-4xl ${activeView === item.view ? 'text-coral' : 'text-gray-600'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* === MAIN CONTENT BODY === */}
        <div id="main-content-body" className="w-full">
          {/* Centralized content wrapper: keep page widths consistent here */}
          <div id="content-container" className={LAYOUT.contentContainer}>
            <div className="animate-slide-up">
              {renderBodyContent()}
            </div>
          </div>

          {/* === FOOTER (Outside content container to align with header) === */}
          <footer id="main-card-footer" className="px-8 md:px-16 md:py-12 mb-24 flex flex-col md:flex-row justify-between items-center text-gray-300 font-light mt-16">
            <div className={`${TYPOGRAPHY.body} text-lg tracking-wide text-gray-300`}>2025 Yun Wu</div>
            {/* Mobile: Icon + text pairs, Desktop: Text only with separators */}
            <div className="flex gap-8 mt-4 md:mt-0">
              {/* Email */}
              <a href="mailto:Yunwustudio@gmail.com" className="flex flex-col items-center gap-2 group">
                <Mail size={24} strokeWidth={1.5} className={`${COLORS.coral} md:hidden group-hover:scale-110 transition-transform`} />
                <span className={`hover:text-coral hover:underline transition-colors ${TYPOGRAPHY.small}`}>EMAIL</span>
              </a>
              <span className="hidden md:inline text-gray-200 self-center">|</span>
              {/* Instagram */}
              <a href="https://instagram.com/yun___wu" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <FaInstagram size={22} className={`${COLORS.coral} md:hidden group-hover:scale-110 transition-transform`} />
                <span className={`hover:text-coral hover:underline transition-colors ${TYPOGRAPHY.small}`}>INSTAGRAM</span>
              </a>
              <span className="hidden md:inline text-gray-200 self-center">|</span>
              {/* LinkedIn */}
              <a href="https://linkedin.com/in/yun-w-0532b5190" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                <LinkedInOutline size={22} strokeWidth={1.5} className={`${COLORS.coral} md:hidden group-hover:scale-110 transition-transform`} />
                <span className={`hover:text-coral hover:underline transition-colors ${TYPOGRAPHY.small}`}>LINKEDIN</span>
              </a>
            </div>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default MainContent;
