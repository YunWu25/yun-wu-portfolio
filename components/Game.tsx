import React, { useEffect, useRef, useCallback } from 'react';
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

// Difficulty settings
type Difficulty = 'easy' | 'medium' | 'hard';

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
  const animationIdRef = useRef<number>(0);
  const catTypeRef = useRef(0); // Current cat design index
  const catExpressionRef = useRef<'normal' | 'happy' | 'sad'>('normal');
  const expressionTimeoutRef = useRef<number>(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });


  const playerRef = useRef({
    x: 80,
    y: 0,
    width: 50,
    height: 50,
    velocityY: 0,
    gravity: 0.6,
    jumpForce: -13,
    isGrounded: false,
    speed: 6,
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
      title: 'SNACK CATCHER',
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
    // Pick a random cute cat for this game!
    catTypeRef.current = Math.floor(Math.random() * CAT_TYPES.length);

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

  const handleAction = useCallback(() => {
    if (gameStateRef.current === 'START' || gameStateRef.current === 'GAMEOVER') {
      resetGame();
      gameStateRef.current = 'PLAYING';
    } else {
      // Currently playing - handle jump
      const player = playerRef.current;
      if (player.isGrounded) {
        player.velocityY = player.jumpForce;
        player.isGrounded = false;
      }
    }
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize player position
    const player = playerRef.current;
    player.y = canvas.height - 50 - player.height;

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
      if (keysRef.current.left) {
        player.x -= player.speed;
      }
      if (keysRef.current.right) {
        player.x += player.speed;
      }
      // Keep player within canvas bounds
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

      // Update player - vertical movement
      player.velocityY += player.gravity;
      player.y += player.velocityY;

      const groundLevel = canvas.height - 50 - player.height;
      if (player.y >= groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isGrounded = true;
      }

      // Spawn obstacles & collectibles (rate based on difficulty)
      const spawnRate = Math.max(50, config.obstacleSpawnBase - Math.floor(gameSpeedRef.current * 3));
      if (frameCountRef.current % spawnRate === 0) {
        if (Math.random() > 0.3) spawnObstacle();
      }
      if (frameCountRef.current % 90 === 0 && Math.random() > 0.2) {
        spawnCollectible();
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

          // Corn and Tomato give extra life (max based on difficulty starting lives)
          const maxLives = DIFFICULTY_CONFIG[difficultyRef.current].startLives;
          if (c.givesLife && livesRef.current < maxLives) {
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

      // Small passive score increase
      if (frameCountRef.current % 10 === 0) {
        scoreRef.current++;
      }
    };

    const drawGround = () => {
      const groundY = canvas.height - 50;
      ctx.fillStyle = '#3d405b';
      ctx.fillRect(0, groundY, canvas.width, 50);

      ctx.strokeStyle = '#81b29a';
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

      ctx.restore();
    };

    // Store button positions for click detection
    const difficultyButtonsRef = { easy: { x: 0, y: 0, w: 0, h: 0 }, medium: { x: 0, y: 0, w: 0, h: 0 }, hard: { x: 0, y: 0, w: 0, h: 0 } };

    const drawOverlay = (title: string, subtitle: string, catEmoji: string, showDifficulty: boolean) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Show cat emoji
      ctx.font = '48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(catEmoji, canvas.width / 2, canvas.height / 2 - 80);

      ctx.fillStyle = '#e07a5f';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);

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
          language === 'en' ? 'Click a difficulty to start!' : '点击难度开始游戏！',
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

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGround();
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
  }, [handleAction, resetGame, spawnObstacle, spawnCollectible, t, language]);

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
