import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Language } from '../../App';

interface PursuitsTrainingProps {
  language: Language;
  onExit: () => void;
}

type Speed = 'slow' | 'medium' | 'fast';
type Pattern = 'circle' | 'wave' | 'figure8' | 'spiral' | 'bounce';
type Direction = 'clockwise' | 'counterclockwise';

const CORAL_COLOR = '#FF6B6B';

const SPEEDS: Record<Speed, number> = {
  slow: 0.6,
  medium: 1.0,
  fast: 1.5,
};

const content = {
  en: {
    title: 'Pursuits Training',
    instructions: 'Smoothly follow the moving target with your eyes.',
    suggestedTime: 'Suggested: 3 min',
    speed: 'Speed',
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    pattern: 'Pattern',
    circle: 'Circle',
    wave: 'Wave',
    figure8: 'Figure 8',
    spiral: 'Spiral',
    bounce: 'Bounce',
    direction: 'Direction',
    clockwise: 'CW',
    counterclockwise: 'CCW',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
  },
  zh: {
    title: '圆滑追踪训练',
    instructions: '用眼睛平滑地跟随移动的目标。',
    suggestedTime: '建议时长：3分钟',
    speed: '速度',
    slow: '慢',
    medium: '中',
    fast: '快',
    pattern: '轨迹',
    circle: '圆形',
    wave: '波浪',
    figure8: '8字形',
    spiral: '螺旋',
    bounce: '弹跳',
    direction: '方向',
    clockwise: '顺时针',
    counterclockwise: '逆时针',
    pause: '暂停',
    resume: '继续',
    exit: '退出',
  },
};

