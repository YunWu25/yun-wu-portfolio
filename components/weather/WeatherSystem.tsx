import React, { useRef, useEffect, useCallback } from 'react';
import { useWeather } from './WeatherContext';
import { ParticleEngine } from './ParticleEngine';
import { getScaledPreset } from './weatherPresets';
import { invalidateCollisionCache } from './collisionDetection';

const WeatherSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const { weather } = useWeather();
  const weatherRef = useRef(weather);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Lightning reflection — apply/remove glow on content container
  const applyLightningReflection = useCallback((flash: number, hitPoint: { x: number; y: number } | null) => {
    const container = document.getElementById('content-container');
    if (!container) return;

    if (flash > 0.1) {
      const intensity = Math.round(flash * 20);
      container.style.boxShadow = `0 0 ${intensity}px ${Math.round(intensity * 0.5)}px rgba(180, 200, 255, ${flash * 0.3})`;
    } else {
      container.style.boxShadow = '';
    }

    // Apply glow near hit point
    const header = document.getElementById('main-card-header');
    if (hitPoint && flash > 0.1 && header) {
      header.style.boxShadow = `0 0 ${Math.round(flash * 15)}px rgba(180, 200, 255, ${flash * 0.2})`;
    } else if (header) {
      header.style.boxShadow = '';
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const engine = new ParticleEngine();
    engineRef.current = engine;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(w, h);
      invalidateCollisionCache();
    };

    resize();
    window.addEventListener('resize', resize);

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const w = weatherRef.current;
      if (w.enabled && !prefersReducedMotion) {
        const preset = getScaledPreset(w.type, w.intensity);
        engine.update(dt, preset);
        engine.render(ctx, preset);

        // Lightning CSS reflection effects
        const flash = engine.getLightningFlash();
        const hitPoint = engine.getLightningHitPoint();
        applyLightningReflection(flash, hitPoint);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyLightningReflection(0, null);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      applyLightningReflection(0, null);
    };
  }, [applyLightningReflection]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default WeatherSystem;
