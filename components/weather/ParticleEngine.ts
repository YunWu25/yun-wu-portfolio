/**
 * Core particle engine — manages spawn, update, render, and recycling
 * of all weather particles with object pooling.
 */
import { Particle, WeatherPreset, WindVector, CollisionRect, LightningBolt } from './types';
import { checkCollision, getCollisionRects } from './collisionDetection';

const MAX_PARTICLES = 4000;
const MAX_SPLASHES = 400;
const GLASS_STREAK_MAX = 100;

// Helpers
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Glass streak for rain-on-window effect */
interface GlassStreak {
  x: number;
  y: number;
  vy: number;
  length: number;
  opacity: number;
  width: number;
  life: number;
}

/** Snow accumulation on a surface */
interface SnowPile {
  rectId: string;
  points: number[]; // height at each x-pixel along the surface
  maxHeight: number;
}

export class ParticleEngine {
  private particles: Particle[] = [];
  private splashes: Particle[] = [];
  private glassStreaks: GlassStreak[] = [];
  private snowPiles: Map<string, SnowPile> = new Map();
  private lightning: LightningBolt | null = null;
  private lightningFlash = 0;
  private lightningTimer = 0;
  private time = 0;
  private sunRayAngle = 0;
  private currentWind: WindVector = { x: 0, y: 0, gustStrength: 0, gustFrequency: 0 };
  private targetWind: WindVector = { x: 0, y: 0, gustStrength: 0, gustFrequency: 0 };

  private w = 0;
  private h = 0;

