// Weather Effects System
// Export all weather-related components and utilities

export { WeatherProvider, useWeather } from './WeatherContext';
export type { WeatherState, WeatherContextValue } from './WeatherContext';

export { default as WeatherCanvas } from './WeatherCanvas';
export { default as WeatherToggle } from './WeatherToggle';

// Individual effects (for advanced usage)
export { default as RainEffect } from './RainEffect';
export { default as SnowEffect } from './SnowEffect';
export { default as SunEffect } from './SunEffect';
export { default as WindEffect } from './WindEffect';
export { default as FogEffect } from './FogEffect';
