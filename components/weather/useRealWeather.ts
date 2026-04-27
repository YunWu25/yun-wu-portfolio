import { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherType } from './types';

const POLL_INTERVAL_MS = 15 * 60 * 1000;
const FALLBACK_LAT = 47.6062;
const FALLBACK_LON = -122.3321;

/** Tunable knobs for mapping weather data to visual intensity (1-10) */
const INTENSITY_CONFIG = {
  rain: { precipScale: 5, min: 2, max: 10 },
  snow: { snowfallScale: 3, min: 2, max: 10 },
  wind: { speedThreshold: 30, speedScale: 0.25, min: 3, max: 10 },
  thunder: { base: 5, precipBoost: 3, windBoost: 0.05, min: 5, max: 10 },
  drizzle: { precipScale: 10, min: 2, max: 8 },
};

const clamp = (val: number, min: number, max: number) => Math.round(Math.min(max, Math.max(min, val)));

interface WeatherApiResponse {
  current: {
    weather_code: number;
    temperature_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    rain: number;
    snowfall: number;
    cloud_cover: number;
    wind_gusts_10m: number;
  };
}

interface IpGeoResponse {
  lat: number;
  lon: number;
  city: string;
  regionName: string;
  country: string;
}

export interface RealWeatherData {
  type: WeatherType;
  intensity: number;
  locationName: string;
  temperature: number | null;
  windSpeed: number | null;
  description: string;
}

interface MappedWeather {
  type: WeatherType;
  intensity: number;
  description: string;
}

function mapWeather(code: number, precip: number, rain: number, snowfall: number, windSpeed: number, windGusts: number): MappedWeather {
  const cfg = INTENSITY_CONFIG;

  switch (true) {
    case code === 0:
      return { type: WeatherType.CLEAR, intensity: 1, description: 'Clear sky' };
    case code === 1:
      return { type: WeatherType.CLEAR, intensity: 2, description: 'Mainly clear' };
    case code === 2:
      return { type: WeatherType.CLEAR, intensity: 3, description: 'Partly cloudy' };
    case code === 3:
      return { type: WeatherType.CLEAR, intensity: 1, description: 'Overcast' };

    case code === 45:
    case code === 48:
      return { type: WeatherType.DRIZZLE, intensity: clamp(1, cfg.drizzle.min, cfg.drizzle.max), description: 'Fog' };

    case code === 51:
      return { type: WeatherType.DRIZZLE, intensity: clamp(precip * cfg.drizzle.precipScale, cfg.drizzle.min, 4), description: 'Light drizzle' };
    case code === 53:
      return { type: WeatherType.DRIZZLE, intensity: clamp(precip * cfg.drizzle.precipScale, 4, 6), description: 'Moderate drizzle' };
    case code === 55:
      return { type: WeatherType.DRIZZLE, intensity: clamp(precip * cfg.drizzle.precipScale, 6, cfg.drizzle.max), description: 'Dense drizzle' };
    case code === 56:
      return { type: WeatherType.DRIZZLE, intensity: clamp(precip * cfg.drizzle.precipScale, 3, 5), description: 'Light freezing drizzle' };
    case code === 57:
      return { type: WeatherType.DRIZZLE, intensity: clamp(precip * cfg.drizzle.precipScale, 5, cfg.drizzle.max), description: 'Dense freezing drizzle' };

    case code === 61:
      return { type: WeatherType.RAIN, intensity: clamp(rain * cfg.rain.precipScale, cfg.rain.min, 4), description: 'Slight rain' };
    case code === 63:
      return { type: WeatherType.RAIN, intensity: clamp(rain * cfg.rain.precipScale, 4, 6), description: 'Moderate rain' };
    case code === 65:
      return { type: WeatherType.HEAVY_RAIN, intensity: clamp(rain * cfg.rain.precipScale, 6, cfg.rain.max), description: 'Heavy rain' };
    case code === 66:
      return { type: WeatherType.RAIN, intensity: clamp(rain * cfg.rain.precipScale, 3, 5), description: 'Light freezing rain' };
    case code === 67:
      return { type: WeatherType.HEAVY_RAIN, intensity: clamp(rain * cfg.rain.precipScale, 6, cfg.rain.max), description: 'Heavy freezing rain' };

    case code === 80:
      return { type: WeatherType.RAIN, intensity: clamp(rain * cfg.rain.precipScale, 3, 5), description: 'Slight rain showers' };
    case code === 81:
      return { type: WeatherType.RAIN, intensity: clamp(rain * cfg.rain.precipScale, 5, 7), description: 'Moderate rain showers' };
    case code === 82:
      return { type: WeatherType.HEAVY_RAIN, intensity: clamp(rain * cfg.rain.precipScale, 8, cfg.rain.max), description: 'Violent rain showers' };

    case code === 71:
      return { type: WeatherType.SNOW, intensity: clamp(snowfall * cfg.snow.snowfallScale, cfg.snow.min, 4), description: 'Slight snow' };
    case code === 73:
      return { type: WeatherType.SNOW, intensity: clamp(snowfall * cfg.snow.snowfallScale, 4, 6), description: 'Moderate snow' };
    case code === 75:
      return { type: WeatherType.BLIZZARD, intensity: clamp(snowfall * cfg.snow.snowfallScale, 6, cfg.snow.max), description: 'Heavy snow' };
    case code === 77:
      return { type: WeatherType.SNOW, intensity: clamp(snowfall * cfg.snow.snowfallScale, cfg.snow.min, 4), description: 'Snow grains' };
    case code === 85:
      return { type: WeatherType.SNOW, intensity: clamp(snowfall * cfg.snow.snowfallScale, 3, 5), description: 'Slight snow showers' };
    case code === 86:
      return { type: WeatherType.BLIZZARD, intensity: clamp(snowfall * cfg.snow.snowfallScale, 8, cfg.snow.max), description: 'Heavy snow showers' };

    case code === 95: {
      const ti = cfg.thunder.base + precip * cfg.thunder.precipBoost + windSpeed * cfg.thunder.windBoost;
      return { type: WeatherType.THUNDERSTORM, intensity: clamp(ti, cfg.thunder.min, 8), description: 'Thunderstorm' };
    }
    case code === 96: {
      const ti = cfg.thunder.base + 2 + precip * cfg.thunder.precipBoost + windSpeed * cfg.thunder.windBoost;
      return { type: WeatherType.THUNDERSTORM, intensity: clamp(ti, 7, 9), description: 'Thunderstorm with hail' };
    }
    case code === 99: {
      const ti = cfg.thunder.base + 4 + precip * cfg.thunder.precipBoost + windGusts * cfg.thunder.windBoost;
      return { type: WeatherType.THUNDERSTORM, intensity: clamp(ti, 9, cfg.thunder.max), description: 'Severe thunderstorm' };
    }

    default:
      return { type: WeatherType.CLEAR, intensity: 2, description: 'Unknown' };
  }
}