  constructor() {
    // Pre-allocate pools
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push(this.deadParticle());
    }
    for (let i = 0; i < MAX_SPLASHES; i++) {
      this.splashes.push(this.deadParticle());
    }
  }

  private deadParticle(): Particle {
    return {
      x: 0, y: 0, vx: 0, vy: 0, size: 0, opacity: 0,
      depth: 0, life: 0, maxLife: 1, type: 'rain',
    };
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    // Reset snow piles on resize
    this.snowPiles.clear();
  }

  /** Update preset — wind transitions smoothly */
  applyPreset(preset: WeatherPreset) {
    this.targetWind = { ...preset.wind };

    // Activate correct number of particles
    const target = Math.min(preset.particleCount, MAX_PARTICLES);
    let active = 0;
    for (const p of this.particles) {
      if (p.life > 0) active++;
    }

    // Spawn new particles if needed
    if (active < target) {
      const toSpawn = target - active;
      let spawned = 0;
      for (const p of this.particles) {
        if (p.life <= 0 && spawned < toSpawn) {
          this.spawnParticle(p, preset);
          spawned++;
        }
      }
    }
  }

  private spawnParticle(p: Particle, preset: WeatherPreset) {
    const type = preset.particleTypes[Math.floor(Math.random() * preset.particleTypes.length)];
    if (!type) return;

    p.type = type;
    p.depth = rand(0.3, 1.0);
    p.size = rand(preset.size.min, preset.size.max) * p.depth;
    p.opacity = rand(0.3, 0.8) * p.depth;
    p.life = 1;
    p.maxLife = 1;

    const speed = rand(preset.speed.min, preset.speed.max) * p.depth;

    switch (type) {
      case 'rain': {
        p.x = rand(-50, this.w + 50);
        p.y = rand(-100, -10);
        p.vy = speed;
        p.vx = this.currentWind.x * speed * 0.5;
        p.length = rand(10, 25) * p.depth;
        break;
      }
      case 'snow': {
        p.x = rand(-50, this.w + 50);
        p.y = rand(-50, -10);
        p.vy = speed;
        p.vx = this.currentWind.x * 0.5;
        p.wobblePhase = rand(0, Math.PI * 2);
        p.wobbleSpeed = rand(0.02, 0.06);
        p.rotation = rand(0, Math.PI * 2);
        break;
      }
      case 'mist': {
        p.x = rand(-100, this.w + 100);
        p.y = rand(0, this.h);
        p.vx = rand(0.05, 0.2) * (this.currentWind.x > 0 ? 1 : -1);
        p.vy = rand(-0.05, 0.05);
        p.size = rand(preset.size.min, preset.size.max);
        p.opacity = rand(0.03, 0.08);
        break;
      }
      case 'dust': {
        p.x = rand(0, this.w);
        p.y = rand(0, this.h);
        p.vx = rand(-0.3, 0.3);
        p.vy = rand(-0.1, 0.2);
        p.opacity = rand(0.1, 0.25);
        break;
      }
      case 'debris': {
        p.x = -20;
        p.y = rand(this.h * 0.2, this.h * 0.8);
        p.vx = speed;
        p.vy = rand(-1, 1);
        p.rotation = 0;
        p.wobbleSpeed = rand(0.05, 0.15);
        p.wobblePhase = rand(0, Math.PI * 2);
        break;
      }
    }
  }

  private spawnSplash(x: number, y: number) {
    const count = Math.floor(rand(3, 6));
    let spawned = 0;
    for (const s of this.splashes) {
      if (s.life <= 0 && spawned < count) {
        s.type = 'splash';
        s.x = x;
        s.y = y;
        const angle = rand(-Math.PI * 0.8, -Math.PI * 0.2);
        const speed = rand(1.5, 4);
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed;
        s.size = rand(1, 2.5);
        s.opacity = rand(0.4, 0.7);
        s.life = 1;
        s.maxLife = 1;
        s.depth = 1;
        spawned++;
      }
    }
  }

  private spawnGlassStreak(x: number) {
    if (this.glassStreaks.length >= GLASS_STREAK_MAX) {
      // Recycle oldest
      const oldest = this.glassStreaks.reduce((a, b) => (a.life < b.life ? a : b));
      oldest.x = x;
      oldest.y = 0;
      oldest.vy = rand(0.3, 1.2);
      oldest.length = rand(20, 60);
      oldest.opacity = rand(0.1, 0.3);
      oldest.width = rand(1, 2.5);
      oldest.life = 1;
      return;
    }
    this.glassStreaks.push({
      x, y: 0, vy: rand(0.3, 1.2), length: rand(20, 60),
      opacity: rand(0.1, 0.3), width: rand(1, 2.5), life: 1,
    });
  }

  /** Generate lightning bolt using midpoint displacement */
  private generateLightning(): LightningBolt {
    const startX = rand(this.w * 0.2, this.w * 0.8);
    const startY = 0;
    const rects = getCollisionRects();
    // Find a target element or bottom of screen
    let endY = this.h * rand(0.5, 0.9);
    let endX = startX + rand(-100, 100);
    let hitPoint: { x: number; y: number } | null = null;

    // Try to hit a collision rect
    if (rects.length > 0 && Math.random() > 0.4) {
      const idx = Math.floor(Math.random() * rects.length);
      const target = rects[idx];
      if (target) {
        endX = rand(target.left, target.right);
        endY = target.top;
        hitPoint = { x: endX, y: endY };
      }
    }

    const segments = this.displaceMidpoint(startX, startY, endX, endY, 5);
    const branches: LightningBolt[] = [];

    // Add 1-3 branches
    const branchCount = Math.floor(rand(1, 4));
    for (let i = 0; i < branchCount; i++) {
      const seg = segments[Math.floor(rand(1, segments.length * 0.6))];
      if (seg) {
        const bEndX = seg.x2 + rand(-80, 80);
        const bEndY = seg.y2 + rand(40, 120);
        const bSegments = this.displaceMidpoint(seg.x2, seg.y2, bEndX, bEndY, 3);
        branches.push({
          segments: bSegments, branches: [], opacity: 0.6,
          life: 1, glowRadius: 8, hitPoint: null,
        });
      }
    }

    return {
      segments, branches, opacity: 1, life: 1,
      glowRadius: 20, hitPoint,
    };
  }

  private displaceMidpoint(
    x1: number, y1: number, x2: number, y2: number, depth: number
  ): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    if (depth === 0) {
      return [{ x1, y1, x2, y2 }];
    }
    const midX = (x1 + x2) / 2 + rand(-30, 30) * (depth / 5);
    const midY = (y1 + y2) / 2 + rand(-10, 10);
    return [
      ...this.displaceMidpoint(x1, y1, midX, midY, depth - 1),
      ...this.displaceMidpoint(midX, midY, x2, y2, depth - 1),
    ];
  }

  /** Main update tick */
  update(dt: number, preset: WeatherPreset) {
    this.time += dt;

    // Smooth wind transition (frame-rate independent: scale lerp factor by dt)
    const windLerp = 1 - Math.pow(0.98, dt * 60);
    this.currentWind.x = lerp(this.currentWind.x, this.targetWind.x, windLerp);
    this.currentWind.y = lerp(this.currentWind.y, this.targetWind.y, windLerp);
    const gust = Math.sin(this.time * this.targetWind.gustFrequency * 1000) * this.targetWind.gustStrength;
    const windX = this.currentWind.x + gust;
    const windY = this.currentWind.y + gust * 0.3;
    const rects = getCollisionRects();

    // Update particles
    for (const p of this.particles) {
      if (p.life <= 0) continue;

      const prevY = p.y;

      switch (p.type) {
        case 'rain': {
          p.vx = windX * p.vy * 0.3;
          p.x += p.vx * dt * 60;
          p.y += (p.vy + windY * p.vy) * dt * 60;

          // Only ~12% of drops collide with UI elements (rest pass through like a glass pane)
          const hitRect = checkCollision(p.x, p.y, prevY, rects);
          if (hitRect && Math.random() < 0.12) {
            this.spawnSplash(p.x, hitRect.top);
            // Some become glass-pane droplets that stick and stream down
            if (preset.glassStreaks && Math.random() < 0.5) {
              this.spawnGlassStreak(p.x);
            }
            p.life = 0;
            continue;
          }

          // Hit bottom of screen — splash
          if (p.y > this.h + 10) {
            if (Math.random() < 0.3) {
              this.spawnSplash(p.x, this.h);
            }
            p.life = 0;
          }
          // Off screen horizontally
          if (p.x < -100 || p.x > this.w + 100) {
            p.life = 0;
          }
          break;
        }
        case 'snow': {
          p.wobblePhase = (p.wobblePhase ?? 0) + (p.wobbleSpeed ?? 0.03);
          p.vx = windX * 0.5 + Math.sin(p.wobblePhase) * 0.8;
          p.x += p.vx * dt * 60;
          p.y += (p.vy + windY * p.vy) * dt * 60;
          p.rotation = (p.rotation ?? 0) + 0.01 * dt * 60;

          // Only ~15% of snowflakes collide/accumulate on UI (rest drift through)
          const snowHit = checkCollision(p.x, p.y, prevY, rects);
          if (snowHit && preset.hasAccumulation && Math.random() < 0.15) {
            this.addSnowAccumulation(snowHit, p.x);
            p.life = 0;
            continue;
          }

          if (p.y > this.h) {
            // Accumulate at bottom
            if (preset.hasAccumulation) {
              this.addSnowAccumulationBottom(p.x);
            }
            p.life = 0;
          }
          if (p.x < -100 || p.x > this.w + 100) p.life = 0;
          break;
        }
        case 'mist': {
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.life -= dt * 0.01;
          if (p.x < -300 || p.x > this.w + 300) p.life = 0;
          break;
        }
        case 'dust': {
          p.x += (p.vx + windX * 0.2) * dt * 60;
          p.y += p.vy * dt * 60;
          p.opacity = 0.15 + Math.sin(this.time * 2 + p.x * 0.01) * 0.1;
          if (p.x < -50 || p.x > this.w + 50 || p.y < -50 || p.y > this.h + 50) {
            p.life = 0;
          }
          break;
        }
        case 'debris': {
          p.wobblePhase = (p.wobblePhase ?? 0) + (p.wobbleSpeed ?? 0.08);
          p.vx += windX * 0.1;
          p.vy += Math.sin(p.wobblePhase) * 0.3;
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.rotation = (p.rotation ?? 0) + 0.1 * dt * 60;
          if (p.x > this.w + 50 || p.y < -50 || p.y > this.h + 50) {
            p.life = 0;
          }
          break;
        }
      }
    }

    // Update splashes
    for (const s of this.splashes) {
      if (s.life <= 0) continue;
      s.vy += 0.15 * dt * 60; // gravity
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      s.life -= dt * 1.5;
      s.opacity = s.life * 0.6;
    }

    // Update glass streaks
    for (const g of this.glassStreaks) {
      if (g.life <= 0) continue;
      g.y += g.vy * dt * 60;
      g.life -= dt * 0.15;
      g.opacity = g.life * 0.2;
      if (g.y > this.h) g.life = 0;
    }

    // Lightning logic
    if (preset.hasLightning) {
      this.lightningTimer += dt;
      const interval = rand(2, 6); // seconds between strikes
      if (this.lightningTimer > interval && !this.lightning) {
        this.lightning = this.generateLightning();
        this.lightningFlash = 1;
        this.lightningTimer = 0;
      }
      if (this.lightning) {
        this.lightning.life -= dt * 2;
        this.lightning.opacity = Math.max(0, this.lightning.life);
        this.lightningFlash = Math.max(0, this.lightningFlash - dt * 4);
        if (this.lightning.life <= 0) {
          this.lightning = null;
        }
      }
    } else {
      this.lightning = null;
      this.lightningFlash = 0;
    }

    // Sun ray animation
    if (preset.hasSunRays) {
      this.sunRayAngle = (this.sunRayAngle + dt * 0.3) % (Math.PI * 2);
    }

    // Respawn dead particles
    this.applyPreset(preset);

    // Decay snow piles slowly when not snowing
    if (!preset.hasAccumulation) {
      for (const [, pile] of this.snowPiles) {
        for (let i = 0; i < pile.points.length; i++) {
          const val = pile.points[i];
          if (val !== undefined) pile.points[i] = val * 0.998;
        }
      }
    }
  }

  private addSnowAccumulation(rect: CollisionRect, x: number) {
    const key = rect.id;
    if (!this.snowPiles.has(key)) {
      const w = Math.ceil(rect.width);
      this.snowPiles.set(key, {
        rectId: key,
        points: new Array<number>(w).fill(0),
        maxHeight: 15,
      });
    }
    const pile = this.snowPiles.get(key);
    if (!pile) return;
    const idx = Math.floor(x - rect.left);
    if (idx >= 0 && idx < pile.points.length) {
      pile.points[idx] = Math.min(pile.maxHeight, (pile.points[idx] ?? 0) + 0.3);
      if (idx > 0) pile.points[idx - 1] = Math.min(pile.maxHeight, (pile.points[idx - 1] ?? 0) + 0.1);
      if (idx < pile.points.length - 1) pile.points[idx + 1] = Math.min(pile.maxHeight, (pile.points[idx + 1] ?? 0) + 0.1);
    }
  }

  private addSnowAccumulationBottom(x: number) {
    const key = '__bottom__';
    if (!this.snowPiles.has(key)) {
      this.snowPiles.set(key, {
        rectId: key,
        points: new Array<number>(Math.ceil(this.w)).fill(0),
        maxHeight: 20,
      });
    }
    const pile = this.snowPiles.get(key);
    if (!pile) return;
    const idx = Math.floor(x);
    if (idx >= 0 && idx < pile.points.length) {
      pile.points[idx] = Math.min(pile.maxHeight, (pile.points[idx] ?? 0) + 0.2);
      if (idx > 0) pile.points[idx - 1] = Math.min(pile.maxHeight, (pile.points[idx - 1] ?? 0) + 0.08);
      if (idx < pile.points.length - 1) pile.points[idx + 1] = Math.min(pile.maxHeight, (pile.points[idx + 1] ?? 0) + 0.08);
    }
  }

  /** Render everything to canvas */
  render(ctx: CanvasRenderingContext2D, preset: WeatherPreset) {
    ctx.clearRect(0, 0, this.w, this.h);

    // Lightning flash (full-screen white flash)
    if (this.lightningFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.3})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    // Sun rays
    if (preset.hasSunRays) {
      this.renderSunRays(ctx);
    }

    // Particles
    for (const p of this.particles) {
      if (p.life <= 0) continue;
      this.renderParticle(ctx, p);
    }

    // Splashes
    for (const s of this.splashes) {
      if (s.life <= 0) continue;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 240, ${s.opacity})`;
      ctx.fill();
    }

    // Glass streaks — droplets stuck to the pane with trailing stream
    for (const g of this.glassStreaks) {
      if (g.life <= 0) continue;

      // Trailing stream (thinner, fading)
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x, g.y + g.length * 0.8);
      ctx.strokeStyle = `rgba(180, 210, 240, ${g.opacity * 0.5})`;
      ctx.lineWidth = g.width * 0.6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Droplet blob at the bottom (current position)
      const blobR = g.width * 1.8;
      const blobY = g.y + g.length;
      ctx.beginPath();
      ctx.arc(g.x, blobY, blobR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 240, ${g.opacity * 0.8})`;
      ctx.fill();

      // Highlight on droplet
      ctx.beginPath();
      ctx.arc(g.x - blobR * 0.3, blobY - blobR * 0.3, blobR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 245, 255, ${g.opacity * 0.6})`;
      ctx.fill();
    }

    // Snow accumulation
    this.renderSnowPiles(ctx);

    // Lightning bolts
    if (this.lightning) {
      this.renderLightningBolt(ctx, this.lightning);
    }
  }

  private renderParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    switch (p.type) {
      case 'rain': {
        // Render as a teardrop/elongated droplet falling at an angle
        const len = (p.length ?? 15) * 0.7;
        const angle = Math.atan2(p.vy, p.vx);
        const r = p.size * 0.6; // droplet head radius

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle - Math.PI / 2);

        // Teardrop: rounded bottom (head) tapering to a point at top (tail)
        ctx.beginPath();
        // Tail (top, thin)
        ctx.moveTo(0, -len);
        // Curve left to head
        ctx.quadraticCurveTo(-r * 1.2, -len * 0.3, -r, r * 0.3);
        // Round bottom head
        ctx.arc(0, r * 0.3, r, Math.PI, 0, false);
        // Curve right back to tail
        ctx.quadraticCurveTo(r * 1.2, -len * 0.3, 0, -len);
        ctx.closePath();

        // Semi-transparent water color with slight highlight
        const dropGrad = ctx.createLinearGradient(0, -len, 0, r);
        dropGrad.addColorStop(0, `rgba(140, 180, 220, ${p.opacity * 0.3})`);
        dropGrad.addColorStop(0.5, `rgba(160, 200, 235, ${p.opacity * 0.6})`);
        dropGrad.addColorStop(1, `rgba(180, 215, 245, ${p.opacity})`);
        ctx.fillStyle = dropGrad;
        ctx.fill();

        // Subtle highlight on the left side of the drop
        ctx.beginPath();
        ctx.arc(-r * 0.3, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${p.opacity * 0.4})`;
        ctx.fill();

        ctx.restore();
        break;
      }
      case 'snow': {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation ?? 0);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        // Radial gradient for soft snowflake
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
        grad.addColorStop(0.6, `rgba(230, 235, 245, ${p.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(220, 225, 240, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'mist': {
        const mg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        mg.addColorStop(0, `rgba(200, 205, 215, ${p.opacity})`);
        mg.addColorStop(1, `rgba(200, 205, 215, 0)`);
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'dust': {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
        ctx.fill();
        break;
      }
      case 'debris': {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation ?? 0);
        ctx.fillStyle = `rgba(120, 100, 80, ${p.opacity})`;
        ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        ctx.restore();
        break;
      }
    }
  }

  private renderSunRays(ctx: CanvasRenderingContext2D) {
    const cx = this.w * 0.85;
    const cy = -20;
    const rayCount = 12;
    const maxLen = Math.max(this.w, this.h) * 0.8;

    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < rayCount; i++) {
      const angle = this.sunRayAngle + (i / rayCount) * Math.PI * 2;
      const len = maxLen * (0.6 + Math.sin(this.time * 0.5 + i) * 0.4);
      const spread = 0.04;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - spread) * len, cy + Math.sin(angle - spread) * len);
      ctx.lineTo(cx + Math.cos(angle + spread) * len, cy + Math.sin(angle + spread) * len);
      ctx.closePath();

      const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      grad.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 220, 100, 0.3)');
      grad.addColorStop(1, 'rgba(255, 240, 150, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Lens flare
    ctx.beginPath();
    const flareGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    flareGrad.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
    flareGrad.addColorStop(0.5, 'rgba(255, 220, 150, 0.1)');
    flareGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = flareGrad;
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderSnowPiles(ctx: CanvasRenderingContext2D) {
    const rects = getCollisionRects();

    for (const [key, pile] of this.snowPiles) {
      const hasVisibleSnow = pile.points.some(h => h > 0.5);
      if (!hasVisibleSnow) continue;

      let baseY: number;
      let baseX: number;

      if (key === '__bottom__') {
        baseY = this.h;
        baseX = 0;
      } else {
        const rect = rects.find(r => r.id === key);
        if (!rect) continue;
        baseY = rect.top;
        baseX = rect.left;
      }

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);

      // Draw snow pile as smooth curve
      for (let i = 0; i < pile.points.length; i += 3) {
        const h = pile.points[i] ?? 0;
        ctx.lineTo(baseX + i, baseY - h);
      }
      ctx.lineTo(baseX + pile.points.length, baseY);
      ctx.closePath();

      ctx.fillStyle = 'rgba(240, 245, 255, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 210, 230, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  private renderLightningBolt(ctx: CanvasRenderingContext2D, bolt: LightningBolt) {
    ctx.save();
    ctx.globalAlpha = bolt.opacity;

    // Glow
    ctx.shadowColor = 'rgba(180, 200, 255, 0.8)';
    ctx.shadowBlur = bolt.glowRadius;
    ctx.strokeStyle = `rgba(220, 230, 255, ${bolt.opacity})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (const seg of bolt.segments) {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    }
    ctx.stroke();

    // Inner bright core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const seg of bolt.segments) {
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
    }
    ctx.stroke();

    // Branches
    for (const branch of bolt.branches) {
      ctx.strokeStyle = `rgba(200, 210, 255, ${branch.opacity * bolt.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (const seg of branch.segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
    }

    // Hit point glow
    if (bolt.hitPoint) {
      const hg = ctx.createRadialGradient(
        bolt.hitPoint.x, bolt.hitPoint.y, 0,
        bolt.hitPoint.x, bolt.hitPoint.y, 40
      );
      hg.addColorStop(0, `rgba(200, 220, 255, ${bolt.opacity * 0.6})`);
      hg.addColorStop(1, 'rgba(200, 220, 255, 0)');
      ctx.fillStyle = hg;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(bolt.hitPoint.x, bolt.hitPoint.y, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Get lightning flash intensity for external CSS effects */
  getLightningFlash(): number {
    return this.lightningFlash;
  }

  /** Get lightning hit point for reflection effects */
  getLightningHitPoint(): { x: number; y: number } | null {
    return this.lightning?.hitPoint ?? null;
  }
}
