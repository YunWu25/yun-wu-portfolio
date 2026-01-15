import React, { useState, useEffect, useRef } from 'react';
import Typewriter from './Typewriter';
import { ChevronDown } from 'lucide-react';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

interface SplashProps {
  isVisible: boolean;
  onDismiss: () => void;
  language: Language;
}

const Splash: React.FC<SplashProps> = ({ isVisible, onDismiss, language }) => {
  // Key to force re-render (and thus reset) of Typewriter component
  const [typewriterKey, setTypewriterKey] = useState(0);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    // When splash becomes visible (transition from false to true), increment key
    if (isVisible && !wasVisibleRef.current) {
      // Use requestAnimationFrame to defer setState (not synchronous in effect body)
      const id = requestAnimationFrame(() => {
        setTypewriterKey((prev) => prev + 1);
      });
      wasVisibleRef.current = true;
      return () => {
        cancelAnimationFrame(id);
      };
    }
    if (!isVisible) {
      wasVisibleRef.current = false;
    }
    return undefined;
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-between py-16 md:py-24 transition-transform duration-800 cubic-bezier(0.77, 0, 0.175, 1) ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top Section: Main Title */}
      <div className="grow flex flex-col justify-center items-center w-full max-w-[95%] px-4">
        <h1
          data-wobble-target
          className="font-bold ${COLORS.coral} tracking-widest whitespace-nowrap text-[5vw] md:text-[5vw] lg:text-[5vw] xl:text-7xl leading-tight select-none px-6 md:px-12"
        >
          YUN DESIGN PORTFOLIO
        </h1>
      </div>

      {/* Bottom Section: Typewriter Text */}
      <div className="w-full max-w-6xl px-6 flex flex-col items-center mb-12 md:mb-20">
        <div
          data-wobble-target
          className="text-lg md:text-2xl text-darkgray tracking-wide text-center min-h-12"
        >
          <Typewriter
            key={typewriterKey}
            text="Hi Yun 专注于视觉叙事、创意影像和艺术表达"
            startDelay={800}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 animate-bounce cursor-pointer" onClick={onDismiss}>
        <div
          data-wobble-target
          className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <span className={`${TYPOGRAPHY.small} ${COLORS.gray400}`}>
            {language === 'en' ? 'Scroll to Enter' : '滚动进入'}
          </span>
          <ChevronDown className={COLORS.coral} size={24} />
        </div>
      </div>
    </div>
  );
};

export default Splash;
