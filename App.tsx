
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import Splash from './components/Splash';
import MainContent from './components/MainContent';
import { ViewState } from './types';

export type Language = 'en' | 'zh';

const viewToPath: Record<ViewState, string> = {
  [ViewState.HOME]: '/',
  [ViewState.ABOUT]: '/about',
  [ViewState.PROJECT_FLOW]: '/project-flow',
  [ViewState.PHOTOGRAPHY]: '/photography',
  [ViewState.DESIGN]: '/design',
};

const getViewFromPath = (path: string): ViewState => {
  const entry = Object.entries(viewToPath).find(([_, p]) => p === path);
  return entry ? (entry[0] as ViewState) : ViewState.HOME;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    const saved = sessionStorage.getItem('showSplash');
    if (saved !== null) return saved === 'true';
    return location.pathname === '/';
  });
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'zh') ? savedLanguage : 'en';
  });

  const activeView = getViewFromPath(location.pathname);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    sessionStorage.setItem('showSplash', showSplash.toString());
  }, [showSplash]);

  // Helper to check if the event target is inside a scrollable container that isn't at the top
  const isScrollableAndNotAtTop = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;

    // Find the closest scrollable container (in MainContent.tsx, it has overflow-y-auto)
    const scrollableContainer = target.closest('.overflow-y-auto');

    if (scrollableContainer) {
      // If scrollTop > 0, we are scrolled down, so scrolling up should just scroll content, not show splash
      if (scrollableContainer.scrollTop > 0) {
        return true;
      }
    }
    return false;
  };

  // Handle Navigation Logic
  const handleNavigate = (view: ViewState) => {
    const path = viewToPath[view];
    navigate(path);
    if (showSplash) {
      setShowSplash(false);
    }
  };

  // Scroll Handler
  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now();
    // Debounce scroll events to prevent jittery state flipping
    if (now - lastScrollTime < 1200) return;

    if (e.deltaY > 50 && showSplash) {
      // Scrolling Down: Hide Splash
      setShowSplash(false);
      setLastScrollTime(now);
    } else if (e.deltaY < -80 && !showSplash) {
      // Scrolling Up

      // Check if we are inside scrollable content that is NOT at the top
      if (isScrollableAndNotAtTop(e.target)) {
        return; // Allow default scrolling behavior inside the div
      }

      // Only show splash if we are at the top of the content
      setShowSplash(true);
      setLastScrollTime(now);
    }
  }, [showSplash, lastScrollTime]);

  // Touch Handler for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStart === null) return;

    const currentY = e.touches[0].clientY;
    const diff = touchStart - currentY;
    const now = Date.now();

    if (now - lastScrollTime < 1000) return;

    if (diff > 50 && showSplash) {
      // Swipe Up (Scroll Down equivalent): Hide Splash
      setShowSplash(false);
      setLastScrollTime(now);
    } else if (diff < -80 && !showSplash) {
      // Swipe Down (Scroll Up equivalent): Show Splash

      // Check if internal content is scrolled down
      if (isScrollableAndNotAtTop(e.target)) {
        return;
      }

      setShowSplash(true);
      setLastScrollTime(now);
    }
  }, [showSplash, touchStart, lastScrollTime]);

  useEffect(() => {
    // Use passive: false allows preventing default if needed, though we rely on logic branching here
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleTouchMove, handleTouchStart]);

  return (
    <div className="relative w-full min-h-screen bg-offwhite text-darkgray font-sans selection:bg-coral selection:text-white overflow-hidden">

      {/* Overlay Splash Screen */}
      <Splash
        isVisible={showSplash}
        onDismiss={() => setShowSplash(false)}
        language={language}
      />

      {/* Main Site Content */}
      <div
        className={`transition-opacity duration-1000 h-screen w-full flex items-center justify-center ${showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        <MainContent
          activeView={activeView}
          onNavigate={handleNavigate}
          language={language}
          setLanguage={setLanguage}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
