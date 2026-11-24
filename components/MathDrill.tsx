import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../App';

interface MathDrillProps {
  language: Language;
}

// The drill is a self-contained page in public/math-drill/. It is shown in an
// iframe so its own global styles (body, h1, button, table…) cannot leak into
// the site's layout. Same origin, so we can size the frame to its content and
// tell it when the site language changes (without reloading and losing progress).
const MATH_DRILL_PATH = '/math-drill/index.html';

const MathDrill: React.FC<MathDrillProps> = ({ language }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  // Only the first language goes in the URL; later changes are sent as messages.
  const [src] = useState(() => `${MATH_DRILL_PATH}?lang=${language}`);

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
    frameRef.current?.contentWindow?.postMessage(
      { type: 'math-drill:lang', lang: language },
      window.location.origin
    );
  }, [language]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    // aria-label instead of title: a title shows as a hover tooltip over the whole drill
    <iframe
      ref={frameRef}
      src={src}
      aria-label={language === 'en' ? 'Math reaction speed test' : '数学反应速度测试'}
      onLoad={handleLoad}
      className="block w-full border-0"
      style={{ height: '80vh' }}
    />
  );
};

export default MathDrill;
