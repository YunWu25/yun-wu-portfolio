import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeatherState, WeatherType } from './types';
import { useRealWeather } from './useRealWeather';
import { isFullMoon } from './moonPhase';
import { weatherEmoji } from './weatherIcons';

declare global {
  interface Window {
    __setWeather?: (type: string, intensity?: number, isDay?: boolean) => void;
    __resetWeather?: () => void;
  }
}

const defaultState: WeatherState = {
  type: WeatherType.CLEAR,
  intensity: 5,
  enabled: true,
  isDay: true,
};

const WeatherContext = createContext<WeatherState>(defaultState);

export const useWeather = () => ({ weather: useContext(WeatherContext) });

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherState>(defaultState);
  const debugOverrideRef = useRef(false);

  const onWeatherUpdate = useCallback((type: WeatherType, intensity: number, isDay: boolean) => {
    if (debugOverrideRef.current) return;
    setWeather(prev => ({ ...prev, type, intensity, isDay, enabled: true }));
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

    window.__setWeather = (type: string, intensity?: number, isDay?: boolean) => {
      const level = intensity ?? 5;
      if (!validTypes.includes(type)) {
        console.log(`[weather debug] Invalid type "${type}". Valid: ${validTypes.join(', ')}`);
        return;
      }
      debugOverrideRef.current = true;
      const isDayResolved = isDay ?? true;
      const emoji = weatherEmoji(type as WeatherType, isDayResolved, isFullMoon(new Date()));
      setWeather({ type: type as WeatherType, intensity: Math.max(1, Math.min(10, level)), enabled: true, isDay: isDayResolved });
      console.log(`[weather debug] ${emoji} Set to ${type} @ intensity ${level} (${isDayResolved ? 'day' : 'night'}) (live updates paused)`);
    };

    window.__resetWeather = () => {
      debugOverrideRef.current = false;
      void activateRef.current();
      console.log('[weather debug] Reset to live weather');
    };

    const nightIsFull = isFullMoon(new Date());
    console.debug(
      '[weather debug] Console commands available:\n' +
      `  __setWeather("rain", 7)     ${weatherEmoji(WeatherType.RAIN, true, false)} — override weather type + intensity\n` +
      `  __setWeather("thunderstorm", 10) ${weatherEmoji(WeatherType.THUNDERSTORM, true, false)}\n` +
      `  __setWeather("snow", 5)     ${weatherEmoji(WeatherType.SNOW, true, false)}\n` +
      `  __setWeather("blizzard", 8) ${weatherEmoji(WeatherType.BLIZZARD, true, false)}\n` +
      `  __setWeather("drizzle", 5)  ${weatherEmoji(WeatherType.DRIZZLE, true, false)}\n` +
      `  __setWeather("wind", 7)     ${weatherEmoji(WeatherType.WIND, true, false)}\n` +
      `  __setWeather("clear", 3)        ${weatherEmoji(WeatherType.CLEAR, true, false)} — daytime sun\n` +
      `  __setWeather("clear", 3, false) ${weatherEmoji(WeatherType.CLEAR, false, nightIsFull)} — force night mode (moon + clouds; tonight's real phase shown here)\n` +
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
