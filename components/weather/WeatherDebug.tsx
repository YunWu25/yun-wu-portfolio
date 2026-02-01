import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

/**
 * WeatherDebug - Overlay for debugging weather effects
 *
 * Shows:
 * - FPS counter
 * - Current weather type & intensity
 * - Mouse position (normalized + world coords)
 * - Mouse speed
 * - Particle counts
 * - Visual mouse cursor in 3D space
 */

// 3D Mouse indicator component
const MouseIndicator: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { weather } = useWeather();
  const { viewport } = useThree();

  useFrame(() => {
    if (!meshRef.current || !ringRef.current) return;

    // Convert normalized mouse to world position
    const worldX = weather.mouse.position.x * (viewport.width / 2);
    const worldY = weather.mouse.position.y * (viewport.height / 2);

    meshRef.current.position.set(worldX, worldY, 1);
    ringRef.current.position.set(worldX, worldY, 1);

    // Scale ring based on mouse speed
    const ringScale = 1.5 + weather.mouse.speed * 2;
    ringRef.current.scale.set(ringScale, ringScale, 1);
  });

  return (
    <group>
      {/* Center dot */}
      <mesh ref={meshRef}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color={0xff0000} transparent opacity={0.8} />
      </mesh>
      {/* Interaction radius ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.4, 1.5, 32]} />
        <meshBasicMaterial color={0xff0000} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Debug info overlay (DOM-based)
export const WeatherDebugOverlay: React.FC = () => {
  const { weather } = useWeather();
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    let animationId: number;
    lastTime.current = performance.now();

    const updateFPS = () => {
      frameCount.current++;
      const now = performance.now();

      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getParticleCount = () => {
    switch (weather.type) {
      case 'rain':
        return { main: 4000, splash: 200 };
      case 'snow':
        return { main: 2000, splash: 0 };
      case 'sunny':
        return { main: 100, splash: 0 }; // dust particles
      case 'windy':
        return { main: 180, splash: 0 }; // streaks + leaves
      case 'foggy':
        return { main: 0, splash: 0 }; // shader-based
      default:
        return { main: 0, splash: 0 };
    }
  };

  const particles = getParticleCount();
  const fpsColor = fps >= 55 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171';

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 12,
        zIndex: 10000,
        pointerEvents: 'none',
        minWidth: 220,
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#60a5fa' }}>
        Weather Debug
      </div>

      {/* FPS */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>FPS: </span>
        <span style={{ color: fpsColor, fontWeight: 'bold' }}>{fps}</span>
      </div>

      {/* Weather Type */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>Type: </span>
        <span style={{ color: '#fbbf24', textTransform: 'uppercase' }}>
          {weather.type}
        </span>
        <span style={{ color: '#9ca3af' }}> ({weather.enabled ? 'ON' : 'OFF'})</span>
      </div>

      {/* Intensity */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>Intensity: </span>
        <span>{(weather.intensity * 100).toFixed(0)}%</span>
        <div
          style={{
            width: '100%',
            height: 4,
            background: '#374151',
            borderRadius: 2,
            marginTop: 2,
          }}
        >
          <div
            style={{
              width: `${weather.intensity * 100}%`,
              height: '100%',
              background: '#60a5fa',
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Particles */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>Particles: </span>
        <span>{particles.main}</span>
        {particles.splash > 0 && (
          <span style={{ color: '#9ca3af' }}> (+{particles.splash} splash)</span>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '8px 0' }} />

      {/* Mouse Position */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#9ca3af' }}>Mouse (normalized): </span>
        <span>
          ({weather.mouse.position.x.toFixed(2)}, {weather.mouse.position.y.toFixed(2)})
        </span>
      </div>

      {/* Mouse Velocity */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#9ca3af' }}>Mouse velocity: </span>
        <span>
          ({weather.mouse.velocity.x.toFixed(2)}, {weather.mouse.velocity.y.toFixed(2)})
        </span>
      </div>

      {/* Mouse Speed */}
      <div>
        <span style={{ color: '#9ca3af' }}>Mouse speed: </span>
        <span style={{ color: weather.mouse.speed > 0.5 ? '#4ade80' : '#9ca3af' }}>
          {weather.mouse.speed.toFixed(3)}
        </span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '8px 0' }} />

      <div style={{ fontSize: 10, color: '#6b7280' }}>
        Red circle = mouse interaction radius
      </div>
    </div>
  );
};

// 3D debug elements (render inside Canvas)
export const WeatherDebug3D: React.FC = () => {
  // FPS is shown in the DOM overlay, this component just renders 3D debug elements
  return (
    <group>
      <MouseIndicator />
    </group>
  );
};

export default WeatherDebugOverlay;
