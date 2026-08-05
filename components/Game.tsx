import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Language } from '../App';
import { TYPOGRAPHY, COLORS } from '../styles';

interface GameProps {
  language: Language;
}

// Collectible items with spawn weights, emojis, and sizes
const COLLECTIBLES_CONFIG = [
  // Snacks & Junk Food (smaller items)
  { emoji: '☕', name: 'Coffee', nameCn: '咖啡', weight: 10, points: 50, size: 28 },
  { emoji: '🌭', name: 'Hotdog', nameCn: '热狗', weight: 20, points: 30, size: 32 },
  { emoji: '🍪', name: 'Oreos', nameCn: '奥利奥', weight: 5, points: 80, size: 24 },
  { emoji: '🔺', name: 'Doritos', nameCn: '多力多滋', weight: 20, points: 30, size: 26 },
  { emoji: '🥜', name: "Reese's", nameCn: '花生酱杯', weight: 10, points: 60, size: 24 },
  { emoji: '🧀', name: 'Cheetos', nameCn: '奇多', weight: 5, points: 80, size: 26 },
  { emoji: '🟧', name: 'Cheez-Its', nameCn: '芝士饼', weight: 5, points: 80, size: 22 },
  { emoji: '🥨', name: 'Chex Mix', nameCn: '杂锦饼', weight: 5, points: 80, size: 26 },
  { emoji: '🍿', name: 'Popcorn', nameCn: '爆米花', weight: 10, points: 50, size: 28 },
  { emoji: '🍫', name: 'Chocolate Cup', nameCn: '巧克力杯', weight: 2, points: 150, size: 30 },
  { emoji: '🍫', name: 'Chocolate Bar', nameCn: '巧克力棒', weight: 5, points: 100, size: 28 },
  { emoji: '🍚', name: 'Rice Krispie', nameCn: '米花糖', weight: 10, points: 50, size: 24 },
  { emoji: '🍬', name: 'Hard Candy', nameCn: '硬糖', weight: 20, points: 25, size: 20 },
  { emoji: '🐻', name: 'Gummies', nameCn: '小熊软糖', weight: 10, points: 50, size: 22 },
  { emoji: '🟤', name: 'Caramel', nameCn: '焦糖', weight: 5, points: 80, size: 20 },
  // Healthy Vegetables (bigger items, more points!)
  { emoji: '🥬', name: 'Spinach', nameCn: '菠菜', weight: 5, points: 120, size: 32 },
  { emoji: '🧅', name: 'Onion', nameCn: '洋葱', weight: 5, points: 100, size: 30 },
  { emoji: '🥦', name: 'Broccoli', nameCn: '西兰花', weight: 5, points: 120, size: 34 },
  { emoji: '🥒', name: 'Cucumber', nameCn: '黄瓜', weight: 5, points: 100, size: 32 },
  { emoji: '🌽', name: 'Corn', nameCn: '玉米', weight: 8, points: 90, size: 36, givesLife: true },
  { emoji: '🍆', name: 'Eggplant', nameCn: '茄子', weight: 5, points: 100, size: 34 },
  { emoji: '🍅', name: 'Tomato', nameCn: '番茄', weight: 6, points: 110, size: 32, givesLife: true },
];

// Calculate total weight for random selection
const TOTAL_WEIGHT = COLLECTIBLES_CONFIG.reduce((sum, item) => sum + item.weight, 0);

// Obstacle items - things the cat doesn't want! (seafood dishes, not cute animals)
const OBSTACLE_CONFIG = [
  // Vegetables cat doesn't like
  { emoji: '🥕', name: 'Carrot', nameCn: '胡萝卜' },
  { emoji: '🎃', name: 'Pumpkin', nameCn: '南瓜' },
  { emoji: '🌶️', name: 'Red Pepper', nameCn: '红辣椒' },
  { emoji: '🫑', name: 'Green Pepper', nameCn: '青椒' },
  // Seafood dishes (look like food, not cute animals)
  { emoji: '🍤', name: 'Fried Shrimp', nameCn: '炸虾' },
  { emoji: '🦪', name: 'Oyster', nameCn: '生蚝' },
  { emoji: '🦀', name: 'Cooked Crab', nameCn: '螃蟹' },
  { emoji: '🦞', name: 'Lobster Dish', nameCn: '龙虾' },
  { emoji: '🍣', name: 'Sushi', nameCn: '寿司' },
  { emoji: '🦑', name: 'Calamari', nameCn: '鱿鱼' },
  { emoji: '🍥', name: 'Fish Cake', nameCn: '鱼饼' },
  { emoji: '🍢', name: 'Oden Skewer', nameCn: '关东煮' },
];

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  emoji: string;
  name: string;
  nameCn: string;
  color: string;
}

interface Collectible {
  x: number;
  y: number;
  size: number;
  emoji: string;
  name: string;
  nameCn: string;
  points: number;
  collected: boolean;
  givesLife: boolean;
}

interface CollectedItem {
  name: string;
  nameCn: string;
  emoji: string;
  points: number;
  timestamp: number;
}

interface FoodCount {
  emoji: string;
  name: string;
  nameCn: string;
  count: number;
  totalPoints: number;
}

// Platform/step for Mario-style jumping
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'brick' | 'block' | 'pipe';
}

// Difficulty settings
type Difficulty = 'easy' | 'medium' | 'hard';

// Special theme types for birthdays and holidays
type SpecialTheme =
  | 'birthday-casey' | 'birthday-yun' | 'birthday-sequoia' | 'birthday-suyuefeng'
  | 'birthday-mom' | 'birthday-shelina' | 'birthday-sourav' | 'birthday-ryan'
  | 'holiday-christmas' | 'holiday-valentine' | 'holiday-laborday' | 'holiday-armedforces'
  | 'holiday-chinesenewyear' | 'holiday-thanksgiving'
  | null;

// Background types
type BackgroundType = 'sky' | 'sunset' | 'night' | 'kitchen' | 'nature' | 'birthday' | 'christmas' | 'valentine' | 'autumn' | 'spring';

const TRENDING_BACKGROUNDS: BackgroundType[] = ['sky', 'sunset', 'night', 'nature', 'spring', 'kitchen'];

// Birthday configurations
interface BirthdayConfig {
  name: string;
  month: number; // 0-indexed
  day: number;
  message: string;
  messageCn: string;
}

const BIRTHDAYS: BirthdayConfig[] = [
  { name: "Let's Game", month: 7, day: 4, message: "🎮 Happy Birthday Let's Game! 🎮", messageCn: '🎮 Let\'s Game 周年快乐！🎮' },
  { name: 'Casey', month: 7, day: 5, message: 'Happy Birthday Casey!', messageCn: '祝 Casey 生日快乐！' },
  { name: 'Yun', month: 5, day: 8, message: 'Happy Birthday Yun!', messageCn: '祝 Yun 生日快乐！' },
  { name: 'Sequoia', month: 11, day: 5, message: 'Happy Birthday Sequoia!', messageCn: '祝 Sequoia 生日快乐！' },
  { name: '苏月凤', month: 10, day: 14, message: 'Happy Birthday 苏月凤!', messageCn: '祝苏月凤生日快乐！' },
  { name: 'Mom', month: 10, day: 18, message: 'Happy Birthday Mom!', messageCn: '祝妈妈生日快乐！' },
  { name: 'Shelina C', month: 0, day: 11, message: 'Happy Birthday Shelina!', messageCn: '祝 Shelina 生日快乐！' },
  { name: 'Sourav', month: 5, day: 3, message: 'Happy Birthday Sourav!', messageCn: '祝 Sourav 生日快乐！' },
  { name: 'Ryan Chandler', month: 6, day: 16, message: 'Happy Birthday Ryan!', messageCn: '祝 Ryan 生日快乐！' },
];

// Holiday configurations
interface HolidayConfig {
  name: string;
  theme: SpecialTheme;
  background: BackgroundType;
  check: () => boolean;
  message: string;
  messageCn: string;
}

// Helper to check if date is within range
const isDateInRange = (month: number, startDay: number, endDay: number): boolean => {
  const today = new Date();
  return today.getMonth() === month && today.getDate() >= startDay && today.getDate() <= endDay;
};

// Chinese New Year dates (approximate, varies each year)
const getChineseNewYearRange = (): { month: number; startDay: number; endDay: number } => {
  const year = new Date().getFullYear();
  // Approximate dates - Chinese New Year falls between Jan 21 and Feb 20
  const cnyDates: Record<number, { month: number; day: number }> = {
    2024: { month: 1, day: 10 }, // Feb 10, 2024
    2025: { month: 0, day: 29 }, // Jan 29, 2025
    2026: { month: 1, day: 17 }, // Feb 17, 2026
    2027: { month: 1, day: 6 },  // Feb 6, 2027
  };
  const cny = cnyDates[year] ?? { month: 1, day: 1 };
  return { month: cny.month, startDay: cny.day, endDay: cny.day + 7 };
};

// Thanksgiving (4th Thursday of November)
const getThanksgivingDate = (): number => {
  const year = new Date().getFullYear();
  const nov1 = new Date(year, 10, 1);
  const dayOfWeek = nov1.getDay();
  const firstThursday = dayOfWeek <= 4 ? 5 - dayOfWeek : 12 - dayOfWeek;
  return firstThursday + 21; // 4th Thursday
};

const HOLIDAYS: HolidayConfig[] = [
  {
    name: 'Christmas',
    theme: 'holiday-christmas',
    background: 'christmas',
    check: () => isDateInRange(11, 20, 26), // Dec 20-26
    message: '🎄 Merry Christmas! 🎅',
    messageCn: '🎄 圣诞快乐！🎅',
  },
  {
    name: "Valentine's Day",
    theme: 'holiday-valentine',
    background: 'valentine',
    check: () => isDateInRange(1, 12, 15), // Feb 12-15
    message: '💕 Happy Valentine\'s Day! 💕',
    messageCn: '💕 情人节快乐！💕',
  },
  {
    name: 'Labor Day',
    theme: 'holiday-laborday',
    background: 'sky',
    check: () => {
      const today = new Date();
      if (today.getMonth() !== 8) return false; // September
      // First Monday of September
      const sept1 = new Date(today.getFullYear(), 8, 1);
      const firstMonday = sept1.getDay() === 0 ? 2 : (sept1.getDay() === 1 ? 1 : 9 - sept1.getDay());
      return today.getDate() >= firstMonday && today.getDate() <= firstMonday + 1;
    },
    message: '🛠️ Happy Labor Day! 🇺🇸',
    messageCn: '🛠️ 劳动节快乐！🇺🇸',
  },
  {
    name: 'Armed Forces Day',
    theme: 'holiday-armedforces',
    background: 'sky',
    check: () => {
      const today = new Date();
      if (today.getMonth() !== 4) return false; // May
      // Third Saturday of May
      const may1 = new Date(today.getFullYear(), 4, 1);
      const firstSat = may1.getDay() === 6 ? 1 : 7 - may1.getDay() + 1;
      const thirdSat = firstSat + 14;
      return today.getDate() === thirdSat;
    },
    message: '🎖️ Armed Forces Day 🇺🇸',
    messageCn: '🎖️ 军人节 🇺🇸',
  },
  {
    name: 'Chinese New Year',
    theme: 'holiday-chinesenewyear',
    background: 'sunset',
    check: () => {
      const cny = getChineseNewYearRange();
      return isDateInRange(cny.month, cny.startDay, cny.endDay);
    },
    message: '🧧 新年快乐！恭喜发财！🐉',
    messageCn: '🧧 新年快乐！恭喜发财！🐉',
  },
  {
    name: 'Thanksgiving',
    theme: 'holiday-thanksgiving',
    background: 'autumn',
    check: () => {
      const today = new Date();
      if (today.getMonth() !== 10) return false; // November
      const thanksgivingDay = getThanksgivingDate();
      return today.getDate() >= thanksgivingDay && today.getDate() <= thanksgivingDay + 1;
    },
    message: '🦃 Happy Thanksgiving! 🍂',
    messageCn: '🦃 感恩节快乐！🍂',
  },
];

