import React from 'react';

export const WaveDecoration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 400 60"
    preserveAspectRatio="none"
    className={`w-full h-auto opacity-40 ${className}`}
  >
    <path
      d="M0,30 C100,55 300,5 400,30"
      fill="transparent"
      stroke="#ff6b6b"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
