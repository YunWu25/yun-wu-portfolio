import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Splash from './components/Splash';
import MainContent from './components/MainContent';
import FloatingBubble from './components/FloatingBubble';
import ChatWidget from './components/chat/ChatWidget';
import {
  BubbleCollisionProvider,
  useGlobalWobbleCollision,
} from './components/BubbleCollisionContext';
import { PhotoManager } from './components/admin/PhotoManager';
import { WeatherProvider } from './components/weather/WeatherContext';
import WeatherSystem from './components/weather/WeatherSystem';
import { ViewState } from './types';
import { SCROLL_THRESHOLDS } from './constants';

export type Language = 'en' | 'zh';

const viewToPath: Record<ViewState, string> = {
  [ViewState.HOME]: '/',
  [ViewState.ABOUT]: '/about',
  [ViewState.PROJECT_FLOW]: '/project-flow',
  [ViewState.PHOTOGRAPHY]: '/photography',
  [ViewState.DESIGN]: '/design',
  [ViewState.VIDEO]: '/video',
  [ViewState.TIME]: '/time',
};

const getViewFromPath = (path: string): ViewState => {
  const entry = Object.entries(viewToPath).find(([_, p]) => p === path);
  return entry ? (entry[0] as ViewState) : ViewState.HOME;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Splash shows on home page, dismissed once per page load (refresh brings it back)
  const [showSplash, setShowSplash] = useState(() => location.pathname === '/');
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage === 'en' || savedLanguage === 'zh' ? savedLanguage : 'en';
  });

  const activeView = getViewFromPath(location.pathname);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Handle Navigation Logic
  const handleNavigate = (view: ViewState) => {
    const path = viewToPath[view];
    void navigate(path);
    if (showSplash) {
      setShowSplash(false);
    }
  };

  // Scroll Handler - only dismisses splash, never brings it back
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!showSplash) return;

      const now = Date.now();
      if (now - lastScrollTime < SCROLL_THRESHOLDS.WHEEL_DEBOUNCE_MS) return;

      if (e.deltaY > SCROLL_THRESHOLDS.SCROLL_DOWN_THRESHOLD) {
        setShowSplash(false);
        setLastScrollTime(now);
      }
    },
    [showSplash, lastScrollTime]
  );

  // Touch Handler for Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchStart(e.touches[0]?.clientY ?? null);
  }, []);

  // Touch Handler - only dismisses splash, never brings it back
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!showSplash || touchStart === null) return;

      const touch = e.touches[0];
      if (!touch) return;

      const currentY = touch.clientY;
      const diff = touchStart - currentY;
      const now = Date.now();

      if (now - lastScrollTime < SCROLL_THRESHOLDS.TOUCH_DEBOUNCE_MS) return;

      if (diff > SCROLL_THRESHOLDS.SWIPE_UP_THRESHOLD) {
        setShowSplash(false);
        setLastScrollTime(now);
      }
    },
    [showSplash, touchStart, lastScrollTime]
  );

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
    <BubbleCollisionProvider>
      <WobbleCollisionDetector />
      <WeatherProvider>
        <div className="relative w-full min-h-screen bg-offwhite text-darkgray font-sans selection:bg-coral selection:text-white overflow-hidden">
          {/* Weather canvas overlay — z-30, pointer-events: none */}
          <WeatherSystem />

          {/* Overlay Splash Screen — z-50 */}
          <Splash
            isVisible={showSplash}
            onDismiss={() => {
              setShowSplash(false);
            }}
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

          {/* Floating eBay Store Bubble */}
          <FloatingBubble />

          {/* AI Chat Widget */}
          <ChatWidget language={language} />
        </div>
      </WeatherProvider>
    </BubbleCollisionProvider>
  );
};

// Component that activates global wobble collision detection
const WobbleCollisionDetector: React.FC = () => {
  useGlobalWobbleCollision();
  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<PhotoManager />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
