import React, { useState } from 'react';

const FloatingBubble: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 md:right-16 z-50">
      {/* Pulsing ring effect */}
      <div className="absolute inset-0 rounded-full bg-coral/20 animate-ping" />
      <div className="absolute -inset-1 rounded-full bg-coral/5 animate-pulse" />
      
      <a
        href="https://www.ebay.com/usr/solarheart-studio"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          relative
          w-16 h-16 rounded-full
          bg-coral hover:bg-coral/90
          flex items-center justify-center
          shadow-lg hover:shadow-2xl
          transition-all duration-300 ease-in-out
          border-2 border-white
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}
        onMouseEnter={() => { setIsHovered(true); }}
        onMouseLeave={() => { setIsHovered(false); }}
        aria-label="Visit my eBay Store"
      >
        {/* Shopping Bag Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        
        {/* Tooltip */}
        <span
          className={`
            absolute right-20 top-1/2 -translate-y-1/2
            bg-gray-800 text-white text-sm font-medium
            px-4 py-2 rounded-lg whitespace-nowrap
            shadow-lg
            transition-all duration-200
            ${isHovered ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-2'}
          `}
        >
          Visit my eBay Store
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-gray-800" />
        </span>
      </a>
    </div>
  );
};

export default FloatingBubble;
