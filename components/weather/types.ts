export enum WeatherType {
  CLEAR = 'clear',
  DRIZZLE = 'drizzle',
  RAIN = 'rain',
  HEAVY_RAIN = 'heavy_rain',
  THUNDERSTORM = 'thunderstorm',
  SNOW = 'snow',
  BLIZZARD = 'blizzard',
  WIND = 'wind',
}

export interface WeatherState {
  type: WeatherType;
  intensity: number; // 1-10
  enabled: boolean;
}

export interface WindVector {
  x: number; // horizontal force (-1 to 1)
  y: number; // vertical force (positive = downward boost, negative = updraft)
  gustStrength: number;
  gustFrequency: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number; // 0-1: parallax depth
  life: number; // 0-1: remaining life
  maxLife: number;
  type: 'rain' | 'snow' | 'splash' | 'mist' | 'dust' | 'debris';
  length?: number;
  wobblePhase?: number;
  wobbleSpeed?: number;
  rotation?: number;
}

export interface LightningBolt {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  branches: LightningBolt[];
  opacity: number;
  life: number;
  glowRadius: number;
  hitPoint: { x: number; y: number } | null;
}

export interface CollisionRect {
  id: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface WeatherPreset {
  particleCount: number;
  wind: WindVector;
  particleTypes: Particle['type'][];
  hasLightning: boolean;
  hasSunRays: boolean;
  hasAccumulation: boolean;
  glassStreaks: boolean;
  speed: { min: number; max: number };
  size: { min: number; max: number };
}
