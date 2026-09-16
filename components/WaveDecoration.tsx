import React from 'react';

export const WaveDecoration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 400 60"
    preserveAspectRatio="none"
    className={`w-full h-auto text-gray-200 dark:text-dark-border ${className}`}
  >
    <path
      d="M0,30 Q100,45 200,30 T400,30"
      fill="transparent"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