// Get current special theme (birthday or holiday)
const getSpecialTheme = (): { theme: SpecialTheme; birthday?: BirthdayConfig; holiday?: HolidayConfig } => {
  const today = new Date();

  // Check birthdays first
  for (const bday of BIRTHDAYS) {
    if (today.getMonth() === bday.month && today.getDate() === bday.day) {
      const themeName = `birthday-${bday.name.toLowerCase().replace(/\s+/g, '')}` as SpecialTheme;
      return { theme: themeName, birthday: bday };
    }
  }

  // Check holidays
  for (const holiday of HOLIDAYS) {
    if (holiday.check()) {
      return { theme: holiday.theme, holiday };
    }
  }

  return { theme: null };
};

// Get current theme info
const getCurrentThemeInfo = (): { theme: SpecialTheme; birthday?: BirthdayConfig; holiday?: HolidayConfig } => {
  return getSpecialTheme();
};

// Birthday party elements
interface Balloon {
  x: number;
  y: number;
  color: string;
  speed: number;
  wobble: number;
}

interface Confetti {
  x: number;
  y: number;
  color: string;
  rotation: number;
  speed: number;
  size: number;
}

const DIFFICULTY_CONFIG = {
  easy: {
    baseSpeed: 4,
    speedIncrement: 0.3,
    obstacleSpawnBase: 150, // Higher = less frequent
    pointLoss: 30,
    startLives: 4,
    label: '🌱 Easy',
    labelCn: '🌱 简单',
    color: '#4ade80', // green
  },
  medium: {
    baseSpeed: 5,
    speedIncrement: 0.5,
    obstacleSpawnBase: 120,
    pointLoss: 50,
    startLives: 3,
    label: '🔥 Medium',
    labelCn: '🔥 中等',
    color: '#fbbf24', // yellow
  },
  hard: {
    baseSpeed: 6,
    speedIncrement: 0.7,
    obstacleSpawnBase: 80,
    pointLoss: 75,
    startLives: 2,
    label: '💀 Hard',
    labelCn: '💀 困难',
    color: '#f87171', // red
  },
};

// Cute kawaii cat designs!
const CAT_TYPES = [
  { name: 'Orange Tabby', fur: '#ffb347', furLight: '#ffd699', innerEar: '#ffb4a2', nose: '#ff8fa3' },
  { name: 'Gray Cat', fur: '#9ca3af', furLight: '#d1d5db', innerEar: '#fca5a5', nose: '#f87171' },
  { name: 'White Cat', fur: '#f3f4f6', furLight: '#ffffff', innerEar: '#fecaca', nose: '#fda4af' },
  { name: 'Black Cat', fur: '#374151', furLight: '#4b5563', innerEar: '#fb7185', nose: '#f43f5e' },
  { name: 'Cream Cat', fur: '#fef3c7', furLight: '#fffbeb', innerEar: '#fca5a5', nose: '#fb923c' },
  { name: 'Pink Cat', fur: '#fdb5c8', furLight: '#fce7f3', innerEar: '#f43f5e', nose: '#ec4899' },
  { name: 'Calico Cat', fur: '#fed7aa', furLight: '#fff7ed', innerEar: '#fecaca', nose: '#f472b6' },
  { name: 'Blue Cat', fur: '#93c5fd', furLight: '#dbeafe', innerEar: '#fecdd3', nose: '#f9a8d4' },
  { name: 'Peach Cat', fur: '#fdba74', furLight: '#fed7aa', innerEar: '#fda4af', nose: '#fb7185' },
  { name: 'Lavender Cat', fur: '#c4b5fd', furLight: '#ddd6fe', innerEar: '#fecaca', nose: '#f472b6' },
];

