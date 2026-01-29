// Weather Service - Mock data layer (API-ready structure)
// This can be swapped with real API calls (e.g., OpenWeatherMap) later

export type WeatherType = 'clear' | 'rain' | 'snow' | 'sunny' | 'windy' | 'foggy';

export interface WeatherData {
  type: WeatherType;
  temperature: number; // Celsius
  humidity: number; // 0-100
  windSpeed: number; // km/h
  windDirection: number; // degrees (0 = North, 90 = East)
  description: string;
}

// Mock weather presets for demonstration
export const WEATHER_PRESETS: Record<WeatherType, WeatherData> = {
  clear: {
    type: 'clear',
    temperature: 22,
    humidity: 45,
    windSpeed: 5,
    windDirection: 180,
    description: 'Clear skies',
  },
  rain: {
    type: 'rain',
    temperature: 15,
    humidity: 85,
    windSpeed: 15,
    windDirection: 270,
    description: 'Rainy weather',
  },
  snow: {
    type: 'snow',
    temperature: -2,
    humidity: 70,
    windSpeed: 8,
    windDirection: 45,
    description: 'Snowy conditions',
  },
  sunny: {
    type: 'sunny',
    temperature: 28,
    humidity: 30,
    windSpeed: 3,
    windDirection: 90,
    description: 'Bright and sunny',
  },
  windy: {
    type: 'windy',
    temperature: 18,
    humidity: 50,
    windSpeed: 35,
    windDirection: 315,
    description: 'Strong winds',
  },
  foggy: {
    type: 'foggy',
    temperature: 12,
    humidity: 95,
    windSpeed: 2,
    windDirection: 0,
    description: 'Dense fog',
  },
};

// Mock API call - replace with real API later
export const getWeather = async (_location?: string): Promise<WeatherData> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return random weather for demo, or specific preset
  const types = Object.keys(WEATHER_PRESETS) as WeatherType[];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return WEATHER_PRESETS[randomType ?? 'clear'];
};

// Get specific weather preset
export const getWeatherPreset = (type: WeatherType): WeatherData => {
  return WEATHER_PRESETS[type];
};

// Convert wind direction degrees to vector for particle effects
export const windDirectionToVector = (
  degrees: number,
  speed: number
): { x: number; y: number } => {
  const radians = (degrees * Math.PI) / 180;
  const normalizedSpeed = speed / 50; // Normalize to 0-1 range
  return {
    x: Math.sin(radians) * normalizedSpeed,
    y: -Math.cos(radians) * normalizedSpeed,
  };
};

// Weather type labels for UI
export const WEATHER_LABELS: Record<WeatherType, { en: string; zh: string }> = {
  clear: { en: 'Clear', zh: '晴朗' },
  rain: { en: 'Rain', zh: '雨天' },
  snow: { en: 'Snow', zh: '雪天' },
  sunny: { en: 'Sunny', zh: '阳光' },
  windy: { en: 'Windy', zh: '大风' },
  foggy: { en: 'Foggy', zh: '雾天' },
};

// Weather icons (Unicode weather symbols)
export const WEATHER_ICONS: Record<WeatherType, string> = {
  clear: '\u2600', // Black sun with rays
  rain: '\u{1F327}', // Cloud with rain
  snow: '\u2744', // Snowflake
  sunny: '\u2600', // Black sun with rays
  windy: '\u{1F32C}', // Wind face
  foggy: '\u{1F32B}', // Fog
};
