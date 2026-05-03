import React from 'react';

export const WaveDecoration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 400 60"
    preserveAspectRatio="none"
    className={`w-full h-auto ${className}`}
  >
    <path
      d="M0,30 Q100,45 200,30 T400,30"
      fill="transparent"
      stroke="#e5e7eb"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