const Game: React.FC<GameProps> = ({ language }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const difficultyRef = useRef<Difficulty>('medium');
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameSpeedRef = useRef(5);
  const frameCountRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const collectedItemsRef = useRef<CollectedItem[]>([]);
  const foodCountsRef = useRef<Map<string, FoodCount>>(new Map());
  const hitEffectsRef = useRef<{ x: number; y: number; timestamp: number; points: number }[]>([]);
  const platformsRef = useRef<Platform[]>([]);
  const animationIdRef = useRef<number>(0);
  const catTypeRef = useRef(0); // Current cat design index
  const backgroundRef = useRef<BackgroundType>('sky'); // Current background
  const cloudsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; twinkle: number }[]>([]);
  const catExpressionRef = useRef<'normal' | 'happy' | 'sad'>('normal');
  const expressionTimeoutRef = useRef<number>(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Music system refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);
  const musicIntervalRef = useRef<number>(0);
  const birthdaySongTimeoutRef = useRef<number>(0);
  const birthdaySongPlayingRef = useRef(false);

  // Theme system - persists during session
  const themeInfoRef = useRef(getCurrentThemeInfo());
  const isBirthdayModeRef = useRef(themeInfoRef.current.theme?.startsWith('birthday-') ?? false);
  const isHolidayModeRef = useRef(themeInfoRef.current.theme?.startsWith('holiday-') ?? false);
  const currentBirthdayRef = useRef(themeInfoRef.current.birthday);
  const currentHolidayRef = useRef(themeInfoRef.current.holiday);

  // Birthday/Holiday party elements
  const balloonsRef = useRef<Balloon[]>([]);
  const confettiRef = useRef<Confetti[]>([]);

  // State for UI re-rendering
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef({
    x: 80,
    y: 0,
    width: 50,
    height: 50,
    velocityY: 0,
    gravity: 0.4,            // Snappy gravity for responsive jumps
    jumpForce: -11,          // Strong jump force
    maxFallSpeed: 12,        // Fast fall for quick landing
    bounciness: 0,           // No bounce - instant landing
    minBounceVelocity: 0,    // Disabled
    isGrounded: false,
    speed: 8,
  });

  // Track which movement keys are pressed
  const keysRef = useRef({ left: false, right: false });

  // Track active touch controls
  const touchControlsRef = useRef({ left: false, right: false });
  // Only show touch controls on actual touch devices
  const isTouchDeviceRef = useRef(false);

  const text = {
    en: {
      description: 'Help the cat collect snacks and dodge obstacles! Use ← → or A/D to move, SPACE/↑/CLICK to jump. Mobile: Use on-screen arrows!',
      title: 'Let\'s Go',
      startPrompt: 'Press SPACE or Click to Start',
      gameOver: 'GAME OVER',
      retry: 'Press SPACE to Retry',
      score: 'SCORE',
      collected: 'COLLECTED',
    },
    zh: {
      description: '帮助小猫收集零食并躲避障碍物！用 ← → 或 A/D 移动，空格/↑/点击跳跃。手机：使用屏幕箭头！',
      title: '零食捕手',
      startPrompt: '按空格键或点击开始',
      gameOver: '游戏结束',
      retry: '按空格键重试',
      score: '得分',
      collected: '收集',
    },
  };

  const t = text[language];

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    audioContextRef.current ??= new window.AudioContext();
    return audioContextRef.current;
  }, []);

  // Play a note using Web Audio API
  const playNote = useCallback((frequency: number, duration: number, startTime: number, volume?: number, type?: OscillatorType) => {
    const vol = volume ?? 0.1;
    const oscType = type ?? 'square';
    if (isMutedRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = oscType;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(vol, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, []);

  // Jump sound effect - quick rising tone (original, retro-inspired)
  const playJumpSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    // Rising pitch for jump feel
    oscillator.frequency.setValueAtTime(280, now);
    oscillator.frequency.exponentialRampToValueAtTime(560, now + 0.1);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, []);

  // Movement sound effect - subtle step sound (original, retro-inspired)
  const lastMoveTimestampRef = useRef(0);
  const playMoveSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Throttle movement sounds to avoid too many
    const now = ctx.currentTime;
    if (now - lastMoveTimestampRef.current < 0.15) return;
    lastMoveTimestampRef.current = now;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    // Quick soft step sound
    oscillator.frequency.setValueAtTime(150 + Math.random() * 30, now);

    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }, []);

  // Collect good food sound - happy coin/pickup sound (original, retro-inspired)
  const playCollectSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two-tone happy sound (like picking up a coin)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'square';

    // First note
    osc1.frequency.setValueAtTime(523, now); // C5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    // Second note (higher, slightly delayed)
    osc2.frequency.setValueAtTime(784, now + 0.08); // G5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.1);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.2);
  }, []);

  // Hit bad food sound - ouch/damage sound (original, retro-inspired)
  const playHitSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    // Descending pitch for "ouch" feel
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }, []);

  // Upbeat arcade music generator
  const playArcadeMusic = useCallback(() => {
    const ctx = initAudio();
    if (isMutedRef.current) return;

    // Clear any existing music interval
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
    }

    const bpm = 140;
    const beatDuration = 60 / bpm;

    // Catchy arcade melody pattern (pentatonic scale for pleasant sound)
    const melodyNotes = [
      392, 440, 523, 587, 659, 587, 523, 440, // G4, A4, C5, D5, E5, D5, C5, A4
      523, 587, 659, 784, 659, 587, 523, 440, // C5, D5, E5, G5, E5, D5, C5, A4
      392, 523, 392, 523, 440, 523, 587, 523, // Variation
      659, 587, 523, 440, 392, 440, 523, 392, // Resolution
    ];

    // Bass line
    const bassNotes = [196, 196, 262, 262, 220, 220, 247, 247]; // G3, C4, A3, B3

    let beatIndex = 0;

    const playBeat = () => {
      if (isMutedRef.current || gameStateRef.current !== 'PLAYING') return;

      const now = ctx.currentTime;
      const melodyNote = melodyNotes[beatIndex % melodyNotes.length];
      const bassNote = bassNotes[Math.floor(beatIndex / 4) % bassNotes.length];

      // Melody
      if (melodyNote) {
        playNote(melodyNote, beatDuration * 0.8, now, 0.08, 'square');
      }

      // Bass (every 4 beats)
      if (beatIndex % 4 === 0 && bassNote) {
        playNote(bassNote, beatDuration * 2, now, 0.06, 'triangle');
      }

      // Drum-like percussion (noise burst)
      if (beatIndex % 2 === 0) {
        const noise = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noise.type = 'square';
        noise.frequency.setValueAtTime(100 + Math.random() * 50, now);
        noiseGain.gain.setValueAtTime(0.03, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);
      }

      beatIndex++;
    };

    // Start the music loop
    playBeat();
    musicIntervalRef.current = window.setInterval(playBeat, beatDuration * 1000);
  }, [initAudio, playNote]);

  // Happy Birthday song (public domain melody)
  const playBirthdaySong = useCallback(() => {
    // Prevent playing if already playing to avoid overlap
    if (birthdaySongPlayingRef.current) return;

    const ctx = initAudio();
    if (isMutedRef.current) return;

    // Stop any existing music
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
    }

    birthdaySongPlayingRef.current = true;

    const bpm = 120;
    const beatDuration = 60 / bpm;
    const now = ctx.currentTime;

    // Happy Birthday melody (public domain since 2016)
    const melody = [
      { note: 262, dur: 0.75 }, { note: 262, dur: 0.25 }, // Hap-py
      { note: 294, dur: 1 }, { note: 262, dur: 1 }, // birth-day
      { note: 349, dur: 1 }, { note: 330, dur: 2 }, // to you
      { note: 262, dur: 0.75 }, { note: 262, dur: 0.25 }, // Hap-py
      { note: 294, dur: 1 }, { note: 262, dur: 1 }, // birth-day
      { note: 392, dur: 1 }, { note: 349, dur: 2 }, // to you
      { note: 262, dur: 0.75 }, { note: 262, dur: 0.25 }, // Hap-py
      { note: 523, dur: 1 }, { note: 440, dur: 1 }, // birth-day
      { note: 349, dur: 1 }, { note: 330, dur: 1 }, { note: 294, dur: 1 }, // dear Ca-sey
      { note: 466, dur: 0.75 }, { note: 466, dur: 0.25 }, // Hap-py
      { note: 440, dur: 1 }, { note: 349, dur: 1 }, // birth-day
      { note: 392, dur: 1 }, { note: 349, dur: 2 }, // to you
    ];

    let time = now;
    melody.forEach(({ note, dur }) => {
      playNote(note, dur * beatDuration * 0.9, time, 0.12, 'sine');
      time += dur * beatDuration;
    });

    // Mark song as finished after it ends
    window.setTimeout(() => {
      birthdaySongPlayingRef.current = false;
    }, 12000);
  }, [initAudio, playNote]);

  // Stop music
  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = 0;
    }
    if (birthdaySongTimeoutRef.current) {
      clearTimeout(birthdaySongTimeoutRef.current);
      birthdaySongTimeoutRef.current = 0;
    }
    birthdaySongPlayingRef.current = false;
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMutedRef.current;
    isMutedRef.current = newMutedState;
    setIsMuted(newMutedState);
    if (newMutedState) {
      stopMusic();
    } else if (gameStateRef.current === 'PLAYING') {
      if (isBirthdayModeRef.current) {
        playBirthdaySong();
        // After birthday song ends, use action sound effects instead of background music
      } else {
        playArcadeMusic();
      }
    }
  }, [stopMusic, playArcadeMusic, playBirthdaySong]);

  // Get random collectible based on weights
  const getRandomCollectible = useCallback(() => {
    let random = Math.random() * TOTAL_WEIGHT;
    for (const item of COLLECTIBLES_CONFIG) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    // Fallback to first item (should never happen)
    const fallback = COLLECTIBLES_CONFIG[0];
    if (!fallback) throw new Error('No collectibles configured');
    return fallback;
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = DIFFICULTY_CONFIG[difficultyRef.current];
    scoreRef.current = 0;
    livesRef.current = config.startLives;
    gameSpeedRef.current = config.baseSpeed;
    frameCountRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    collectedItemsRef.current = [];
    foodCountsRef.current = new Map();
    hitEffectsRef.current = [];
    platformsRef.current = [];
    // No initial platforms - they start spawning after 1.5 seconds

    // Pick a random cute cat for this game!
    catTypeRef.current = Math.floor(Math.random() * CAT_TYPES.length);

    // Check for special themes (birthdays and holidays)
    if (isBirthdayModeRef.current) {
      backgroundRef.current = 'birthday';
    } else if (isHolidayModeRef.current && currentHolidayRef.current) {
      backgroundRef.current = currentHolidayRef.current.background;
    } else {
      // Pick a trending background for ordinary days!
      backgroundRef.current = TRENDING_BACKGROUNDS[Math.floor(Math.random() * TRENDING_BACKGROUNDS.length)] ?? 'sky';
    }

    // Initialize clouds for sky/sunset backgrounds
    cloudsRef.current = [];
    for (let i = 0; i < 5; i++) {
      cloudsRef.current.push({
        x: Math.random() * canvas.width,
        y: 30 + Math.random() * 80,
        size: 30 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.5,
      });
    }

    // Initialize stars for night background
    starsRef.current = [];
    for (let i = 0; i < 50; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height - 100),
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    // Initialize birthday party elements
    const balloonColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
    balloonsRef.current = [];
    for (let i = 0; i < 8; i++) {
      balloonsRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)] ?? '#ff6b6b',
        speed: 0.5 + Math.random() * 1,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // Initialize confetti
    const confettiColors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#ffd93d'];
    confettiRef.current = [];
    for (let i = 0; i < 30; i++) {
      confettiRef.current.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * 200,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)] ?? '#ffe66d',
        rotation: Math.random() * 360,
        speed: 1 + Math.random() * 2,
        size: 5 + Math.random() * 10,
      });
    }

    const player = playerRef.current;
    player.x = 80; // Reset horizontal position too
    player.y = canvas.height - 50 - player.height;
    player.velocityY = 0;
    player.isGrounded = true;
  }, []);

  const spawnObstacle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const height = Math.floor(Math.random() * 30) + 40;
    const item = OBSTACLE_CONFIG[Math.floor(Math.random() * OBSTACLE_CONFIG.length)];
    if (!item) return;

    obstaclesRef.current.push({
      x: canvas.width,
      y: canvas.height - 50 - height,
      width: 55,
      height: height,
      emoji: item.emoji,
      name: item.name,
      nameCn: item.nameCn,
      color: '#81b29a', // Green color for veggies/seafood
    });
  }, []);

  const spawnCollectible = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const item = getRandomCollectible();
    collectiblesRef.current.push({
      x: canvas.width,
      y: canvas.height - 100 - Math.random() * 100,
      size: item.size,
      emoji: item.emoji,
      name: item.name,
      nameCn: item.nameCn,
      points: item.points,
      collected: false,
      givesLife: item.givesLife ?? false,
    });
  }, [getRandomCollectible]);

  // Spawn Mario-style platforms for jumping
  const spawnPlatform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const groundY = canvas.height - 50;
    const types: Platform['type'][] = ['brick', 'block', 'pipe'];
    const type = types[Math.floor(Math.random() * types.length)] ?? 'brick';

    // Vary platform heights - some low, some high
    const heightOptions = [60, 80, 100, 120, 140];
    const platformHeight = heightOptions[Math.floor(Math.random() * heightOptions.length)] ?? 80;

    // Vary platform widths
    const width = type === 'pipe' ? 40 : (Math.random() > 0.5 ? 80 : 60);
    const height = type === 'pipe' ? 60 : 20;

    const platformX = canvas.width + Math.random() * 100;
    const platformY = groundY - platformHeight;

    platformsRef.current.push({
      x: platformX,
      y: platformY,
      width,
      height,
      type,
    });

    // 50% chance to spawn a collectible on the platform
    if (Math.random() > 0.5) {
      const item = getRandomCollectible();
      collectiblesRef.current.push({
        x: platformX + width / 2 - item.size / 2,
        y: platformY - item.size - 5, // Above the platform
        size: item.size,
        emoji: item.emoji,
        name: item.name,
        nameCn: item.nameCn,
        points: item.points,
        collected: false,
        givesLife: item.givesLife ?? false,
      });
    }
  }, [getRandomCollectible]);

  const handleAction = useCallback(() => {
    if (gameStateRef.current === 'START' || gameStateRef.current === 'GAMEOVER') {
      resetGame();
      gameStateRef.current = 'PLAYING';
      // Start music when game begins
      if (!isMutedRef.current) {
        if (isBirthdayModeRef.current) {
          playBirthdaySong();
          // After birthday song ends, use action sound effects instead of background music
        } else {
          playArcadeMusic();
        }
      }
    } else {
      // Currently playing - handle jump
      const player = playerRef.current;
      // Play jump sound on every jump attempt for responsive feel
      playJumpSound();
      if (player.isGrounded) {
        player.velocityY = player.jumpForce;
        player.isGrounded = false;
      }
    }
  }, [resetGame, playArcadeMusic, playBirthdaySong, playJumpSound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize player position
    const player = playerRef.current;
    player.y = canvas.height - 50 - player.height;

    // Initialize background elements for start screen
    if (cloudsRef.current.length === 0) {
      for (let i = 0; i < 5; i++) {
        cloudsRef.current.push({
          x: Math.random() * canvas.width,
          y: 30 + Math.random() * 80,
          size: 30 + Math.random() * 40,
          speed: 0.3 + Math.random() * 0.5,
        });
      }
    }
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 50; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height - 100),
          size: 1 + Math.random() * 2,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('dodgerHighScore');
    if (savedHighScore) {
      highScoreRef.current = parseInt(savedHighScore, 10);
    }

    const update = () => {
      if (gameStateRef.current !== 'PLAYING') return;

      frameCountRef.current++;
      const config = DIFFICULTY_CONFIG[difficultyRef.current];
      gameSpeedRef.current = config.baseSpeed + Math.floor(scoreRef.current / 500) * config.speedIncrement;

      // Update player - horizontal movement
      const isMoving = keysRef.current.left || keysRef.current.right || touchControlsRef.current.left || touchControlsRef.current.right;
      if (keysRef.current.left || touchControlsRef.current.left) {
        player.x -= player.speed;
      }
      if (keysRef.current.right || touchControlsRef.current.right) {
        player.x += player.speed;
      }
      // Play movement sound when walking on ground
      if (isMoving && player.isGrounded) {
        playMoveSound();
      }
      // Keep player within canvas bounds
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

      // Update player - vertical movement with snappy gravity
      player.velocityY += player.gravity;

      // Terminal velocity - max fall speed
      if (player.velocityY > player.maxFallSpeed) {
        player.velocityY = player.maxFallSpeed;
      }

      player.y += player.velocityY;

      // Platform collision detection - check if player lands on a platform
      let onPlatform = false;
      for (const platform of platformsRef.current) {
        // Check if player is falling and landing on top of platform
        if (
          player.velocityY >= 0 && // Falling or stationary
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height >= platform.y &&
          player.y + player.height <= platform.y + platform.height + 10 // Small tolerance
        ) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.isGrounded = true;
          onPlatform = true;

          // Player rides with the platform (moves left with it)
          player.x -= gameSpeedRef.current;

          // Check if player is carried off the left side of screen - lose a heart!
          if (player.x + player.width < 0) {
            livesRef.current--;
            playHitSound();

            // Reset player position
            player.x = 80;
            player.y = canvas.height - 50 - player.height;
            player.isGrounded = true;

            // Show sad face
            catExpressionRef.current = 'sad';
            window.clearTimeout(expressionTimeoutRef.current);
            expressionTimeoutRef.current = window.setTimeout(() => {
              catExpressionRef.current = 'normal';
            }, 800);

            // Check game over
            if (livesRef.current <= 0) {
              gameStateRef.current = 'GAMEOVER';
              stopMusic();
              if (scoreRef.current > highScoreRef.current) {
                highScoreRef.current = scoreRef.current;
                localStorage.setItem('dodgerHighScore', scoreRef.current.toString());
              }
            }
          }
          break;
        }
      }

      const groundLevel = canvas.height - 50 - player.height;
      if (!onPlatform && player.y >= groundLevel) {
        player.y = groundLevel;

        // Apply bounciness if falling fast enough
        if (player.velocityY > player.minBounceVelocity) {
          player.velocityY = -player.velocityY * player.bounciness;
          player.isGrounded = false; // Still in air due to bounce
        } else {
          player.velocityY = 0;
          player.isGrounded = true;
        }
      } else if (!onPlatform && player.y < groundLevel) {
        player.isGrounded = false;
      }

      // Spawn obstacles & collectibles (rate based on difficulty)
      const spawnRate = Math.max(50, config.obstacleSpawnBase - Math.floor(gameSpeedRef.current * 3));
      if (frameCountRef.current % spawnRate === 0) {
        if (Math.random() > 0.3) spawnObstacle();
      }
      if (frameCountRef.current % 90 === 0 && Math.random() > 0.2) {
        spawnCollectible();
      }
      // Spawn platforms for Mario-style jumping
      // Only start after 1 second (60 frames) and limit to max 3 platforms
      if (
        frameCountRef.current > 60 &&
        frameCountRef.current % 120 === 0 &&
        platformsRef.current.length < 3 &&
        Math.random() > 0.3
      ) {
        spawnPlatform();
      }

      // Update obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        if (!obs) continue;
        obs.x -= gameSpeedRef.current;

        // Collision check - lose points and a life instead of instant game over
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          // Deduct points and lose a life (amount based on difficulty)
          const pointLoss = config.pointLoss;
          scoreRef.current = Math.max(0, scoreRef.current - pointLoss);
          livesRef.current--;
          playHitSound();

          // Add hit effect for visual feedback
          hitEffectsRef.current.push({
            x: obs.x + obs.width / 2,
            y: obs.y,
            timestamp: Date.now(),
            points: -pointLoss,
          });

          // Show sad face when hit
          catExpressionRef.current = 'sad';
          window.clearTimeout(expressionTimeoutRef.current);
          expressionTimeoutRef.current = window.setTimeout(() => {
            catExpressionRef.current = 'normal';
          }, 800);

          // Remove this obstacle so it doesn't keep hitting
          obstaclesRef.current.splice(i, 1);

          // Check game over condition
          if (livesRef.current <= 0 || scoreRef.current <= 0) {
            gameStateRef.current = 'GAMEOVER';
            // Stop music when game ends
            if (musicIntervalRef.current) {
              clearInterval(musicIntervalRef.current);
              musicIntervalRef.current = 0;
            }
            if (birthdaySongTimeoutRef.current) {
              clearTimeout(birthdaySongTimeoutRef.current);
              birthdaySongTimeoutRef.current = 0;
            }
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              localStorage.setItem('dodgerHighScore', scoreRef.current.toString());
            }
          }
          continue;
        }

        if (obs.x + obs.width < 0) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      // Update collectibles
      for (let i = collectiblesRef.current.length - 1; i >= 0; i--) {
        const c = collectiblesRef.current[i];
        if (!c) continue;
        c.x -= gameSpeedRef.current;

        if (
          !c.collected &&
          player.x < c.x + c.size &&
          player.x + player.width > c.x &&
          player.y < c.y + c.size &&
          player.y + player.height > c.y
        ) {
          c.collected = true;
          scoreRef.current += c.points;
          playCollectSound();

          // Corn and Tomato give extra life (max based on difficulty starting lives)
          // When player has only 1 life, any food has 50% chance to give a heart
          const maxLives = DIFFICULTY_CONFIG[difficultyRef.current].startLives;
          if (c.givesLife && livesRef.current < maxLives) {
            livesRef.current++;
          } else if (livesRef.current === 1 && livesRef.current < maxLives && Math.random() > 0.5) {
            // Emergency heart when on last life!
            livesRef.current++;
          }

          // Show happy face when collecting food!
          catExpressionRef.current = 'happy';
          window.clearTimeout(expressionTimeoutRef.current);
          expressionTimeoutRef.current = window.setTimeout(() => {
            catExpressionRef.current = 'normal';
          }, 500);

          // Track collected item
          const newItem: CollectedItem = {
            name: c.name,
            nameCn: c.nameCn,
            emoji: c.emoji,
            points: c.points,
            timestamp: Date.now(),
          };
          collectedItemsRef.current.push(newItem);

          // Update food counts
          const existing = foodCountsRef.current.get(c.emoji);
          if (existing) {
            existing.count++;
            existing.totalPoints += c.points;
          } else {
            foodCountsRef.current.set(c.emoji, {
              emoji: c.emoji,
              name: c.name,
              nameCn: c.nameCn,
              count: 1,
              totalPoints: c.points,
            });
          }
        }

        if (c.x + c.size < 0) {
          collectiblesRef.current.splice(i, 1);
        }
      }

      // Update platforms - move them left and remove off-screen ones
      for (let i = platformsRef.current.length - 1; i >= 0; i--) {
        const platform = platformsRef.current[i];
        if (!platform) continue;
        platform.x -= gameSpeedRef.current;

        // Remove platforms that are off screen
        if (platform.x + platform.width < 0) {
          platformsRef.current.splice(i, 1);
        }
      }

      // Small passive score increase
      if (frameCountRef.current % 10 === 0) {
        scoreRef.current++;
      }
    };

    // Background drawing functions
    const drawBackground = () => {
      const bg = backgroundRef.current;
      const groundY = canvas.height - 50;

      switch (bg) {
        case 'sky': {
          // Gradient blue sky
          const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          skyGrad.addColorStop(0, '#87CEEB');
          skyGrad.addColorStop(0.5, '#B0E0E6');
          skyGrad.addColorStop(1, '#E0F6FF');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Draw and animate clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          cloudsRef.current.forEach((cloud) => {
            // Move cloud
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size * 2 < 0) {
              cloud.x = canvas.width + cloud.size;
            }
            // Draw fluffy cloud
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.4, cloud.y + cloud.size * 0.15, cloud.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'sunset': {
          // Warm sunset gradient
          const sunsetGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          sunsetGrad.addColorStop(0, '#1a1a2e');
          sunsetGrad.addColorStop(0.3, '#e94560');
          sunsetGrad.addColorStop(0.6, '#ff6b35');
          sunsetGrad.addColorStop(1, '#ffc857');
          ctx.fillStyle = sunsetGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Draw sun
          ctx.fillStyle = '#fff5cc';
          ctx.beginPath();
          ctx.arc(canvas.width - 100, groundY - 30, 40, 0, Math.PI * 2);
          ctx.fill();

          // Clouds silhouettes
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          cloudsRef.current.forEach((cloud) => {
            cloud.x -= cloud.speed * 0.5;
            if (cloud.x + cloud.size * 2 < 0) {
              cloud.x = canvas.width + cloud.size;
            }
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y + 20, cloud.size * 0.5, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.4, cloud.y + 10, cloud.size * 0.4, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.8, cloud.y + 20, cloud.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'night': {
          // Dark night sky
          const nightGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          nightGrad.addColorStop(0, '#0f0c29');
          nightGrad.addColorStop(0.5, '#302b63');
          nightGrad.addColorStop(1, '#24243e');
          ctx.fillStyle = nightGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Draw twinkling stars
          const time = frameCountRef.current * 0.05;
          starsRef.current.forEach((star) => {
            const twinkle = Math.sin(time + star.twinkle) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * twinkle + 0.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Moon
          ctx.fillStyle = '#f5f5dc';
          ctx.beginPath();
          ctx.arc(canvas.width - 80, 60, 35, 0, Math.PI * 2);
          ctx.fill();
          // Moon shadow
          ctx.fillStyle = '#24243e';
          ctx.beginPath();
          ctx.arc(canvas.width - 70, 55, 30, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'kitchen': {
          // Kitchen wall
          ctx.fillStyle = '#fdf6e3';
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Wall tiles pattern
          ctx.strokeStyle = '#e8dcc8';
          ctx.lineWidth = 1;
          const tileSize = 40;
          for (let x = 0; x < canvas.width; x += tileSize) {
            for (let y = 0; y < groundY; y += tileSize) {
              ctx.strokeRect(x, y, tileSize, tileSize);
            }
          }

          // Kitchen counter at bottom
          ctx.fillStyle = '#8b7355';
          ctx.fillRect(0, groundY - 20, canvas.width, 20);

          // Counter top
          ctx.fillStyle = '#d4c4a8';
          ctx.fillRect(0, groundY - 25, canvas.width, 8);

          // Some kitchen items
          // Cabinet
          ctx.fillStyle = '#c9a87c';
          ctx.fillRect(50, 20, 80, 100);
          ctx.strokeStyle = '#8b7355';
          ctx.lineWidth = 2;
          ctx.strokeRect(50, 20, 80, 100);
          ctx.beginPath();
          ctx.arc(120, 70, 5, 0, Math.PI * 2);
          ctx.stroke();

          // Window
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(canvas.width - 150, 30, 100, 80);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.strokeRect(canvas.width - 150, 30, 100, 80);
          ctx.beginPath();
          ctx.moveTo(canvas.width - 100, 30);
          ctx.lineTo(canvas.width - 100, 110);
          ctx.moveTo(canvas.width - 150, 70);
          ctx.lineTo(canvas.width - 50, 70);
          ctx.stroke();

          // Plant
          ctx.fillStyle = '#8b4513';
          ctx.fillRect(canvas.width / 2 - 20, groundY - 60, 40, 40);
          ctx.fillStyle = '#228b22';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, groundY - 80, 30, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'nature': {
          // Sky
          const natureGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          natureGrad.addColorStop(0, '#87CEEB');
          natureGrad.addColorStop(1, '#98FB98');
          ctx.fillStyle = natureGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Distant hills
          ctx.fillStyle = '#90EE90';
          ctx.beginPath();
          ctx.moveTo(0, groundY);
          ctx.quadraticCurveTo(150, groundY - 80, 300, groundY);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(200, groundY);
          ctx.quadraticCurveTo(400, groundY - 100, 600, groundY);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(500, groundY);
          ctx.quadraticCurveTo(700, groundY - 70, canvas.width, groundY);
          ctx.fill();

          // Trees
          const drawTree = (x: number, trunkH: number, foliageR: number) => {
            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 8, groundY - trunkH, 16, trunkH);
            // Foliage
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(x, groundY - trunkH - foliageR * 0.5, foliageR, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - foliageR * 0.5, groundY - trunkH, foliageR * 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + foliageR * 0.5, groundY - trunkH, foliageR * 0.7, 0, Math.PI * 2);
            ctx.fill();
          };

          drawTree(80, 60, 35);
          drawTree(250, 80, 45);
          drawTree(500, 70, 40);
          drawTree(700, 55, 30);

          // Clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          cloudsRef.current.slice(0, 3).forEach((cloud) => {
            cloud.x -= cloud.speed * 0.3;
            if (cloud.x + cloud.size * 2 < 0) {
              cloud.x = canvas.width + cloud.size;
            }
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Bushes
          ctx.fillStyle = '#32CD32';
          for (let i = 0; i < 6; i++) {
            const bx = 50 + i * 140;
            ctx.beginPath();
            ctx.arc(bx, groundY - 10, 25, 0, Math.PI * 2);
            ctx.arc(bx + 20, groundY - 15, 20, 0, Math.PI * 2);
            ctx.arc(bx - 15, groundY - 8, 18, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'birthday': {
          // Warm yellow/cream party background (like the reference image)
          const partyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          partyGrad.addColorStop(0, '#ffeaa7');
          partyGrad.addColorStop(0.3, '#fff3b0');
          partyGrad.addColorStop(0.7, '#fffbe6');
          partyGrad.addColorStop(1, '#fff9db');
          ctx.fillStyle = partyGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Chevron pattern on left side (like wallpaper)
          ctx.fillStyle = 'rgba(255, 220, 100, 0.3)';
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 4; col++) {
              const px = col * 40;
              const py = row * 50 + (col % 2) * 25;
              ctx.beginPath();
              ctx.moveTo(px, py + 25);
              ctx.lineTo(px + 20, py);
              ctx.lineTo(px + 40, py + 25);
              ctx.lineTo(px + 20, py + 50);
              ctx.closePath();
              ctx.fill();
            }
          }

          // Polka dot pattern on right side
          ctx.fillStyle = 'rgba(100, 200, 150, 0.15)';
          for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 6; col++) {
              const px = canvas.width - 180 + col * 35 + (row % 2) * 17;
              const py = row * 35 + 20;
              ctx.beginPath();
              ctx.arc(px, py, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Bunting flags with patterns (like the image)
          const flagWidth = 45;
          const flagHeight = 55;
          const flagGap = 8;
          const flagY = 15;
          const flagPatterns = [
            { bg: '#5dade2', pattern: 'polka', patternColor: '#fff' },      // blue polka
            { bg: '#ff6b6b', pattern: 'polka', patternColor: '#fff' },      // red polka
            { bg: '#ffe66d', pattern: 'stripe', patternColor: '#fff' },     // yellow stripe
            { bg: '#5dade2', pattern: 'stripe', patternColor: '#fff' },     // blue stripe
            { bg: '#ff6b6b', pattern: 'stripe', patternColor: '#d63031' },  // red stripe
            { bg: '#5dade2', pattern: 'polka', patternColor: '#fff' },      // blue polka
            { bg: '#ffe66d', pattern: 'polka', patternColor: '#f39c12' },   // yellow polka
            { bg: '#ff6b6b', pattern: 'polka', patternColor: '#fff' },      // red polka
            { bg: '#5dade2', pattern: 'stripe', patternColor: '#fff' },     // blue stripe
            { bg: '#ffe66d', pattern: 'stripe', patternColor: '#fff' },     // yellow stripe
            { bg: '#ff6b6b', pattern: 'stripe', patternColor: '#d63031' },  // red stripe
            { bg: '#5dade2', pattern: 'polka', patternColor: '#fff' },      // blue polka
          ];

          // Draw rope/string for bunting
          ctx.strokeStyle = '#d4a574';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(20, flagY + 5);
          for (let i = 0; i < flagPatterns.length; i++) {
            const fx = 50 + i * (flagWidth + flagGap);
            ctx.lineTo(fx + flagWidth / 2, flagY + 8 + Math.sin(i * 0.5) * 3);
          }
          ctx.lineTo(canvas.width - 20, flagY + 5);
          ctx.stroke();

          // Draw each flag
          flagPatterns.forEach((flag, i) => {
            const fx = 50 + i * (flagWidth + flagGap);
            const fy = flagY + 5;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + flagWidth, fy);
            ctx.lineTo(fx + flagWidth / 2, fy + flagHeight);
            ctx.closePath();
            ctx.clip();

            // Flag background
            ctx.fillStyle = flag.bg;
            ctx.fill();

            // Pattern
            if (flag.pattern === 'polka') {
              ctx.fillStyle = flag.patternColor;
              for (let py = 0; py < 4; py++) {
                for (let px = 0; px < 3; px++) {
                  const dotX = fx + 8 + px * 14 + (py % 2) * 7;
                  const dotY = fy + 10 + py * 12;
                  ctx.beginPath();
                  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            } else {
              ctx.strokeStyle = flag.patternColor;
              ctx.lineWidth = 3;
              for (let s = 0; s < 5; s++) {
                ctx.beginPath();
                ctx.moveTo(fx + s * 10, fy);
                ctx.lineTo(fx + s * 10 - 15, fy + flagHeight);
                ctx.stroke();
              }
            }

            ctx.restore();

            // Flag border
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + flagWidth, fy);
            ctx.lineTo(fx + flagWidth / 2, fy + flagHeight);
            ctx.closePath();
            ctx.stroke();
          });

          const time = frameCountRef.current * 0.02;

          // Animated confetti falling
          confettiRef.current.forEach((c) => {
            c.y += c.speed;
            c.x += Math.sin(time + c.rotation) * 0.5;
            c.rotation += 2;

            if (c.y > canvas.height) {
              c.y = -20;
              c.x = Math.random() * canvas.width;
            }

            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate((c.rotation * Math.PI) / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
          });

          // === PARTY TABLE (left side, higher) ===
          const tableY = groundY - 45;
          const tableWidth = 280;
          const tableLeft = 30;
          const tableRight = tableLeft + tableWidth;
          const tableCenterX = tableLeft + tableWidth / 2;

          // Table legs
          ctx.fillStyle = '#c9a87c';
          ctx.fillRect(tableLeft + 15, tableY, 10, 50);
          ctx.fillRect(tableRight - 25, tableY, 10, 50);

          // Tablecloth (cream/white)
          ctx.fillStyle = '#fffef5';
          ctx.fillRect(tableLeft, tableY - 6, tableWidth, 10);

          // Tablecloth front drape
          ctx.fillStyle = '#f8f5e8';
          ctx.beginPath();
          ctx.moveTo(tableLeft, tableY + 4);
          ctx.lineTo(tableLeft, tableY + 12);
          ctx.lineTo(tableRight, tableY + 12);
          ctx.lineTo(tableRight, tableY + 4);
          ctx.closePath();
          ctx.fill();

          // Table edge shadow
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.fillRect(tableLeft, tableY + 2, tableWidth, 2);

          // === ITEMS ON TABLE ===

          // Hot dog on plate (left of cake)
          const hotdogX = tableCenterX - 100;
          const hotdogY = tableY - 15;
          ctx.fillStyle = '#f5f5f5';
          ctx.beginPath();
          ctx.ellipse(hotdogX, tableY - 10, 32, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#f4a460';
          ctx.beginPath();
          ctx.ellipse(hotdogX, hotdogY + 5, 24, 9, 0, 0, Math.PI);
          ctx.fill();
          ctx.fillStyle = '#cd5c5c';
          ctx.beginPath();
          ctx.ellipse(hotdogX, hotdogY, 22, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#deb887';
          ctx.beginPath();
          ctx.ellipse(hotdogX, hotdogY - 4, 24, 9, 0, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hotdogX - 16, hotdogY);
          for (let i = 0; i < 7; i++) {
            ctx.lineTo(hotdogX - 14 + i * 5, hotdogY + (i % 2 === 0 ? -3 : 3));
          }
          ctx.stroke();

          // Birthday cake on stand (center)
          const cakeX = tableCenterX;
          const cakeY = tableY - 55;
          ctx.fillStyle = '#a8d8d8';
          ctx.beginPath();
          ctx.ellipse(cakeX, tableY - 8, 30, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cakeX - 8, tableY - 40, 16, 34);
          ctx.beginPath();
          ctx.ellipse(cakeX, cakeY + 22, 38, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(cakeX - 32, cakeY, 64, 22);
          ctx.fillStyle = '#fff';
          ctx.fillRect(cakeX - 32, cakeY + 10, 64, 5);
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(cakeX - 26, cakeY - 16, 52, 18);
          ctx.fillStyle = '#fff';
          ctx.fillRect(cakeX - 26, cakeY - 8, 52, 5);
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(cakeX - 20, cakeY - 28, 40, 14);
          ctx.fillStyle = '#5D3A1A';
          ctx.fillRect(cakeX - 20, cakeY - 31, 40, 4);
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(cakeX - 16 + i * 8, cakeY - 27, 2, 0, Math.PI);
            ctx.fill();
          }
          ctx.fillStyle = '#fffacd';
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(cakeX - 12 + i * 8, cakeY - 34, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          const candleColors = ['#ff6b6b', '#f39c12', '#9b59b6', '#3498db', '#2ecc71'];
          for (let i = 0; i < 5; i++) {
            const cx = cakeX - 16 + i * 8;
            ctx.fillStyle = candleColors[i] ?? '#ff6b6b';
            ctx.fillRect(cx - 2, cakeY - 48, 4, 14);
            const flicker = Math.sin(time * 10 + i) * 1;
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.ellipse(cx + flicker, cakeY - 52, 3, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.ellipse(cx + flicker, cakeY - 54, 1.5, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Ice cream cone (right of cake)
          const iceX = tableCenterX + 80;
          const iceY = tableY - 22;
          ctx.fillStyle = '#d4a574';
          ctx.beginPath();
          ctx.moveTo(iceX - 10, iceY);
          ctx.lineTo(iceX + 10, iceY);
          ctx.lineTo(iceX, iceY + 25);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#c4956a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(iceX - 7, iceY + 4);
          ctx.lineTo(iceX + 4, iceY + 20);
          ctx.moveTo(iceX + 7, iceY + 4);
          ctx.lineTo(iceX - 4, iceY + 20);
          ctx.stroke();
          ctx.fillStyle = '#ffc0cb';
          ctx.beginPath();
          ctx.arc(iceX, iceY - 5, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fffacd';
          ctx.beginPath();
          ctx.arc(iceX - 6, iceY - 15, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(iceX + 6, iceY - 14, 8, 0, Math.PI * 2);
          ctx.fill();

          // Cupcakes (between hot dog and cake)
          const cupcakeBaseX = tableCenterX - 50;
          const cupcakeColors = ['#f8b4d9', '#87ceeb', '#98fb98'];
          for (let i = 0; i < 3; i++) {
            const cupX = cupcakeBaseX + i * 22;
            const cupY = tableY - 12;
            // Wrapper
            ctx.fillStyle = '#f5f5f5';
            ctx.beginPath();
            ctx.moveTo(cupX - 8, cupY + 10);
            ctx.lineTo(cupX - 6, cupY);
            ctx.lineTo(cupX + 6, cupY);
            ctx.lineTo(cupX + 8, cupY + 10);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Frosting
            ctx.fillStyle = cupcakeColors[i] ?? '#f8b4d9';
            ctx.beginPath();
            ctx.arc(cupX, cupY - 4, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cupX, cupY - 10, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cupX, cupY - 14, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Party hats on table
          const drawPartyHat = (hx: number, hy: number, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(hx, hy - 28);
            ctx.lineTo(hx - 10, hy);
            ctx.lineTo(hx + 10, hy);
            ctx.closePath();
            ctx.fill();
            // Polka dots
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(hx - 3, hy - 8, 2, 0, Math.PI * 2);
            ctx.arc(hx + 3, hy - 16, 2, 0, Math.PI * 2);
            ctx.arc(hx, hy - 22, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // Pom pom
            ctx.beginPath();
            ctx.arc(hx, hy - 30, 4, 0, Math.PI * 2);
            ctx.fill();
          };
          drawPartyHat(tableLeft + 25, tableY - 8, '#87ceeb');
          drawPartyHat(tableRight - 55, tableY - 8, '#ffe66d');

          // Cookies on a plate (near ice cream)
          const cookiePlateX = tableCenterX + 40;
          const cookiePlateY = tableY - 8;
          // Plate
          ctx.fillStyle = '#f5f5f5';
          ctx.beginPath();
          ctx.ellipse(cookiePlateX, cookiePlateY, 22, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          ctx.stroke();
          // Cookies
          const cookiePositions = [
            { x: -10, y: -5 }, { x: 5, y: -3 }, { x: -2, y: -10 }
          ];
          cookiePositions.forEach((pos) => {
            // Cookie base
            ctx.fillStyle = '#d2691e';
            ctx.beginPath();
            ctx.arc(cookiePlateX + pos.x, cookiePlateY + pos.y, 8, 0, Math.PI * 2);
            ctx.fill();
            // Chocolate chips
            ctx.fillStyle = '#3d2314';
            ctx.beginPath();
            ctx.arc(cookiePlateX + pos.x - 3, cookiePlateY + pos.y - 2, 2, 0, Math.PI * 2);
            ctx.arc(cookiePlateX + pos.x + 2, cookiePlateY + pos.y + 1, 1.5, 0, Math.PI * 2);
            ctx.arc(cookiePlateX + pos.x + 1, cookiePlateY + pos.y - 3, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Confetti on table
          const tableConfetti = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#9b59b6', '#3498db', '#2ecc71'];
          for (let i = 0; i < 10; i++) {
            ctx.fillStyle = tableConfetti[i % tableConfetti.length] ?? '#ff6b6b';
            const cx = tableLeft + 25 + i * 25;
            const cy = tableY - 10 - (i % 3);
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Balloons tied to the table (right side)
          const balloonBaseX = tableRight - 30;
          const balloonBaseY = tableY - 8;
          const tableBalloons = [
            { offsetX: 0, offsetY: -80, color: '#e74c3c', size: 1.2 },
            { offsetX: -20, offsetY: -100, color: '#f1c40f', size: 1.1 },
            { offsetX: 15, offsetY: -95, color: '#85c1e9', size: 1.15 },
            { offsetX: -10, offsetY: -120, color: '#82e0aa', size: 1.0 },
            { offsetX: 25, offsetY: -115, color: '#e74c3c', size: 0.95 },
            { offsetX: 5, offsetY: -140, color: '#f5b041', size: 1.05 },
          ];
          ctx.strokeStyle = '#999';
          ctx.lineWidth = 1;
          tableBalloons.forEach((b) => {
            ctx.beginPath();
            ctx.moveTo(balloonBaseX + b.offsetX, balloonBaseY + b.offsetY + 22 * b.size);
            ctx.quadraticCurveTo(balloonBaseX + b.offsetX + 5, balloonBaseY - 20, balloonBaseX, balloonBaseY);
            ctx.stroke();
          });
          tableBalloons.forEach((b) => {
            const wobble = Math.sin(time * 2 + b.offsetX * 0.1) * 2;
            const bx = balloonBaseX + b.offsetX + wobble;
            const by = balloonBaseY + b.offsetY + Math.sin(time + b.offsetX) * 2;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.ellipse(bx, by, 16 * b.size, 20 * b.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(bx - 5 * b.size, by - 7 * b.size, 4 * b.size, 6 * b.size, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(bx - 3, by + 20 * b.size);
            ctx.lineTo(bx, by + 24 * b.size);
            ctx.lineTo(bx + 3, by + 20 * b.size);
            ctx.fill();
          });

          break;
        }

        case 'christmas': {
          // Winter wonderland background
          const snowGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          snowGrad.addColorStop(0, '#1a365d');
          snowGrad.addColorStop(0.5, '#2c5282');
          snowGrad.addColorStop(1, '#4a5568');
          ctx.fillStyle = snowGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Falling snow
          ctx.fillStyle = '#fff';
          for (let i = 0; i < 60; i++) {
            const sx = (i * 47 + frameCountRef.current * 0.5) % canvas.width;
            const sy = (i * 31 + frameCountRef.current * (1 + (i % 3) * 0.5)) % groundY;
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }

          // Christmas trees
          const drawTree = (tx: number, ty: number, scale: number) => {
            ctx.fillStyle = '#228B22';
            for (let layer = 0; layer < 3; layer++) {
              const layerWidth = (40 - layer * 10) * scale;
              ctx.beginPath();
              ctx.moveTo(tx, ty - (layer * 20 + 30) * scale);
              ctx.lineTo(tx - layerWidth / 2, ty - layer * 20 * scale);
              ctx.lineTo(tx + layerWidth / 2, ty - layer * 20 * scale);
              ctx.closePath();
              ctx.fill();
            }
            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tx - 5 * scale, ty, 10 * scale, 15 * scale);
            // Ornaments
            const ornamentColors = ['#ff0000', '#ffd700', '#0000ff', '#ff69b4'];
            for (let o = 0; o < 5; o++) {
              ctx.fillStyle = ornamentColors[o % 4] ?? '#ff0000';
              ctx.beginPath();
              ctx.arc(tx + Math.cos(o * 1.5) * 12 * scale, ty - 20 - o * 12 * scale, 4 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
            // Star on top
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            const starY = ty - 85 * scale;
            for (let p = 0; p < 5; p++) {
              const angle = (p * 4 * Math.PI) / 5 - Math.PI / 2;
              const r = p % 2 === 0 ? 8 * scale : 4 * scale;
              if (p === 0) ctx.moveTo(tx + Math.cos(angle) * r, starY + Math.sin(angle) * r);
              else ctx.lineTo(tx + Math.cos(angle) * r, starY + Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
          };
          drawTree(80, groundY, 0.8);
          drawTree(canvas.width - 100, groundY, 1);
          drawTree(canvas.width - 200, groundY, 0.6);

          // Gift boxes
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(150, groundY - 25, 30, 25);
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(163, groundY - 25, 4, 25);
          ctx.fillRect(150, groundY - 15, 30, 4);

          ctx.fillStyle = '#3498db';
          ctx.fillRect(190, groundY - 20, 25, 20);
          ctx.fillStyle = '#fff';
          ctx.fillRect(200, groundY - 20, 4, 20);
          ctx.fillRect(190, groundY - 12, 25, 4);

          break;
        }

        case 'valentine': {
          // Romantic pink/red gradient
          const loveGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          loveGrad.addColorStop(0, '#ffeef8');
          loveGrad.addColorStop(0.5, '#ffb6c1');
          loveGrad.addColorStop(1, '#ffccd5');
          ctx.fillStyle = loveGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Floating hearts
          const heartColors = ['#ff69b4', '#ff1493', '#dc143c', '#ff6b6b', '#e91e63'];
          for (let i = 0; i < 15; i++) {
            const hx = (i * 57 + frameCountRef.current * 0.3) % canvas.width;
            const hy = (Math.sin(frameCountRef.current * 0.02 + i) * 30) + 50 + i * 15;
            const size = 8 + (i % 5) * 2;
            ctx.fillStyle = heartColors[i % heartColors.length] ?? '#ff69b4';
            // Draw heart shape
            ctx.beginPath();
            ctx.moveTo(hx, hy + size / 4);
            ctx.bezierCurveTo(hx, hy, hx - size / 2, hy, hx - size / 2, hy + size / 4);
            ctx.bezierCurveTo(hx - size / 2, hy + size / 2, hx, hy + size * 0.75, hx, hy + size);
            ctx.bezierCurveTo(hx, hy + size * 0.75, hx + size / 2, hy + size / 2, hx + size / 2, hy + size / 4);
            ctx.bezierCurveTo(hx + size / 2, hy, hx, hy, hx, hy + size / 4);
            ctx.fill();
          }

          // Rose decorations on sides
          const drawRose = (rx: number, ry: number) => {
            ctx.fillStyle = '#dc143c';
            for (let p = 0; p < 5; p++) {
              ctx.beginPath();
              ctx.ellipse(rx + Math.cos(p * 1.2) * 8, ry + Math.sin(p * 1.2) * 8, 10, 7, p * 0.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(rx - 15, ry + 20, 8, 4, -0.5, 0, Math.PI * 2);
            ctx.fill();
          };
          drawRose(50, groundY - 60);
          drawRose(canvas.width - 50, groundY - 80);

          break;
        }

        case 'autumn': {
          // Warm autumn colors
          const autumnGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          autumnGrad.addColorStop(0, '#87CEEB');
          autumnGrad.addColorStop(0.3, '#f5deb3');
          autumnGrad.addColorStop(1, '#deb887');
          ctx.fillStyle = autumnGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Falling leaves
          const leafColors = ['#ff6347', '#ff8c00', '#ffd700', '#dc143c', '#8b4513'];
          for (let i = 0; i < 20; i++) {
            const lx = (i * 43 + frameCountRef.current * 0.8 + Math.sin(frameCountRef.current * 0.05 + i) * 20) % canvas.width;
            const ly = (i * 37 + frameCountRef.current * 0.6) % (groundY + 20);
            const rot = (frameCountRef.current * 2 + i * 30) % 360;
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate((rot * Math.PI) / 180);
            ctx.fillStyle = leafColors[i % leafColors.length] ?? '#ff6347';
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Pumpkins on ground
          const drawPumpkin = (px: number, py: number, size: number) => {
            ctx.fillStyle = '#ff7f00';
            ctx.beginPath();
            ctx.ellipse(px, py, size, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ridges
            ctx.strokeStyle = '#e65c00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py - size * 0.8);
            ctx.quadraticCurveTo(px + size * 0.3, py, px, py + size * 0.8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(px, py - size * 0.8);
            ctx.quadraticCurveTo(px - size * 0.3, py, px, py + size * 0.8);
            ctx.stroke();
            // Stem
            ctx.fillStyle = '#228B22';
            ctx.fillRect(px - 3, py - size * 0.9, 6, 8);
          };
          drawPumpkin(100, groundY - 18, 18);
          drawPumpkin(canvas.width - 120, groundY - 15, 15);

          break;
        }

        case 'spring': {
          // Fresh spring colors
          const springGrad = ctx.createLinearGradient(0, 0, 0, groundY);
          springGrad.addColorStop(0, '#87CEEB');
          springGrad.addColorStop(0.5, '#98fb98');
          springGrad.addColorStop(1, '#90EE90');
          ctx.fillStyle = springGrad;
          ctx.fillRect(0, 0, canvas.width, groundY);

          // Flowers
          const flowerColors = ['#ff69b4', '#ff6347', '#ffd700', '#9370db', '#00ced1'];
          for (let i = 0; i < 12; i++) {
            const fx = 50 + i * 65;
            const fy = groundY - 20 - (i % 3) * 10;
            ctx.fillStyle = flowerColors[i % flowerColors.length] ?? '#ff69b4';
            // Petals
            for (let p = 0; p < 5; p++) {
              const angle = (p * 2 * Math.PI) / 5;
              ctx.beginPath();
              ctx.ellipse(fx + Math.cos(angle) * 8, fy + Math.sin(angle) * 8, 6, 4, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            // Center
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(fx, fy, 5, 0, Math.PI * 2);
            ctx.fill();
            // Stem
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx, fy + 8);
            ctx.lineTo(fx, groundY);
            ctx.stroke();
          }

          // Butterflies
          const drawButterfly = (bx: number, by: number) => {
            const wingFlap = Math.sin(frameCountRef.current * 0.3) * 0.3;
            ctx.fillStyle = '#ff69b4';
            ctx.save();
            ctx.translate(bx, by);
            // Left wing
            ctx.save();
            ctx.rotate(-0.3 + wingFlap);
            ctx.beginPath();
            ctx.ellipse(-8, 0, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Right wing
            ctx.save();
            ctx.rotate(0.3 - wingFlap);
            ctx.beginPath();
            ctx.ellipse(8, 0, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Body
            ctx.fillStyle = '#333';
            ctx.fillRect(-2, -8, 4, 16);
            ctx.restore();
          };
          const bfX = (frameCountRef.current * 2) % (canvas.width + 100) - 50;
          drawButterfly(bfX, 80 + Math.sin(frameCountRef.current * 0.05) * 20);

          break;
        }
      }
    };

    const drawGround = () => {
      const groundY = canvas.height - 50;
      const bg = backgroundRef.current;

      // Ground color varies by background
      let groundColor = '#3d405b';
      let lineColor = '#81b29a';

      if (bg === 'kitchen') {
        groundColor = '#5c4033';
        lineColor = '#8b7355';
      } else if (bg === 'nature') {
        groundColor = '#654321';
        lineColor = '#228B22';
      } else if (bg === 'sunset') {
        groundColor = '#2d2d44';
        lineColor = '#ff6b35';
      } else if (bg === 'night') {
        groundColor = '#1a1a2e';
        lineColor = '#4a4a6a';
      } else if (bg === 'birthday') {
        groundColor = '#f5f0e6';
        lineColor = '#e0d5c5';
      } else if (bg === 'christmas') {
        groundColor = '#ffffff';
        lineColor = '#e0e0e0';
      } else if (bg === 'valentine') {
        groundColor = '#ffb6c1';
        lineColor = '#ff69b4';
      } else if (bg === 'autumn') {
        groundColor = '#8b4513';
        lineColor = '#d2691e';
      } else if (bg === 'spring') {
        groundColor = '#228B22';
        lineColor = '#32CD32';
      }

      ctx.fillStyle = groundColor;
      ctx.fillRect(0, groundY, canvas.width, 50);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
    };

    const drawCatPlayer = () => {
      const px = player.x;
      const py = player.y;
      const pw = player.width;
      const ph = player.height;
      const cx = px + pw / 2;
      const cy = py + ph / 2;

      // Get current cat colors
      const cat = CAT_TYPES[catTypeRef.current] ?? CAT_TYPES[0];
      if (!cat) return;

      // Chibi bouncy effect
      const squish = player.isGrounded ? 1 : (player.velocityY < 0 ? 0.85 : 1.15);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, squish);
      ctx.translate(-cx, -cy);

      // === CHIBI CAT - Extra round! ===

      // Soft white glow for visibility against any background
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Tiny round ears
      ctx.fillStyle = cat.fur;
      ctx.beginPath();
      ctx.arc(px + 10, py + 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + pw - 10, py + 8, 10, 0, Math.PI * 2);
      ctx.fill();

      // Inner ear
      ctx.fillStyle = cat.innerEar;
      ctx.beginPath();
      ctx.arc(px + 10, py + 9, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + pw - 10, py + 9, 5, 0, Math.PI * 2);
      ctx.fill();

      // Big round chibi head!
      ctx.fillStyle = cat.fur;
      ctx.beginPath();
      ctx.arc(cx, cy + 5, pw / 2 + 5, 0, Math.PI * 2);
      ctx.fill();

      // Turn off shadow for face details
      ctx.shadowBlur = 0;

      // Light face area
      ctx.fillStyle = cat.furLight;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, pw / 2.5, ph / 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // === CHIBI EYES ===
      const expression = catExpressionRef.current;

      if (expression === 'happy') {
        // Happy ^_^ eyes
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 5, Math.PI + 0.5, -0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 8, cy, 5, Math.PI + 0.5, -0.5);
        ctx.stroke();
      } else if (expression === 'sad') {
        // Sad spiral eyes @_@
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Left spiral
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 2, Math.PI, Math.PI * 2.5);
        ctx.stroke();
        // Right spiral
        ctx.beginPath();
        ctx.arc(cx + 8, cy, 4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 8, cy, 2, Math.PI, Math.PI * 2.5);
        ctx.stroke();
      } else {
        // Normal big round chibi eyes
        // Left eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 8, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(cx - 6, cy + 1, 5, 0, Math.PI * 2);
        ctx.fill();
        // Sparkle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx - 9, cy - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + 8, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(cx + 10, cy + 1, 5, 0, Math.PI * 2);
        ctx.fill();
        // Sparkle
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(cx + 7, cy - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chibi blush (bigger, rounder)
      ctx.fillStyle = 'rgba(255, 130, 130, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy + 8, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 18, cy + 8, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tiny triangle nose
      ctx.fillStyle = cat.nose;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx - 3, cy + 15);
      ctx.lineTo(cx + 3, cy + 15);
      ctx.closePath();
      ctx.fill();

      // === CHIBI MOUTH ===
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      if (expression === 'happy') {
        // Big D shaped smile
        ctx.beginPath();
        ctx.arc(cx, cy + 18, 8, 0, Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#ff9999';
        ctx.beginPath();
        ctx.arc(cx, cy + 18, 7, 0.1, Math.PI - 0.1);
        ctx.fill();
      } else if (expression === 'sad') {
        // Tiny frown
        ctx.beginPath();
        ctx.arc(cx, cy + 22, 4, Math.PI + 0.3, -0.3);
        ctx.stroke();
      } else {
        // Tiny :3 mouth
        ctx.beginPath();
        ctx.arc(cx - 3, cy + 18, 3, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 18, 3, 0.3, Math.PI - 0.3);
        ctx.stroke();
      }

      // Short chibi whiskers
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      // Left
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 10);
      ctx.lineTo(cx - 25, cy + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 14);
      ctx.lineTo(cx - 25, cy + 14);
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy + 10);
      ctx.lineTo(cx + 25, cy + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 15, cy + 14);
      ctx.lineTo(cx + 25, cy + 14);
      ctx.stroke();

      // Birthday party hat on cat's head
      if (isBirthdayModeRef.current) {
        const hatTipX = cx + 8;
        const hatTipY = py - 18;
        const hatBaseY = py + 5;
        const hatWidth = 22;

        ctx.save();
        // Slight tilt for cuteness
        ctx.translate(hatTipX, hatBaseY);
        ctx.rotate(-0.15);
        ctx.translate(-hatTipX, -hatBaseY);

        // Party hat cone (pink with stripes)
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.moveTo(hatTipX, hatTipY);
        ctx.lineTo(hatTipX - hatWidth / 2, hatBaseY);
        ctx.lineTo(hatTipX + hatWidth / 2, hatBaseY);
        ctx.closePath();
        ctx.fill();

        // Stripes on hat
        ctx.strokeStyle = '#ffe66d';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          const y = hatTipY + (hatBaseY - hatTipY) * (i / 4);
          const width = (hatWidth / 2) * (i / 4);
          ctx.beginPath();
          ctx.moveTo(hatTipX - width, y);
          ctx.lineTo(hatTipX + width, y);
          ctx.stroke();
        }

        // Pom-pom on top
        ctx.fillStyle = '#ffe66d';
        ctx.beginPath();
        ctx.arc(hatTipX, hatTipY - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    };

    // Store button positions for click detection
    const difficultyButtonsRef = { easy: { x: 0, y: 0, w: 0, h: 0 }, medium: { x: 0, y: 0, w: 0, h: 0 }, hard: { x: 0, y: 0, w: 0, h: 0 } };

    const drawOverlay = (title: string, subtitle: string, catEmoji: string, showDifficulty: boolean) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Birthday special display
      if (isBirthdayModeRef.current && showDifficulty) {
        // Animated rainbow text for birthday
        const time = frameCountRef.current * 0.05;
        const rainbowColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];

        // Party emoji row
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎉🎂🎈🎁🎊', canvas.width / 2, canvas.height / 2 - 120);

        // Happy Birthday message with rainbow effect
        ctx.font = 'bold 28px sans-serif';
        const bday = currentBirthdayRef.current;
        const birthdayText = bday
          ? (language === 'en' ? bday.message : bday.messageCn)
          : (language === 'en' ? 'Happy Birthday!' : '生日快乐！');
        const chars = birthdayText.split('');
        const startX = canvas.width / 2 - (chars.length * 10);

        chars.forEach((char, i) => {
          const colorIndex = Math.floor((time + i * 0.5) % rainbowColors.length);
          ctx.fillStyle = rainbowColors[colorIndex] ?? '#ff6b6b';
          ctx.fillText(char, startX + i * 20, canvas.height / 2 - 70);
        });

        // Year display
        const year = new Date().getFullYear();
        ctx.fillStyle = '#ffd93d';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`🌟 ${year} 🌟`, canvas.width / 2, canvas.height / 2 - 35);

        // Game title below birthday message
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2);
      } else if (isHolidayModeRef.current && currentHolidayRef.current && showDifficulty) {
        // Holiday special display
        const holiday = currentHolidayRef.current;
        const holidayText = language === 'en' ? holiday.message : holiday.messageCn;

        // Holiday emoji/message
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(holidayText, canvas.width / 2, canvas.height / 2 - 80);

        // Game title
        ctx.fillStyle = '#ffd93d';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);
      } else {
        // Normal display
        // Show cat emoji
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(catEmoji, canvas.width / 2, canvas.height / 2 - 80);

        ctx.fillStyle = '#e07a5f';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);
      }

      if (showDifficulty) {
        // Draw difficulty selection buttons
        const buttonWidth = 120;
        const buttonHeight = 45;
        const buttonGap = 20;
        const totalWidth = buttonWidth * 3 + buttonGap * 2;
        const startX = (canvas.width - totalWidth) / 2;
        const buttonY = canvas.height / 2 + 20;

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;

        difficulties.forEach((diff, i) => {
          const config = DIFFICULTY_CONFIG[diff];
          const bx = startX + i * (buttonWidth + buttonGap);
          const by = buttonY;

          // Store button position for click detection
          difficultyButtonsRef[diff] = { x: bx, y: by, w: buttonWidth, h: buttonHeight };

          // Check if mouse is hovering
          const isHover = mouseX >= bx && mouseX <= bx + buttonWidth && mouseY >= by && mouseY <= by + buttonHeight;
          const isSelected = difficultyRef.current === diff;

          // Draw button background
          ctx.fillStyle = isHover || isSelected ? config.color : 'rgba(255,255,255,0.15)';
          ctx.beginPath();
          ctx.roundRect(bx, by, buttonWidth, buttonHeight, 8);
          ctx.fill();

          // Draw button border
          ctx.strokeStyle = config.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw button text
          ctx.fillStyle = isHover || isSelected ? '#000' : '#fff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(language === 'en' ? config.label : config.labelCn, bx + buttonWidth / 2, by + buttonHeight / 2 + 6);
        });

        // Draw prompt below buttons
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText(
          language === 'en' ? 'Let\'s grow!' : '开始游戏！',
          canvas.width / 2,
          buttonY + buttonHeight + 30
        );
      } else {
        // Just show subtitle (for game over)
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 25);
      }
    };

    // Touch control button positions (stored for hit detection)
    const touchButtonSize = 70;
    const touchButtonY = canvas.height - 130;
    const leftButtonX = 30;
    const rightButtonX = 130;

    const drawTouchControls = () => {
      // Only show on touch devices during gameplay
      if (gameStateRef.current !== 'PLAYING' || !isTouchDeviceRef.current) return;

      // Semi-transparent control buttons for mobile
      const drawButton = (x: number, y: number, isPressed: boolean, arrow: 'left' | 'right') => {
        ctx.globalAlpha = isPressed ? 0.8 : 0.4;

        // Button background
        ctx.fillStyle = isPressed ? '#e07a5f' : '#3d405b';
        ctx.beginPath();
        ctx.roundRect(x, y, touchButtonSize, touchButtonSize, 12);
        ctx.fill();

        // Button border
        ctx.strokeStyle = '#81b29a';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(arrow === 'left' ? '◀' : '▶', x + touchButtonSize / 2, y + touchButtonSize / 2 + 10);

        ctx.globalAlpha = 1;
      };

      drawButton(leftButtonX, touchButtonY, touchControlsRef.current.left, 'left');
      drawButton(rightButtonX, touchButtonY, touchControlsRef.current.right, 'right');

      // Jump hint on right side
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#3d405b';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 100, touchButtonY, touchButtonSize, touchButtonSize, 12);
      ctx.fill();
      ctx.strokeStyle = '#81b29a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬆', canvas.width - 100 + touchButtonSize / 2, touchButtonY + touchButtonSize / 2 + 8);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('TAP', canvas.width - 100 + touchButtonSize / 2, touchButtonY + touchButtonSize - 8);
      ctx.globalAlpha = 1;
    };

    // Draw Mario-style platforms
    const drawPlatforms = () => {
      platformsRef.current.forEach((platform) => {
        const { x, y, width, height, type } = platform;

        if (type === 'brick') {
          // Brick platform - classic brown bricks
          ctx.fillStyle = '#b5651d';
          ctx.fillRect(x, y, width, height);

          // Brick pattern
          ctx.strokeStyle = '#8b4513';
          ctx.lineWidth = 1;
          const brickWidth = 20;
          const brickHeight = height;
          for (let bx = 0; bx < width; bx += brickWidth) {
            ctx.strokeRect(x + bx, y, Math.min(brickWidth, width - bx), brickHeight);
          }

          // Highlight on top
          ctx.fillStyle = '#d4a574';
          ctx.fillRect(x, y, width, 3);
        } else if (type === 'block') {
          // Question block style - golden with shine
          ctx.fillStyle = '#daa520';
          ctx.fillRect(x, y, width, height);

          // Border
          ctx.strokeStyle = '#8b6914';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Shine effect
          ctx.fillStyle = '#ffe135';
          ctx.fillRect(x + 2, y + 2, 8, 4);

          // Question mark or dot
          ctx.fillStyle = '#8b4513';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('?', x + width / 2, y + height - 4);
        } else {
          // Green pipe (type === 'pipe')
          ctx.fillStyle = '#228b22';
          ctx.fillRect(x, y, width, height);

          // Pipe rim at top
          ctx.fillStyle = '#32cd32';
          ctx.fillRect(x - 4, y, width + 8, 10);

          // Highlight
          ctx.fillStyle = '#90ee90';
          ctx.fillRect(x + 4, y + 12, 6, height - 16);

          // Shadow
          ctx.fillStyle = '#006400';
          ctx.fillRect(x + width - 8, y + 12, 4, height - 16);
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
      drawGround();
      drawPlatforms();
      drawCatPlayer();

      // Draw obstacles (emoji only, no block)
      obstaclesRef.current.forEach((obs) => {
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obs.emoji, obs.x + obs.width / 2, obs.y + obs.height - 5);
      });

      // Draw collectibles with sparkle effects
      collectiblesRef.current.forEach((c, idx) => {
        if (!c.collected) {
          const cx = c.x + c.size / 2;
          const cy = c.y + c.size / 2;
          const time = frameCountRef.current * 0.1 + idx;

          // Floating animation
          const floatY = Math.sin(time * 0.5) * 3;

          // Glow effect behind food
          const gradient = ctx.createRadialGradient(cx, cy + floatY, 0, cx, cy + floatY, 25);
          gradient.addColorStop(0, 'rgba(255, 223, 100, 0.4)');
          gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy + floatY, 25, 0, Math.PI * 2);
          ctx.fill();

          // Food emoji (larger)
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.emoji, cx, cy + 10 + floatY);

          // Sparkles around food
          ctx.fillStyle = '#fff';
          const sparkleOffset = time * 2;
          for (let i = 0; i < 3; i++) {
            const angle = (i * 2.1 + sparkleOffset) % (Math.PI * 2);
            const dist = 18 + Math.sin(time + i) * 3;
            const sx = cx + Math.cos(angle) * dist;
            const sy = cy + floatY + Math.sin(angle) * dist;
            const size = 2 + Math.sin(time * 2 + i) * 1;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Points badge
          ctx.fillStyle = '#ffd700';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(`+${c.points}`, cx, cy + c.size + 8 + floatY);
        }
      });

      // Draw score UI
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ ${scoreRef.current}`, 20, 35);

      // High score with trophy
      ctx.fillText(`🏆 ${highScoreRef.current}`, 20, 60);

      // Draw lives with number
      ctx.fillText(`❤️ ${livesRef.current}`, 20, 85);

      // Draw hit effects (floating -points when hit)
      const now = Date.now();
      hitEffectsRef.current = hitEffectsRef.current.filter(effect => now - effect.timestamp < 1000);
      hitEffectsRef.current.forEach((effect) => {
        const age = now - effect.timestamp;
        const alpha = Math.max(0, 1 - age / 1000);
        const yOffset = (age / 1000) * 40;

        ctx.globalAlpha = alpha;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#ff6b6b';
        ctx.textAlign = 'center';
        ctx.fillText(`${effect.points}`, effect.x, effect.y - yOffset);
        ctx.globalAlpha = 1;
      });

      // Show food counts in a single line at top right
      const counts = Array.from(foodCountsRef.current.values());
      if (counts.length > 0) {
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        // Build a single line string with all food items
        const foodLine = counts
          .slice(0, 10)
          .map((food) => `${food.emoji}x${food.count}`)
          .join('  ');
        ctx.fillText(foodLine, canvas.width - 20, 30);
      }

      // Show recently collected items (floating text effect)
      collectedItemsRef.current = collectedItemsRef.current.filter(item => now - item.timestamp < 1500);

      collectedItemsRef.current.forEach((item, index) => {
        const age = now - item.timestamp;
        const alpha = Math.max(0, 1 - age / 1500);
        const yOffset = (age / 1500) * 30;

        ctx.globalAlpha = alpha;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${item.emoji} +${item.points}`,
          canvas.width / 2,
          100 + index * 25 - yOffset
        );
        ctx.globalAlpha = 1;
      });

      // Draw mobile touch controls
      drawTouchControls();

      // Overlay screens
      if (gameStateRef.current === 'START') {
        drawOverlay(t.title, t.startPrompt, '😺', true); // Happy cat + difficulty selection
      } else if (gameStateRef.current === 'GAMEOVER') {
        drawOverlay(t.gameOver, `${t.score}: ${scoreRef.current} | ${t.retry}`, '😿', false); // Sad cat, no difficulty
      }
    };

    const gameLoop = () => {
      update();
      render();
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    animationIdRef.current = requestAnimationFrame(gameLoop);

    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      }
      // Left/right movement
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        keysRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = false;
      }
    };

    // Get canvas-relative mouse position
    const getCanvasPosition = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const pos = getCanvasPosition(e);
      mousePositionRef.current = pos;
    };

    // Check if position is on a touch control button
    const checkTouchControl = (pos: { x: number; y: number }) => {
      if (gameStateRef.current !== 'PLAYING') return null;

      // Left button
      if (pos.x >= leftButtonX && pos.x <= leftButtonX + touchButtonSize &&
          pos.y >= touchButtonY && pos.y <= touchButtonY + touchButtonSize) {
        return 'left';
      }
      // Right button
      if (pos.x >= rightButtonX && pos.x <= rightButtonX + touchButtonSize &&
          pos.y >= touchButtonY && pos.y <= touchButtonY + touchButtonSize) {
        return 'right';
      }
      return null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Detect touch device when user actually touches the screen
      if (e.pointerType === 'touch') {
        isTouchDeviceRef.current = true;
      }

      const pos = getCanvasPosition(e);

      // Check for difficulty button clicks on start screen
      if (gameStateRef.current === 'START') {
        const buttonWidth = 120;
        const buttonHeight = 45;
        const buttonGap = 20;
        const totalWidth = buttonWidth * 3 + buttonGap * 2;
        const startX = (canvas.width - totalWidth) / 2;
        const buttonY = canvas.height / 2 + 20;

        const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
        for (let i = 0; i < difficulties.length; i++) {
          const diff = difficulties[i];
          if (!diff) continue;
          const bx = startX + i * (buttonWidth + buttonGap);
          if (pos.x >= bx && pos.x <= bx + buttonWidth && pos.y >= buttonY && pos.y <= buttonY + buttonHeight) {
            difficultyRef.current = diff;
            resetGame();
            gameStateRef.current = 'PLAYING';
            return;
          }
        }
        return; // Don't fall through to regular action on start screen
      }

      // Check for touch control buttons during gameplay
      const touchControl = checkTouchControl(pos);
      if (touchControl === 'left') {
        touchControlsRef.current.left = true;
        keysRef.current.left = true;
        return;
      }
      if (touchControl === 'right') {
        touchControlsRef.current.right = true;
        keysRef.current.right = true;
        return;
      }

      // Regular action (jump or restart)
      handleAction();
    };

    const handlePointerUp = () => {
      // Release touch controls (but not keyboard controls)
      if (touchControlsRef.current.left) {
        touchControlsRef.current.left = false;
        keysRef.current.left = false;
      }
      if (touchControlsRef.current.right) {
        touchControlsRef.current.right = false;
        keysRef.current.right = false;
      }
    };

    const handlePointerLeave = () => {
      // Release touch controls when pointer leaves canvas
      if (touchControlsRef.current.left) {
        touchControlsRef.current.left = false;
        keysRef.current.left = false;
      }
      if (touchControlsRef.current.right) {
        touchControlsRef.current.right = false;
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handleAction, resetGame, spawnObstacle, spawnCollectible, spawnPlatform, t, language, playMoveSound, playCollectSound, playHitSound, stopMusic]);

  return (
    <div id="game-root" className="w-full">
      <div className="mb-8 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray500}`}>{t.description}</p>
      </div>

      <div className="flex justify-center">
        <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="block bg-[#2b2d42] max-w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            title={isMuted ? (language === 'en' ? 'Unmute' : '取消静音') : (language === 'en' ? 'Mute' : '静音')}
          >
            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
          {/* Birthday indicator */}
          {isBirthdayModeRef.current && currentBirthdayRef.current && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-pink-500/80 text-white text-sm font-bold">
              🎂 {language === 'en' ? `${currentBirthdayRef.current.name}'s Birthday!` : `${currentBirthdayRef.current.name} 生日快乐！`}
            </div>
          )}
          {/* Holiday indicator */}
          {isHolidayModeRef.current && currentHolidayRef.current && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-green-500/80 text-white text-sm font-bold">
              {language === 'en' ? currentHolidayRef.current.message : currentHolidayRef.current.messageCn}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className={`${TYPOGRAPHY.body} ${COLORS.gray400} text-sm`}>
          {language === 'en'
            ? 'Tip: 🌱Easy has more lives, 💀Hard is faster! 🌽🍅 restore health. Avoid seafood 🦐🦀!'
            : '提示：🌱简单有更多生命，💀困难速度更快！🌽🍅 可恢复生命。躲避海鲜 🦐🦀！'}
        </p>
      </div>
    </div>
  );
};

export default Game;
