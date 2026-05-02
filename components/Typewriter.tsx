import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../styles';

interface TypewriterProps {
  text: string;
  className?: string;
  startDelay?: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, className = '', startDelay = 500 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  // Use a Ref to track the current character index without triggering re-renders
  const indexRef = useRef(0);

  // Reset state when text or startDelay changes (or component remounts)
  useEffect(() => {
    const resetId = requestAnimationFrame(() => {
      setDisplayedText('');
      setStarted(false);
    });
    indexRef.current = 0;

    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, startDelay);

    return () => {
      cancelAnimationFrame(resetId);
      clearTimeout(startTimeout);
    };
  }, [startDelay, text]);

  // Typing Logic
  useEffect(() => {
    if (!started) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const typeCharacter = () => {
      const currentIndex = indexRef.current;

      if (currentIndex < text.length) {
        // Slice includes the character at currentIndex
        const nextText = text.slice(0, currentIndex + 1);
        setDisplayedText(nextText);
        indexRef.current = currentIndex + 1;

        // Increased Jitter: Random delay between 50ms and 250ms for a more "human" feel
        const randomDelay = Math.random() * 150 + 50;
        timeoutId = setTimeout(typeCharacter, randomDelay);
      }
    };

    // Start typing the first character immediately
    typeCharacter();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, started]);

  return (
    <span className={`${className} font-light`}>
      {displayedText}
      {/* Cursor blinks continuously */}
      <span className={`animate-blink ${COLORS.coral} font-bold inline-block ml-1`}>|</span>
    </span>
  );
};

export default Typewriter;
