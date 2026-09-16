import { WeatherType } from './types';

const NIGHT_CLEAR_CRESCENT = '🌙';
const NIGHT_CLEAR_FULL = '🌕';

const DAY_EMOJI: Record<WeatherType, string> = {
  [WeatherType.CLEAR]: '☀️',
  [WeatherType.DRIZZLE]: '🌦️',
  [WeatherType.RAIN]: '🌧️',
  [WeatherType.HEAVY_RAIN]: '🌧️',
  [WeatherType.THUNDERSTORM]: '⛈️',
  [WeatherType.SNOW]: '🌨️',
  [WeatherType.BLIZZARD]: '❄️',
  [WeatherType.WIND]: '💨',
};

/** Emoji preview for a weather state — handy for console debug output */
export function weatherEmoji(type: WeatherType, isDay: boolean, fullMoon: boolean): string {
  if (type === WeatherType.CLEAR && !isDay) {
    return fullMoon ? NIGHT_CLEAR_FULL : NIGHT_CLEAR_CRESCENT;
  }
  return DAY_EMOJI[type];
}
