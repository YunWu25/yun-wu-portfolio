import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

interface SnowEffectProps {
  count?: number;
}

interface ParticleData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  sizes: number[];
  phases: number[];
  wobbleSpeeds: number[];
}

function createParticles(count: number, bounds: { width: number; height: number; depth: number }): ParticleData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const sizes: number[] = [];
  const phases: number[] = [];
  const wobbleSpeeds: number[] = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * bounds.width,
        (Math.random() - 0.5) * bounds.height + bounds.height / 2,
        (Math.random() - 0.5) * bounds.depth
      )
    );
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        -0.02 - Math.random() * 0.02,
        0
      )
    );
    sizes.push(0.02 + Math.random() * 0.04);
    phases.push(Math.random() * Math.PI * 2);
    wobbleSpeeds.push(1 + Math.random() * 2);
  }

  return { positions, velocities, sizes, phases, wobbleSpeeds };
}

const SnowEffect: React.FC<SnowEffectProps> = ({ count = 2000 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { weather } = useWeather();
  const { viewport } = useThree();

  const bounds = useMemo(() => {
    const width = viewport.width * 1.5;
    const height = viewport.height * 1.5;
    return { width, height, depth: 10 };
  }, [viewport]);

  const particlesRef = useRef<ParticleData | null>(null);

  useEffect(() => {
    particlesRef.current = createParticles(count, bounds);
  }, [count, bounds]);

  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(0.02, 6, 6);
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  const timeRef = useRef(0);

  // PERFORMANCE: Reusable objects to avoid GC pressure
  const reusable = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
  });

  useFrame((_, delta) => {
    if (!meshRef.current || !particlesRef.current) return;

    timeRef.current += delta;
    const mesh = meshRef.current;
    const particles = particlesRef.current;
    const { matrix, position, quaternion, scale } = reusable.current;

    const windX = weather.windDirection.x * 0.15;

    for (let i = 0; i < count; i++) {
      const pos = particles.positions[i];
      const vel = particles.velocities[i];
      const size = particles.sizes[i];
      const phase = particles.phases[i];
      const wobbleSpeed = particles.wobbleSpeeds[i];

      if (!pos || !vel || size === undefined || phase === undefined || wobbleSpeed === undefined) continue;

      const wobble = Math.sin(timeRef.current * wobbleSpeed + phase) * 0.02;

      pos.x += (vel.x + windX + wobble) * delta * 60 * weather.intensity;
      pos.y += vel.y * delta * 60 * weather.intensity;

      if (pos.y < -bounds.height / 2) {
        pos.y = bounds.height / 2 + Math.random() * 2;
        pos.x = (Math.random() - 0.5) * bounds.width;
      }

      if (pos.x > bounds.width / 2) pos.x = -bounds.width / 2;
      if (pos.x < -bounds.width / 2) pos.x = bounds.width / 2;

      position.copy(pos);
      scale.set(size, size, size);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
};

export default SnowEffect;
