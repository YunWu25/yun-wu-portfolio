import React, { useState, useRef, useEffect } from 'react';
import { useWeather } from './WeatherContext';
import { WeatherType, WEATHER_LABELS, WEATHER_ICONS } from '../../services/weatherService';
import { BORDERS, COLORS, SHADOWS } from '../../styles';
import { Language } from '../../App';

interface WeatherToggleProps {
  language: Language;
}

const WEATHER_TYPES: WeatherType[] = ['clear', 'rain', 'snow', 'sunny', 'windy', 'foggy'];

const WeatherToggle: React.FC<WeatherToggleProps> = ({ language }) => {
  const { weather, setWeatherType, toggleEnabled } = useWeather();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLabel = WEATHER_LABELS[weather.type][language];
  const currentIcon = WEATHER_ICONS[weather.type];

  const handleSelect = (type: WeatherType) => {
    setWeatherType(type);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Mobile: Single toggle button */}
      <button
        onClick={() => {
          if (weather.enabled) {
            setIsOpen(!isOpen);
          } else {
            toggleEnabled();
          }
        }}
        className={`md:hidden flex items-center gap-1.5 bg-white px-3 py-1.5 ${BORDERS.radius.sm} border ${COLORS.borderGray200} ${SHADOWS.sm} text-sm font-medium transition-colors ${
          weather.enabled ? COLORS.coral : 'text-gray-400'
        }`}
      >
        <span>{currentIcon}</span>
        <span className="sr-only">{currentLabel}</span>
      </button>

      {/* Desktop: Full control */}
      <div
        className={`hidden md:flex bg-white px-3 py-1.5 ${BORDERS.radius.sm} border ${COLORS.borderGray200} ${SHADOWS.sm} items-center gap-2`}
      >
        {/* Enable/Disable toggle */}
        <button
          onClick={toggleEnabled}
          className={`px-2 py-1 rounded transition-colors text-sm ${
            weather.enabled ? 'bg-coral text-white' : `${COLORS.gray500} hover:text-coral`
          }`}
          title={weather.enabled ? 'Disable weather effects' : 'Enable weather effects'}
        >
          {currentIcon}
        </button>

        <span className={COLORS.gray300}>|</span>

        {/* Weather type selector */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          disabled={!weather.enabled}
          className={`px-2 py-1 rounded transition-colors text-sm flex items-center gap-1 ${
            weather.enabled
              ? `${COLORS.gray500} hover:text-coral`
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <span>{currentLabel}</span>
          <svg
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-1 bg-white ${BORDERS.radius.sm} border ${COLORS.borderGray200} ${SHADOWS.md} py-1 min-w-[120px] z-50`}
        >
          {WEATHER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                handleSelect(type);
              }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                weather.type === type
                  ? 'bg-coral/10 text-coral'
                  : `${COLORS.gray600} hover:bg-gray-50 hover:text-coral`
              }`}
            >
              <span>{WEATHER_ICONS[type]}</span>
              <span>{WEATHER_LABELS[type][language]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherToggle;
