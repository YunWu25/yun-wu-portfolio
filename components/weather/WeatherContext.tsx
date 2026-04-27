import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeatherState, WeatherType } from './types';
import { useRealWeather } from './useRealWeather';

declare global {
  interface Window {
    __setWeather?: (type: string, intensity?: number) => void;
    __resetWeather?: () => void;
  }
}

const defaultState: WeatherState = {
  type: WeatherType.CLEAR,
  intensity: 5,
  enabled: true,
};

const WeatherContext = createContext<WeatherState>(defaultState);

export const useWeather = () => ({ weather: useContext(WeatherContext) });

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherState>(defaultState);
  const debugOverrideRef = useRef(false);

  const onWeatherUpdate = useCallback((type: WeatherType, intensity: number) => {
    if (debugOverrideRef.current) return;
    setWeather(prev => ({ ...prev, type, intensity, enabled: true }));
  }, []);

  const { activate } = useRealWeather(onWeatherUpdate);

  const activateRef = useRef(activate);
  useEffect(() => {
    activateRef.current = activate;
  }, [activate]);

  useEffect(() => {
    void activateRef.current();
  }, []);

  useEffect(() => {
    const validTypes = Object.values(WeatherType) as string[];

    window.__setWeather = (type: string, intensity?: number) => {
      const level = intensity ?? 5;
      if (!validTypes.includes(type)) {
        console.log(`[weather debug] Invalid type "${type}". Valid: ${validTypes.join(', ')}`);
        return;
      }
      debugOverrideRef.current = true;
      setWeather({ type: type as WeatherType, intensity: Math.max(1, Math.min(10, level)), enabled: true });
      console.log(`[weather debug] Set to ${type} @ intensity ${level} (live updates paused)`);
    };

    window.__resetWeather = () => {
      debugOverrideRef.current = false;
      void activateRef.current();
      console.log('[weather debug] Reset to live weather');
    };

    console.debug(
      '[weather debug] Console commands available:\n' +
      '  __setWeather("rain", 7)     — override weather type + intensity\n' +
      '  __setWeather("thunderstorm", 10)\n' +
      '  __setWeather("snow", 5)\n' +
      `  Valid types: ${validTypes.join(', ')}\n` +
      '  __resetWeather()            — resume live weather'
    );

    return () => {
      delete window.__setWeather;
      delete window.__resetWeather;
    };
  }, []);

  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
};
