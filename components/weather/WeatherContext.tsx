import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  WeatherType,
  WeatherData,
  getWeatherPreset,
  windDirectionToVector,
} from '../../services/weatherService';

interface MouseState {
  // Normalized coordinates (-1 to 1, where 0,0 is center)
  position: { x: number; y: number };
  // Velocity for ripple effects (pixels per frame, smoothed)
  velocity: { x: number; y: number };
  // Speed magnitude for effect intensity
  speed: number;
}

interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-1
  enabled: boolean;
  windDirection: { x: number; y: number };
  data: WeatherData;
  mouse: MouseState;
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

  // Mouse tracking state
  const [mouse, setMouse] = useState<MouseState>({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    speed: 0,
  });

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseTime = useRef(0);

  // Mouse tracking effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize time on mount
    lastMouseTime.current = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastMouseTime.current);

      // Normalize to -1 to 1 (center is 0,0)
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = -((e.clientY / window.innerHeight) * 2 - 1); // Flip Y for Three.js

      // Calculate velocity (smoothed)
      const rawVelX = (e.clientX - lastMousePos.current.x) / dt;
      const rawVelY = (e.clientY - lastMousePos.current.y) / dt;

      setMouse((prev) => ({
        position: { x: normalizedX, y: normalizedY },
        velocity: {
          // Smooth velocity with lerp
          x: prev.velocity.x * 0.7 + rawVelX * 0.3,
          y: prev.velocity.y * 0.7 + rawVelY * 0.3,
        },
        speed: Math.sqrt(rawVelX * rawVelX + rawVelY * rawVelY),
      }));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = now;
    };

    // Decay velocity when mouse stops
    const decayInterval = setInterval(() => {
      setMouse((prev) => ({
        ...prev,
        velocity: {
          x: prev.velocity.x * 0.95,
          y: prev.velocity.y * 0.95,
        },
        speed: prev.speed * 0.95,
      }));
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(decayInterval);
    };
  }, []);

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
    mouse,
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
