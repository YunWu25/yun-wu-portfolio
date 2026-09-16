import React, { useRef, useEffect } from 'react';
import { useWeather } from './WeatherContext';
import { WeatherType } from './types';
import { isFullMoon } from './moonPhase';
import { useCanvasLayer } from './useCanvasLayer';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Must match the `r` used in ParticleEngine's renderMoon */
const MOON_RADIUS = 34;

interface CloudParticle {
  baseX: number;
  baseY: number;
  radius: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  rangeX: number;
  rangeY: number;
}

/**
 * Dedicated canvas for the "dark cloud" night atmosphere (regular, non-full-moon
 * nights). Rendered as its own layer — rather than baked into the main weather
 * canvas — so a CSS-level blur + multiply blend can be applied to the whole
 * composite. That reads as one soft, unified ink-wash wherever clouds overlap
 * each other or the moon, instead of visible seams between separately blurred
 * shapes; multiply also keeps page text crisp underneath since it can only
 * darken, never wash out, already-dark pixels.
 *
 * Each cloud drifts smoothly around a fixed anchor (sine-wave offset) rather
 * than sweeping across the screen and recycling — that recycle jump reads as
 * a visible flicker once the cluster is this small, so a bounded, continuous
 * wobble is used instead.
 */
const NightCloudCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { weather } = useWeather();
  const weatherRef = useRef(weather);
  const cloudsRef = useRef<CloudParticle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useCanvasLayer(
    canvasRef,
    (ctx, dt, { w, h, scrollOffset, prefersReducedMotion }) => {
      timeRef.current += dt;

      const w0 = weatherRef.current;
      const active =
        w0.enabled &&
        !w0.isDay &&
        w0.type === WeatherType.CLEAR &&
        !isFullMoon(new Date()) &&
        !prefersReducedMotion;

      ctx.clearRect(0, 0, w, h);

      if (active) {
        const time = timeRef.current;
        for (const c of cloudsRef.current) {
          const x = c.baseX + Math.sin(time * c.speedX + c.phaseX) * c.rangeX;
          const y = c.baseY + Math.sin(time * c.speedY + c.phaseY) * c.rangeY - scrollOffset;

          const grad = ctx.createRadialGradient(x, y, 0, x, y, c.radius);
          grad.addColorStop(0, 'rgba(120, 102, 106, 0.8)');
          grad.addColorStop(0.2, 'rgba(168, 150, 155, 0.6)');
          grad.addColorStop(0.5, 'rgba(255, 90, 102, 0.4)');
          grad.addColorStop(0.7, 'rgba(255, 138, 149, 0.15)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, c.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      onResize: (w, h) => {
        // Cluster huddled beside the moon (same spot ParticleEngine draws it),
        // sized relative to the moon itself — roughly a 2x-moon-wide huddle —
        // rather than a viewport-relative patch. Offset left of the moon's own
        // anchor so it doesn't crowd the email/Instagram/LinkedIn icon column,
        // and kept high (flattened, small vertical spread) so it never dips
        // down onto the content card below.
        const cx = w * 0.82;
        const cy = h * 0.14;
        const spread = MOON_RADIUS * 1.4;

        const count = 5;
        cloudsRef.current = [];
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const dist = rand(0.3, 1) * spread;
          cloudsRef.current.push({
            baseX: cx + Math.cos(angle) * dist,
            baseY: cy + Math.sin(angle) * dist * 0.4,
            radius: rand(12, 24),
            phaseX: rand(0, Math.PI * 2),
            phaseY: rand(0, Math.PI * 2),
            speedX: rand(0.05, 0.1),
            speedY: rand(0.04, 0.09),
            rangeX: rand(6, 14),
            rangeY: rand(4, 9),
          });
        }
      },
    },
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ filter: 'blur(12px)', mixBlendMode: 'multiply', opacity: 0.6 }}
    />
  );
};

export default NightCloudCanvas;
