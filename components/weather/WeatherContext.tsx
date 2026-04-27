import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeatherState, WeatherType } from './types';
import { useRealWeather } from './useRealWeather';

interface WeatherContextValue {
  weather: WeatherState;
  setWeatherType: (type: WeatherType) => void;
  setIntensity: (intensity: number) => void;
  toggleEnabled: () => void;
  liveMode: boolean;
  setLiveMode: (live: boolean) => void;
  liveDescription: string | null;
  liveLoading: boolean;
}

const defaultState: WeatherState = {
  type: WeatherType.CLEAR,
  intensity: 5,
  enabled: true,
};

const WeatherContext = createContext<WeatherContextValue>({
  weather: defaultState,
  setWeatherType: () => {},
  setIntensity: () => {},
  toggleEnabled: () => {},
  liveMode: false,
  setLiveMode: () => {},
  liveDescription: null,
  liveLoading: false,
});

export const useWeather = () => useContext(WeatherContext);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherState>(() => {
    try {
      const saved = localStorage.getItem('weatherState');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<WeatherState>;
        if (parsed.type && typeof parsed.intensity === 'number') {
          return parsed as WeatherState;
        }
      }
    } catch {
      /* ignore */
    }
    return defaultState;
  });

  const [liveMode, setLiveModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('weatherLiveMode') === 'true';
    } catch {
      return false;
    }
  });

  const weatherRef = useRef(weather);
  const liveModeRef = useRef(liveMode);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    liveModeRef.current = liveMode;
  }, [liveMode]);

  const onWeatherUpdate = useCallback((type: WeatherType, intensity: number) => {
    setWeather(prev => {
      const next = { ...prev, type, intensity, enabled: true };
      try { localStorage.setItem('weatherState', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const { data: realWeather, loading: liveLoading, activate, stopPolling } = useRealWeather(onWeatherUpdate, liveModeRef);

  const persist = useCallback((state: WeatherState) => {
    setWeather(state);
    try {
      localStorage.setItem('weatherState', JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, []);

  const setWeatherType = useCallback(
    (type: WeatherType) => {
      if (liveModeRef.current) {
        setLiveModeState(false);
        try { localStorage.setItem('weatherLiveMode', 'false'); } catch { /* ignore */ }
      }
      persist({ ...weatherRef.current, type });
    },
    [persist]
  );

  const setIntensity = useCallback(
    (intensity: number) => {
      if (liveModeRef.current) {
        setLiveModeState(false);
        try { localStorage.setItem('weatherLiveMode', 'false'); } catch { /* ignore */ }
      }
      persist({ ...weatherRef.current, intensity: Math.max(1, Math.min(10, intensity)) });
    },
    [persist]
  );

  const toggleEnabled = useCallback(
    () => {
      persist({ ...weatherRef.current, enabled: !weatherRef.current.enabled });
    },
    [persist]
  );

  const setLiveMode = useCallback((live: boolean) => {
    setLiveModeState(live);
    try { localStorage.setItem('weatherLiveMode', String(live)); } catch { /* ignore */ }
    if (live) {
      void activate();
    } else {
      stopPolling();
    }
  }, [activate, stopPolling]);

  const activateRef = useRef(activate);
  useEffect(() => {
    activateRef.current = activate;
  }, [activate]);

  useEffect(() => {
    if (liveModeRef.current) {
      void activateRef.current();
    }
  }, []);

  const liveDescription = liveMode && realWeather ? realWeather.description : null;

  return (
    <WeatherContext.Provider value={{
      weather, setWeatherType, setIntensity, toggleEnabled,
      liveMode, setLiveMode, liveDescription, liveLoading,
    }}>
      {children}
    </WeatherContext.Provider>
  );
};
