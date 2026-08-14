import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Language } from '../../App';

interface SaccadesTrainingProps {
  language: Language;
  onExit: () => void;
}

type Speed = 'slow' | 'medium' | 'fast';
type Pattern = 'random' | 'horizontal' | 'vertical' | 'diagonal';

const CORAL_COLOR = '#FF6B6B';
const INACTIVE_COLOR = '#4a4a4a';

const SPEEDS: Record<Speed, number> = {
  slow: 1000,
  medium: 600,
  fast: 350,
};

const content = {
  en: {
    title: 'Saccades Training',
    instructions: 'Quickly move your eyes to follow the highlighted target.',
    suggestedTime: 'Suggested: 3 min',
    speed: 'Speed',
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    targets: 'Targets',
    pattern: 'Pattern',
    random: 'Random',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    diagonal: 'Diagonal',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
  },
  zh: {
    title: '快速跳跃训练',
    instructions: '快速移动视线追踪高亮的目标。',
    suggestedTime: '建议时长：3分钟',
    speed: '速度',
    slow: '慢',
    medium: '中',
    fast: '快',
    targets: '目标数',
    pattern: '模式',
    random: '随机',
    horizontal: '水平',
    vertical: '垂直',
    diagonal: '对角',
    pause: '暂停',
    resume: '继续',
    exit: '退出',
  },
};

interface Target {
  x: number;
  y: number;
}

const SaccadesTraining: React.FC<SaccadesTrainingProps> = ({ language, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastSwitchTimeRef = useRef<number>(0);
  const animateRef = useRef<((timestamp: number) => void) | null>(null);

  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState<Speed>('medium');
  const [targetCount, setTargetCount] = useState(4);
  const [pattern, setPattern] = useState<Pattern>('random');
  const [activeIndex, setActiveIndex] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds

  const t = content[language];

  // Generate target positions based on pattern
  const generateTargets = useCallback((canvas: HTMLCanvasElement, count: number, pat: Pattern): Target[] => {
    const paddingTop = 80;
    const paddingSide = 120;
    const paddingBottom = 220; // More padding for bottom control panel
    const centerX = canvas.width / 2;
    const centerY = (canvas.height - paddingBottom + paddingTop) / 2; // Offset center upward
    const maxRadius = Math.min(canvas.width - paddingSide * 2, canvas.height - paddingTop - paddingBottom) / 2;

    const newTargets: Target[] = [];

    switch (pat) {
      case 'horizontal': {
        for (let i = 0; i < count; i++) {
          newTargets.push({
            x: paddingSide + (i * (canvas.width - paddingSide * 2)) / (count - 1 || 1),
            y: centerY,
          });
        }
        break;
      }
      case 'vertical': {
        for (let i = 0; i < count; i++) {
          newTargets.push({
            x: centerX,
            y: paddingTop + (i * (canvas.height - paddingTop - paddingBottom)) / (count - 1 || 1),
          });
        }
        break;
      }
      case 'diagonal': {
        for (let i = 0; i < count; i++) {
          const progress = i / (count - 1 || 1);
          newTargets.push({
            x: paddingSide + progress * (canvas.width - paddingSide * 2),
            y: paddingTop + progress * (canvas.height - paddingTop - paddingBottom),
          });
        }
        break;
      }
      case 'random':
      default: {
        // Distribute evenly around a circle
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // Start from top
          newTargets.push({
            x: centerX + Math.cos(angle) * maxRadius,
            y: centerY + Math.sin(angle) * maxRadius,
          });
        }
      }
    }

    return newTargets;
  }, []);

  // Get next target index
  const getNextIndex = useCallback((current: number, count: number, pat: Pattern): number => {
    if (pat === 'random') {
      let next = Math.floor(Math.random() * count);
      // Avoid same index
      while (next === current && count > 1) {
        next = Math.floor(Math.random() * count);
      }
      return next;
    }
    return (current + 1) % count;
  }, []);

  // Animation loop
  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const switchInterval = SPEEDS[speed];

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Check if it's time to switch target
      if (timestamp - lastSwitchTimeRef.current > switchInterval) {
        setActiveIndex(prev => getNextIndex(prev, targets.length, pattern));
        lastSwitchTimeRef.current = timestamp;
      }

      // Draw targets
      const radius = 25;
      targets.forEach((target, index) => {
        const isActive = index === activeIndex;

        if (isActive) {
          // Glow effect
          const gradient = ctx.createRadialGradient(
            target.x, target.y, 0,
            target.x, target.y, radius * 2.5
          );
          gradient.addColorStop(0, `${CORAL_COLOR}60`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(target.x, target.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main circle
        ctx.fillStyle = isActive ? CORAL_COLOR : INACTIVE_COLOR;
        ctx.beginPath();
        ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner dot for active target
        if (isActive) {
          ctx.fillStyle = '#FF8A8A';
          ctx.beginPath();
          ctx.arc(target.x, target.y, radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (isRunning && animateRef.current) {
        animationRef.current = requestAnimationFrame(animateRef.current);
      }
    };
  }, [isRunning, speed, targets, activeIndex, pattern, getNextIndex]);

  // Setup canvas and generate targets
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setTargets(generateTargets(canvas, targetCount, pattern));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [generateTargets, targetCount, pattern]);

  // Start/stop animation
  useEffect(() => {
    if (isRunning && targets.length > 0 && animateRef.current) {
      lastSwitchTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animateRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, targets.length, speed, activeIndex, pattern, getNextIndex]);

  // 3-minute countdown timer
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => { clearInterval(timer); };
  }, [isRunning, timeRemaining]);


  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Exit Button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20
                   flex items-center justify-center text-white text-2xl transition-colors z-10"
        aria-label={t.exit}
      >
        &times;
      </button>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
        <div className="max-w-2xl mx-auto">
          {/* Instructions */}
          <p className="text-white/80 text-center text-sm mb-2">
            {t.instructions}
          </p>

          {/* Timer */}
          <div className="text-center mb-4">
            <span className="text-white/60 text-xs">{t.suggestedTime}</span>
            <span className={`ml-2 font-mono text-lg ${timeRemaining > 0 ? 'text-coral' : 'text-green-400'}`}>
              {formatTime(timeRemaining)}
            </span>
            {timeRemaining === 0 && (
              <span className="ml-2 text-green-400 text-sm">✓</span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-3 md:gap-4">
            {/* Pause/Resume */}
            <button
              onClick={() => { setIsRunning(!isRunning); }}
              className="w-full md:w-auto px-6 py-2 rounded-full bg-white/10 hover:bg-white/20
                         text-white font-medium transition-colors"
            >
              {isRunning ? t.pause : t.resume}
            </button>

            {/* Speed Controls */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm">{t.speed}:</span>
              {(['slow', 'medium', 'fast'] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpeed(s); }}
                  className={`px-4 py-2 md:px-3 md:py-1 rounded-full text-sm transition-colors ${
                    speed === s
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {t[s]}
                </button>
              ))}
            </div>

            {/* Target Count */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm">{t.targets}:</span>
              {[3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => { setTargetCount(count); }}
                  className={`w-10 h-10 md:w-8 md:h-8 rounded-full text-sm transition-colors ${
                    targetCount === count
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Pattern */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-white/60 text-sm">{t.pattern}:</span>
              {(['random', 'horizontal', 'vertical'] as Pattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPattern(p); setTimeRemaining(180); }}
                  className={`px-4 py-2 md:px-3 md:py-1 rounded-full text-sm transition-colors ${
                    pattern === p
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {t[p]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaccadesTraining;
