import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWeather } from './WeatherContext';
import { WeatherType } from './types';

const WEATHER_OPTIONS: Array<{
  type: WeatherType;
  icon: string;
  label: string;
}> = [
  { type: WeatherType.CLEAR, icon: '☀️', label: 'Clear' },
  { type: WeatherType.DRIZZLE, icon: '🌦️', label: 'Drizzle' },
  { type: WeatherType.RAIN, icon: '🌧️', label: 'Rain' },
  { type: WeatherType.HEAVY_RAIN, icon: '🌧️', label: 'Heavy Rain' },
  { type: WeatherType.THUNDERSTORM, icon: '⛈️', label: 'Thunder' },
  { type: WeatherType.SNOW, icon: '🌨️', label: 'Snow' },
  { type: WeatherType.BLIZZARD, icon: '❄️', label: 'Blizzard' },
  { type: WeatherType.WIND, icon: '💨', label: 'Wind' },
];

const HIDE_DELAY_MS = 4000;

const WeatherController: React.FC = () => {
  const { weather, setWeatherType, setIntensity, toggleEnabled, liveMode, setLiveMode, liveDescription, liveLoading } = useWeather();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const isExpandedRef = useRef(isExpanded);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!isExpandedRef.current) setIsVisible(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  // Initial hide timer
  useEffect(() => {
    scheduleHide();
    return clearHideTimer;
  }, [scheduleHide, clearHideTimer]);

  // When expanded changes, manage visibility
  useEffect(() => {
    if (isExpanded) {
      clearHideTimer();
    } else {
      scheduleHide();
    }
  }, [isExpanded, clearHideTimer, scheduleHide]);

  // Close on outside click
  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('mousedown', handleClick); };
  }, [isExpanded]);

  const currentOption = WEATHER_OPTIONS.find(o => o.type === weather.type) ?? WEATHER_OPTIONS[0];

  return (
    <div
      ref={containerRef}
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-[45] transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      onMouseEnter={() => {
        setIsVisible(true);
        clearHideTimer();
      }}
      onMouseLeave={() => {
        if (!isExpandedRef.current) scheduleHide();
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
        {/* Toggle on/off */}
        <button
          onClick={() => { toggleEnabled(); }}
          className={`w-8 h-5 rounded-full transition-colors relative flex-shrink-0 ${
            weather.enabled ? 'bg-coral' : 'bg-gray-300'
          }`}
          title={weather.enabled ? 'Disable weather' : 'Enable weather'}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              weather.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </button>

        {/* Live weather toggle */}
        <button
          onClick={() => { setLiveMode(!liveMode); }}
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
            liveMode
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 hover:text-gray-600'
          }`}
          title={liveMode ? `Live: ${liveDescription ?? 'fetching...'}` : 'Enable live weather from your location'}
        >
          {liveLoading ? '...' : '📍 Live'}
        </button>

        {/* Weather type selector button */}
        <button
          onClick={() => { setIsExpanded(!isExpanded); }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-gray-50 transition-colors ${liveMode ? 'opacity-50' : ''}`}
        >
          <span className="text-lg leading-none">{currentOption?.icon}</span>
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">
            {liveMode && liveDescription ? liveDescription : currentOption?.label}
          </span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Intensity slider */}
        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider hidden sm:inline">
            Int
          </span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={weather.intensity}
            onChange={(e) => { setIntensity(Number(e.target.value)); }}
            className="w-16 sm:w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125"
            title={`Intensity: ${weather.intensity}`}
          />
          <span className="text-xs font-bold text-coral w-4 text-center">
            {weather.intensity}
          </span>
        </div>
      </div>

      {/* Expanded: weather type grid */}
      {isExpanded && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-3 min-w-[280px] animate-slide-down">
          <div className="grid grid-cols-4 gap-1">
            {WEATHER_OPTIONS.map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  setWeatherType(option.type);
                  setIsExpanded(false);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  weather.type === option.type
                    ? 'bg-coral/10 ring-1 ring-coral'
                    : 'hover:bg-gray-50'
                }`}
                title={option.label}
              >
                <span className="text-xl">{option.icon}</span>
                <span
                  className={`text-[9px] font-medium leading-tight text-center ${
                    weather.type === option.type ? 'text-coral' : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherController;
