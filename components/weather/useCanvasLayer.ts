import { useEffect, useRef } from 'react';

interface CanvasFrameHelpers {
  w: number;
  h: number;
  /** #main-card's scrollTop — see the hook body for why that's the real scroll container */
  scrollOffset: number;
  prefersReducedMotion: boolean;
}

interface CanvasLayerOptions {
  /** Fires once at mount and again on every resize, before the next frame */
  onResize?: (w: number, h: number) => void;
  /** Fires once on unmount, after the RAF loop has stopped */
  onCleanup?: () => void;
}

/**
 * Shared lifecycle wiring for the weather system's full-viewport canvas
 * layers (WeatherSystem, NightCloudCanvas): DPR-aware resize, tracking
 * #main-card's scroll (the page scrolls inside that div, not window/document
 * — see WeatherSystem.tsx's original comment), and prefers-reduced-motion,
 * driving a requestAnimationFrame loop. Each layer still owns its own
 * drawing logic via `onFrame`; this hook only owns the DOM/lifecycle
 * plumbing both layers would otherwise duplicate.
 */
export function useCanvasLayer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onFrame: (ctx: CanvasRenderingContext2D, dt: number, helpers: CanvasFrameHelpers) => void,
  options: CanvasLayerOptions = {},
) {
  const rafRef = useRef<number>(0);
  const onFrameRef = useRef(onFrame);
  const optionsRef = useRef(options);

  useEffect(() => {
    onFrameRef.current = onFrame;
    optionsRef.current = options;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const size = { w: 0, h: 0 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = w;
      size.h = h;
      optionsRef.current.onResize?.(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const scrollContainer = document.getElementById('main-card');
    let scrollOffset = scrollContainer?.scrollTop ?? 0;
    const onScroll = () => {
      scrollOffset = scrollContainer?.scrollTop ?? 0;
    };
    scrollContainer?.addEventListener('scroll', onScroll, { passive: true });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    let lastTime = 0;
    const loop = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      onFrameRef.current(ctx, dt, { w: size.w, h: size.h, scrollOffset, prefersReducedMotion });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      scrollContainer?.removeEventListener('scroll', onScroll);
      motionQuery.removeEventListener('change', onMotionChange);
      optionsRef.current.onCleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onFrame/options are read via refs, kept fresh above
  }, [canvasRef]);
}
