import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  WeatherType,
  WeatherData,
  getWeatherPreset,
  windDirectionToVector,
} from '../../services/weatherService';

interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-1
  enabled: boolean;
  windDirection: { x: number; y: number };
  data: WeatherData;
}

interface WeatherContextValue {
  weather: WeatherState;
  setWeatherType: (type: WeatherType) => void;
  setIntensity: (intensity: number) => void;
  setEnabled: (enabled: boolean) => void;
  toggleEnabled: () => void;
}

const DEFAULT_WEATHER_TYPE: WeatherType = 'clear';

const WeatherContext = createContext<WeatherContextValue | null>(null);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage
  const [type, setType] = useState<WeatherType>(() => {
    if (typeof window === 'undefined') return DEFAULT_WEATHER_TYPE;
    const saved = localStorage.getItem('weatherType');
    if (saved && ['clear', 'rain', 'snow', 'sunny', 'windy', 'foggy'].includes(saved)) {
      return saved as WeatherType;
    }
    return DEFAULT_WEATHER_TYPE;
  });

  const [intensity, setIntensityState] = useState(() => {
    if (typeof window === 'undefined') return 0.6;
    const saved = localStorage.getItem('weatherIntensity');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
    return 0.6;
  });

  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('weatherEnabled');
    return saved !== 'false'; // Default to true
  });

  // Derived data from current weather type
  const data = getWeatherPreset(type);
  const windDirection = windDirectionToVector(data.windDirection, data.windSpeed);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('weatherType', type);
  }, [type]);

  useEffect(() => {
    localStorage.setItem('weatherIntensity', intensity.toString());
  }, [intensity]);

  useEffect(() => {
    localStorage.setItem('weatherEnabled', enabled.toString());
  }, [enabled]);

  const setWeatherType = useCallback((newType: WeatherType) => {
    setType(newType);
  }, []);

  const setIntensity = useCallback((newIntensity: number) => {
    setIntensityState(Math.max(0, Math.min(1, newIntensity)));
  }, []);

  const setEnabled = useCallback((newEnabled: boolean) => {
    setEnabledState(newEnabled);
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabledState((prev) => !prev);
  }, []);

  const weather: WeatherState = {
    type,
    intensity,
    enabled,
    windDirection,
    data,
  };

  return (
    <WeatherContext.Provider
      value={{
        weather,
        setWeatherType,
        setIntensity,
        setEnabled,
        toggleEnabled,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextValue => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
};

// Export types for use in other components
export type { WeatherState, WeatherContextValue };