const PursuitsTraining: React.FC<PursuitsTrainingProps> = ({ language, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const angleRef = useRef(0);
  const trailRef = useRef<{x: number; y: number; alpha: number}[]>([]);
  const animateRef = useRef<(() => void) | null>(null);
  const bounceRef = useRef({
    x: 0,
    y: 0,
    vx: 3,
    vy: 2,
    initialized: false,
    // Squash/stretch effect for bounce feel
    scaleX: 1,
    scaleY: 1,
  });

  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState<Speed>('medium');
  const [pattern, setPattern] = useState<Pattern>('circle');
  const [direction, setDirection] = useState<Direction>('clockwise');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds

  const t = content[language];

  // Calculate ball position based on pattern
  const getPosition = useCallback((
    angle: number,
    centerX: number,
    centerY: number,
    pat: Pattern,
    maxRadius: number
  ): { x: number; y: number } => {
    const dir = direction === 'clockwise' ? 1 : -1;
    const a = angle * dir;

    switch (pat) {
      case 'circle': {
        return {
          x: centerX + Math.cos(a) * maxRadius,
          y: centerY + Math.sin(a) * maxRadius,
        };
      }

      case 'wave': {
        // Horizontal wave - use positive modulo to handle CCW direction
        const period = Math.PI * 2;
        const normalizedAngle = ((a % period) + period) % period;
        const waveProgress = normalizedAngle / period;
        return {
          x: centerX - maxRadius + waveProgress * maxRadius * 2,
          y: centerY + Math.sin(a * 3) * (maxRadius * 0.5),
        };
      }

      case 'figure8': {
        // Lemniscate (figure-8)
        const scale = maxRadius * 0.7;
        return {
          x: centerX + Math.sin(a) * scale,
          y: centerY + Math.sin(a * 2) * (scale * 0.5),
        };
      }

      case 'spiral': {
        // Expanding/contracting spiral - use positive modulo to handle CCW direction
        const period = Math.PI * 4;
        const normalizedAngle = ((a % period) + period) % period;
        const spiralPhase = normalizedAngle / period;
        const spiralRadius = maxRadius * (0.3 + spiralPhase * 0.7);
        return {
          x: centerX + Math.cos(a * 2) * spiralRadius,
          y: centerY + Math.sin(a * 2) * spiralRadius,
        };
      }

      default: {
        return { x: centerX, y: centerY };
      }
    }
  }, [direction]);

  // Animation loop
  useEffect(() => {
    animateRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35;
      const ballRadius = 20;
      const padding = ballRadius + 10;

      let pos: { x: number; y: number };

      if (pattern === 'bounce') {
        // Bounce pattern: update position based on velocity
        const bounce = bounceRef.current;

        // Initialize position at center if not done
        if (!bounce.initialized) {
          bounce.x = centerX;
          bounce.y = centerY;
          // Random initial direction
          const angle = Math.random() * Math.PI * 2;
          const baseSpeed = 3 + SPEEDS[speed] * 3;
          bounce.vx = Math.cos(angle) * baseSpeed;
          bounce.vy = Math.sin(angle) * baseSpeed;
          bounce.scaleX = 1;
          bounce.scaleY = 1;
          bounce.initialized = true;
        }

        // Update velocity based on speed setting
        const currentSpeed = Math.sqrt(bounce.vx * bounce.vx + bounce.vy * bounce.vy);
        const targetSpeed = 3 + SPEEDS[speed] * 3;
        if (Math.abs(currentSpeed - targetSpeed) > 0.5) {
          const scale = targetSpeed / currentSpeed;
          bounce.vx *= scale;
          bounce.vy *= scale;
        }

        // Update position
        bounce.x += bounce.vx;
        bounce.y += bounce.vy;

        // Gradually return scale to normal (spring back effect)
        bounce.scaleX += (1 - bounce.scaleX) * 0.15;
        bounce.scaleY += (1 - bounce.scaleY) * 0.15;

        // Bounce off edges with squash/stretch effect
        if (bounce.x <= padding) {
          bounce.x = padding;
          bounce.vx = Math.abs(bounce.vx);
          // Squash horizontally, stretch vertically
          bounce.scaleX = 0.6;
          bounce.scaleY = 1.4;
        } else if (bounce.x >= canvas.width - padding) {
          bounce.x = canvas.width - padding;
          bounce.vx = -Math.abs(bounce.vx);
          bounce.scaleX = 0.6;
          bounce.scaleY = 1.4;
        }

        if (bounce.y <= padding) {
          bounce.y = padding;
          bounce.vy = Math.abs(bounce.vy);
          // Squash vertically, stretch horizontally
          bounce.scaleX = 1.4;
          bounce.scaleY = 0.6;
        } else if (bounce.y >= canvas.height - padding) {
          bounce.y = canvas.height - padding;
          bounce.vy = -Math.abs(bounce.vy);
          bounce.scaleX = 1.4;
          bounce.scaleY = 0.6;
        }

        pos = { x: bounce.x, y: bounce.y };
      } else {
        // Path-based patterns: update angle and get position
        angleRef.current += SPEEDS[speed] * 0.02;
        pos = getPosition(angleRef.current, centerX, centerY, pattern, maxRadius);
      }

      // Update trail
      trailRef.current.unshift({ x: pos.x, y: pos.y, alpha: 1 });
      if (trailRef.current.length > 30) {
        trailRef.current.pop();
      }
      trailRef.current.forEach((point, i) => {
        point.alpha = 1 - (i / 30);
      });

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint path guide (skip for bounce pattern)
      if (pattern !== 'bounce') {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();

        for (let i = 0; i <= 100; i++) {
          const guideAngle = (i / 100) * Math.PI * 2;
          const guidePos = getPosition(guideAngle, centerX, centerY, pattern, maxRadius);
          if (i === 0) {
            ctx.moveTo(guidePos.x, guidePos.y);
          } else {
            ctx.lineTo(guidePos.x, guidePos.y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw trail
      trailRef.current.forEach((point, i) => {
        if (i === 0) return; // Skip the current position
        const size = ballRadius * (1 - i / 30) * 0.8;
        ctx.fillStyle = `rgba(255, 107, 107, ${point.alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Get scale values for bounce effect
      const scaleX = pattern === 'bounce' ? bounceRef.current.scaleX : 1;
      const scaleY = pattern === 'bounce' ? bounceRef.current.scaleY : 1;

      // Draw glow
      const gradient = ctx.createRadialGradient(
        pos.x, pos.y, 0,
        pos.x, pos.y, ballRadius * 2.5
      );
      gradient.addColorStop(0, `${CORAL_COLOR}50`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, ballRadius * 2.5 * scaleX, ballRadius * 2.5 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw ball with squash/stretch effect
      ctx.fillStyle = CORAL_COLOR;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, ballRadius * scaleX, ballRadius * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = '#FF8A8A';
      ctx.beginPath();
      const highlightOffsetX = ballRadius * 0.25 * scaleX;
      const highlightOffsetY = ballRadius * 0.25 * scaleY;
      ctx.ellipse(pos.x - highlightOffsetX, pos.y - highlightOffsetY, ballRadius * 0.35 * scaleX, ballRadius * 0.35 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isRunning && animateRef.current) {
        animationRef.current = requestAnimationFrame(animateRef.current);
      }
    };
  }, [isRunning, speed, pattern, getPosition]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Start/stop animation
  useEffect(() => {
    if (isRunning && animateRef.current) {
      animationRef.current = requestAnimationFrame(animateRef.current);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, speed, pattern, getPosition]);

  // Reset trail and bounce state when pattern changes
  useEffect(() => {
    trailRef.current = [];
    bounceRef.current.initialized = false;
  }, [pattern]);

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

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Pause/Resume */}
            <button
              onClick={() => { setIsRunning(!isRunning); }}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20
                         text-white font-medium transition-colors"
            >
              {isRunning ? t.pause : t.resume}
            </button>

            {/* Speed Controls */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">{t.speed}:</span>
              {(['slow', 'medium', 'fast'] as Speed[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpeed(s); }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    speed === s
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {t[s]}
                </button>
              ))}
            </div>

            {/* Pattern */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">{t.pattern}:</span>
              {(['circle', 'wave', 'figure8', 'spiral', 'bounce'] as Pattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPattern(p); setTimeRemaining(180); }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    pattern === p
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {t[p]}
                </button>
              ))}
            </div>

            {/* Direction */}
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">{t.direction}:</span>
              {(['clockwise', 'counterclockwise'] as Direction[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDirection(d); }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    direction === d
                      ? 'bg-coral text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {t[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PursuitsTraining;
