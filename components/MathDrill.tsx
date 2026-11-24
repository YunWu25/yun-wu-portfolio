import React, { useCallback, useEffect, useRef } from 'react';
import { Language } from '../App';

interface MathDrillProps {
  language: Language;
}

// The drill is a self-contained page in public/math-drill/. It is shown in an
// iframe so its own global styles (body, h1, button, table…) cannot leak into
// the site's layout. Same origin, so we can size the frame to its content.
const MATH_DRILL_SRC = '/math-drill/index.html';

const MathDrill: React.FC<MathDrillProps> = ({ language }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const handleLoad = useCallback(() => {
    const frame = frameRef.current;
    const body = frame?.contentDocument?.body;
    if (!frame || !body) return;

    const fit = () => {
      frame.style.height = `${String(Math.ceil(body.getBoundingClientRect().height))}px`;
    };
    observerRef.current?.disconnect();
    observerRef.current = new ResizeObserver(fit);
    observerRef.current.observe(body);
    fit();
  }, []);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      src={MATH_DRILL_SRC}
      title={language === 'en' ? 'Math reaction speed drill' : '数学反应速度测试'}
      onLoad={handleLoad}
      className="block w-full border-0 rounded-xl"
      style={{ height: '80vh' }}
    />
  );
};

export default MathDrill;
