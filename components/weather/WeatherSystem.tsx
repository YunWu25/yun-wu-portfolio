import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useWeather } from './WeatherContext';
import { ParticleEngine } from './ParticleEngine';
import { getScaledPreset } from './weatherPresets';
import { invalidateCollisionCache } from './collisionDetection';
import { useCanvasLayer } from './useCanvasLayer';

const WeatherSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { weather } = useWeather();
  const weatherRef = useRef(weather);
  const [engine] = useState(() => new ParticleEngine());

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  const applyLightningReflection = useCallback((flash: number, hitPoint: { x: number; y: number } | null) => {
    const container = document.getElementById('content-container');
    if (!container) return;

    if (flash > 0.1) {
      const intensity = Math.round(flash * 20);
      container.style.boxShadow = `0 0 ${intensity}px ${Math.round(intensity * 0.5)}px rgba(180, 200, 255, ${flash * 0.3})`;
    } else {
      container.style.boxShadow = '';
    }

    const header = document.getElementById('main-card-header');
    if (hitPoint && flash > 0.1 && header) {
      header.style.boxShadow = `0 0 ${Math.round(flash * 15)}px rgba(180, 200, 255, ${flash * 0.2})`;
    } else if (header) {
      header.style.boxShadow = '';
    }
  }, []);

  useCanvasLayer(
    canvasRef,
    (ctx, dt, { w, h, scrollOffset, prefersReducedMotion }) => {
      const weatherNow = weatherRef.current;

      if (weatherNow.enabled && !prefersReducedMotion) {
        const preset = getScaledPreset(weatherNow.type, weatherNow.intensity);
        const isNight = !weatherNow.isDay;
        engine.update(dt, preset, isNight);
        engine.render(ctx, preset, isNight, scrollOffset);

        const flash = engine.getLightningFlash();
        const hitPoint = engine.getLightningHitPoint();
        applyLightningReflection(flash, hitPoint);
      } else {
        ctx.clearRect(0, 0, w, h);
        applyLightningReflection(0, null);
      }
    },
    {
      onResize: (w, h) => {
        engine.resize(w, h);
        invalidateCollisionCache();
      },
      onCleanup: () => {
        applyLightningReflection(0, null);
      },
    },
  );

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default WeatherSystem;
