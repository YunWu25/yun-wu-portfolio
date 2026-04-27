import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeatherState, WeatherType } from './types';
import { useRealWeather } from './useRealWeather';

const defaultState: WeatherState = {
  type: WeatherType.CLEAR,
  intensity: 5,
  enabled: true,
};

const WeatherContext = createContext<WeatherState>(defaultState);

export const useWeather = () => ({ weather: useContext(WeatherContext) });

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherState>(defaultState);

  const onWeatherUpdate = useCallback((type: WeatherType, intensity: number) => {
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

  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
};