function applyWindOverride(result: MappedWeather, windSpeed: number): MappedWeather {
  const cfg = INTENSITY_CONFIG.wind;
  if (windSpeed > cfg.speedThreshold && result.type === WeatherType.CLEAR) {
    return {
      type: WeatherType.WIND,
      intensity: clamp(windSpeed * cfg.speedScale, cfg.min, cfg.max),
      description: result.description + ' (windy)',
    };
  }
  return result;
}

async function getLocationByIp(): Promise<{ lat: number; lon: number; city: string }> {
  try {
    const res = await fetch('http://ip-api.com/json/?fields=lat,lon,city,regionName,country');
    if (!res.ok) throw new Error('IP geo failed');
    const data: IpGeoResponse = await res.json();
    if (data.lat && data.lon) {
      return { lat: data.lat, lon: data.lon, city: data.city || 'Unknown' };
    }
  } catch { /* fallback below */ }
  return { lat: FALLBACK_LAT, lon: FALLBACK_LON, city: 'Seattle' };
}

export function useRealWeather(
  onUpdate: (type: WeatherType, intensity: number) => void,
  liveModeRef: React.RefObject<boolean>,
) {
  const [data, setData] = useState<RealWeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const locationRef = useRef<{ lat: number; lon: number; city: string } | null>(null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const fetchWeather = useCallback(async (lat: number, lon: number, city: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,wind_speed_10m,precipitation,rain,snowfall,cloud_cover,wind_gusts_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API: ${res.status}`);

      const json: WeatherApiResponse = await res.json();
      const c = json.current;

      let mapped = mapWeather(c.weather_code, c.precipitation, c.rain, c.snowfall, c.wind_speed_10m, c.wind_gusts_10m);
      mapped = applyWindOverride(mapped, c.wind_speed_10m);

      const result: RealWeatherData = {
        type: mapped.type,
        intensity: mapped.intensity,
        locationName: city,
        temperature: c.temperature_2m,
        windSpeed: c.wind_speed_10m,
        description: mapped.description,
      };

      setData(result);

      if (liveModeRef.current) {
        onUpdateRef.current(result.type, result.intensity);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [liveModeRef]);

  const startPolling = useCallback((lat: number, lon: number, city: string) => {
    void fetchWeather(lat, lon, city);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      void fetchWeather(lat, lon, city);
    }, POLL_INTERVAL_MS);
  }, [fetchWeather]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const activate = useCallback(async () => {
    const loc = locationRef.current ?? await getLocationByIp();
    locationRef.current = loc;
    startPolling(loc.lat, loc.lon, loc.city);
  }, [startPolling]);

  useEffect(() => {
    return () => { stopPolling(); };
  }, [stopPolling]);

  return { data, loading, error, activate, stopPolling };
}
