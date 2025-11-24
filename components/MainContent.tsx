
import React, { useState } from 'react';
import { Instagram, Linkedin, Mail, Menu, X } from 'lucide-react';
import { ViewState, NavItem } from '../types';
import { WaveDecoration } from './WaveDecoration';
import ProjectFlow from './ProjectFlow';
import Photography from './Photography';
import Design from './Design';
import About from './About';
import Home from './Home';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../styles';

interface MainContentProps {
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home', view: ViewState.HOME },
    { label: 'About', view: ViewState.ABOUT },
    { label: 'Project Flow', view: ViewState.PROJECT_FLOW },
  ];

  const renderBodyContent = () => {
    switch (activeView) {
      case ViewState.PROJECT_FLOW:
        return <ProjectFlow />;
      case ViewState.ABOUT:
        return <About />;
      case ViewState.PHOTOGRAPHY:
        return <Photography />;
      case ViewState.DESIGN:
        return <Design />;
      case ViewState.HOME:
      default:
        return <Home onNavigate={onNavigate} />;
    }
  };

  const getCenterTitle = () => {
    switch (activeView) {
      case ViewState.ABOUT:
        return 'About';
      case ViewState.PROJECT_FLOW:
        return 'Progress';
      case ViewState.PHOTOGRAPHY:
        return 'Gallery';
      case ViewState.HOME:
      default:
        return 'Yun Wu';
    }
  };

  return (
    <div id="container-card" className="min-h-screen bg-offwhite flex items-center justify-center p-4 md:p-8">

      {/* THE MAIN WHITE BOX CONTAINER */}
      <div id="main-card" data-debug="main-card" className={`${LAYOUT.mainCard} overflow-y-auto custom-scrollbar`}>

        {/* === HEADER SECTION === */}
        <div id="main-card-header" className="grid grid-cols-1 md:grid-cols-3 p-8 md:p-16 pb-4 md:pb-8 items-start">

          {/* Left Column: Navigation */}
          <nav id="main-card-nav" className="hidden md:flex flex-col space-y-8 items-start h-full justify-center">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.view)}
                className="flex items-center group w-fit text-left focus:outline-none"
              >
                <span
                  className={`w-3 h-3 rounded-sm bg-coral mr-4 transition-all duration-300 ${activeView === item.view ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-40 scale-0 group-hover:scale-75'
                    }`}
                />
                <span
                  className={`${TYPOGRAPHY.navItem} transition-colors duration-300 ${activeView === item.view ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-coral'
                    }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Center Column: Title */}
          <div className="flex flex-col items-center justify-center h-full">
            <button onClick={() => onNavigate(ViewState.HOME)} className="text-center group">
              <h1 className={`${TYPOGRAPHY.h1} group-hover:opacity-90 transition-opacity whitespace-nowrap`}>
                {getCenterTitle()}
              </h1>
              <div className="w-32 md:w-64 mt-4 mx-auto opacity-90">
                <WaveDecoration />
              </div>
            </button>
          </div>

          {/* Right Column: Social Icons */}
          <div className="hidden md:flex flex-col space-y-8 items-end h-full justify-center pt-2">
            <a href="mailto:Yunwustudio@gmail.com" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <Mail size={32} strokeWidth={1.5} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <Instagram size={32} strokeWidth={1.5} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={`${COLORS.coral} hover:scale-110 transition-transform p-1`}>
              <Linkedin size={32} strokeWidth={1.5} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden absolute top-8 right-8">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800">
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* === MOBILE NAV OVERLAY === */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-8 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8">
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
          <div id="content-container" data-debug="content-container" className={LAYOUT.contentContainer}>
            <div className="animate-slide-up" data-debug="body-animate">
              {renderBodyContent()}
            </div>
          </div>

          {/* === FOOTER (Outside content container to align with header) === */}
          <footer id="main-card-footer" className="px-8 md:px-16 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center text-gray-300 font-light mt-16">
            <div className={`${TYPOGRAPHY.body} text-lg tracking-wide text-gray-300`}>2025 Yun Wu</div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className={`hover:text-coral hover:underline transition-colors ${TYPOGRAPHY.small}`}>EMAIL</a>
              <span className="hidden md:inline text-gray-200">|</span>
              <a href="#" className={`hover:text-coral hover:underline transition-colors ${TYPOGRAPHY.small}`}>INSTAGRAM</a>
            </div>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default MainContent;

