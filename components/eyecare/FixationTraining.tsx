import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Language } from '../../App';

interface FixationTrainingProps {
  language: Language;
  onExit: () => void;
}

type Speed = 'slow' | 'medium' | 'fast';

const CORAL_COLOR = '#FF6B6B';
const SPEEDS: Record<Speed, number> = {
  slow: 3000,
  medium: 2000,
  fast: 1000,
};

const content = {
  en: {
    title: 'Fixation Training',
    instructions: 'Focus your eyes on the target. It will pulse and move to new positions.',
    speed: 'Speed',
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
  },
  zh: {
    title: '定神聚焦训练',
    instructions: '将视线集中在目标上。它会闪烁并移动到新位置。',
    speed: '速度',
    slow: '慢',
    medium: '中',
    fast: '快',
    pause: '暂停',
    resume: '继续',
    exit: '退出',
  },
};

const FixationTraining: React.FC<FixationTrainingProps> = ({ language, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const animateRef = useRef<((timestamp: number) => void) | null>(null);

  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState<Speed>('medium');

  // Target state
  const targetRef = useRef({
    x: 0,
    y: 0,
    baseRadius: 30,
    scale: 1,
    pulsePhase: 0,
  });

  const t = content[language];

  // Generate random position within canvas bounds
  const getRandomPosition = useCallback((canvas: HTMLCanvasElement) => {
    const padding = 100;
    return {
      x: padding + Math.random() * (canvas.width - padding * 2),
      y: padding + Math.random() * (canvas.height - padding * 2),
    };
  }, []);

  // Animation loop
  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const target = targetRef.current;
      const moveInterval = SPEEDS[speed];

      // Clear canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Check if it's time to move target
      if (timestamp - lastMoveTimeRef.current > moveInterval) {
        const newPos = getRandomPosition(canvas);
        target.x = newPos.x;
        target.y = newPos.y;
        lastMoveTimeRef.current = timestamp;
      }

      // Update pulse animation
      target.pulsePhase += 0.08;
      target.scale = 1 + Math.sin(target.pulsePhase) * 0.3;

      // Draw target
      const radius = target.baseRadius * target.scale;

      // Outer glow
      const gradient = ctx.createRadialGradient(
        target.x, target.y, 0,
        target.x, target.y, radius * 2
      );
      gradient.addColorStop(0, `${CORAL_COLOR}40`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(target.x, target.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Main circle
      ctx.fillStyle = CORAL_COLOR;
      ctx.beginPath();
      ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = '#FF8A8A';
      ctx.beginPath();
      ctx.arc(target.x - radius * 0.2, target.y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      if (isRunning && animateRef.current) {
        animationRef.current = requestAnimationFrame(animateRef.current);
      }
    };
  }, [isRunning, speed, getRandomPosition]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize target position
      const target = targetRef.current;
      if (target.x === 0 && target.y === 0) {
        target.x = canvas.width / 2;
        target.y = canvas.height / 2;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isRunning && animateRef.current) {
      lastMoveTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animateRef.current);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, speed, getRandomPosition]);

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
        <div className="max-w-xl mx-auto">
          {/* Instructions */}
          <p className="text-white/80 text-center text-sm mb-4">
            {t.instructions}
          </p>

          <div className="flex items-center justify-center gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixationTraining;
