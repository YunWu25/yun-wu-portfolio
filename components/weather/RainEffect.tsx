import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

interface RainEffectProps {
  count?: number;
}

interface ParticleData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  lengths: number[];
  opacities: number[];
}

interface SplashData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  lifetimes: number[];
  maxLifetimes: number[];
}

// Initialize rain particles outside React render cycle
function createParticles(
  count: number,
  bounds: { width: number; height: number; depth: number }
): ParticleData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const lengths: number[] = [];
  const opacities: number[] = [];

  for (let i = 0; i < count; i++) {
    // Depth-based layering: some drops closer (larger), some further (smaller)
    const depth = (Math.random() - 0.5) * bounds.depth;
    const depthFactor = 1 - Math.abs(depth) / bounds.depth; // 0-1, closer = higher

    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * bounds.width,
        Math.random() * bounds.height * 1.5 - bounds.height * 0.25,
        depth
      )
    );

    // Faster falling speed, slight angle variation
    const baseSpeed = -0.35 - Math.random() * 0.15;
    const horizontalDrift = (Math.random() - 0.5) * 0.03;

    velocities.push(new THREE.Vector3(horizontalDrift, baseSpeed, 0));

    // Longer streaks for motion blur effect, varied by depth
    lengths.push((0.15 + Math.random() * 0.25) * (0.5 + depthFactor * 0.5));

    // Varied opacity based on depth (closer = more visible)
    opacities.push(0.4 + depthFactor * 0.4);
  }

  return { positions, velocities, lengths, opacities };
}

// Initialize splash particles
function createSplashes(count: number): SplashData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const lifetimes: number[] = [];
  const maxLifetimes: number[] = [];

  for (let i = 0; i < count; i++) {
    positions.push(new THREE.Vector3(0, -1000, 0)); // Start off-screen
    velocities.push(new THREE.Vector3(0, 0, 0));
    lifetimes.push(0);
    maxLifetimes.push(0.3 + Math.random() * 0.2);
  }

  return { positions, velocities, lifetimes, maxLifetimes };
}

const RainEffect: React.FC<RainEffectProps> = ({ count = 4000 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const splashMeshRef = useRef<THREE.InstancedMesh>(null);
  const { weather } = useWeather();
  const { viewport } = useThree();

  // Calculate bounds based on viewport
  const bounds = useMemo(() => {
    const width = viewport.width * 2;
    const height = viewport.height * 2;
    return { width, height, depth: 8 };
  }, [viewport]);

  // Store particle data in ref (mutable)
  const particlesRef = useRef<ParticleData | null>(null);
  const splashCount = 200;
  const splashesRef = useRef<SplashData | null>(null);
  const nextSplashIndex = useRef(0);

  // PERFORMANCE: Reusable objects to avoid GC pressure
  const reusable = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    scale: new THREE.Vector3(1, 1, 1),
    tiltQuaternion: new THREE.Quaternion(),
    zAxis: new THREE.Vector3(0, 0, 1),
    // Splash objects
    splashMatrix: new THREE.Matrix4(),
    splashPos: new THREE.Vector3(),
    splashQuat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
    splashScale: new THREE.Vector3(),
  });
  const lastWindX = useRef(0);

  // Initialize particles on mount or when bounds change
  useEffect(() => {
    particlesRef.current = createParticles(count, bounds);
    splashesRef.current = createSplashes(splashCount);
  }, [count, bounds]);

  // Create the raindrop geometry - thicker, elongated for visibility
  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(0.008, 0.2, 0.008);
  }, []);

  // Create material - brighter, more visible
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xb8d4e8,
      transparent: true,
      opacity: 0.75,
    });
  }, []);

  // Splash geometry - small circles
  const splashGeometry = useMemo(() => {
    return new THREE.CircleGeometry(0.02, 6);
  }, []);

  const splashMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xc8e0f0,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
  }, []);

  // Animation loop
  useFrame((_, delta) => {
    if (!meshRef.current || !particlesRef.current) return;

    const mesh = meshRef.current;
    const particles = particlesRef.current;
    const { matrix, position, scale, tiltQuaternion, zAxis } = reusable.current;

    // Wind influence - more pronounced
    const windX = weather.windDirection.x * 0.2;

    // PERFORMANCE: Only recalculate tilt when wind changes significantly
    if (Math.abs(windX - lastWindX.current) > 0.001) {
      const tiltAngle = Math.atan2(windX, 0.35) * 0.5;
      tiltQuaternion.setFromAxisAngle(zAxis, tiltAngle);
      lastWindX.current = windX;
    }

    const bottomY = -bounds.height / 2;

    for (let i = 0; i < count; i++) {
      const pos = particles.positions[i];
      const vel = particles.velocities[i];
      const length = particles.lengths[i];

      if (!pos || !vel || length === undefined) continue;

      // Update position with wind
      pos.x += (vel.x + windX) * delta * 60 * weather.intensity;
      pos.y += vel.y * delta * 60 * weather.intensity;

      // Reset if below screen - spawn splash
      if (pos.y < bottomY) {
        // Trigger splash effect
        if (splashesRef.current && Math.random() < 0.3) {
          const splashIdx = nextSplashIndex.current % splashCount;
          const splash = splashesRef.current;
          splash.positions[splashIdx]?.set(pos.x, bottomY + 0.1, pos.z);
          splash.velocities[splashIdx]?.set(
            (Math.random() - 0.5) * 0.1,
            0.05 + Math.random() * 0.05,
            0
          );
          splash.lifetimes[splashIdx] = 0;
          nextSplashIndex.current++;
        }

        pos.y = bounds.height / 2 + Math.random() * 2;
        pos.x = (Math.random() - 0.5) * bounds.width;
      }

      // Wrap horizontally
      if (pos.x > bounds.width / 2) pos.x = -bounds.width / 2;
      if (pos.x < -bounds.width / 2) pos.x = bounds.width / 2;

      position.copy(pos);
      scale.set(1, length, 1);
      matrix.compose(position, tiltQuaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Update splashes using reusable objects
    if (splashMeshRef.current && splashesRef.current) {
      const splashMesh = splashMeshRef.current;
      const splashes = splashesRef.current;
      const { splashMatrix, splashPos, splashQuat, splashScale } = reusable.current;

      for (let i = 0; i < splashCount; i++) {
        const pos = splashes.positions[i];
        const vel = splashes.velocities[i];
        const maxLife = splashes.maxLifetimes[i];
        const currentLife = splashes.lifetimes[i];

        if (!pos || !vel || maxLife === undefined || currentLife === undefined) continue;

        const newLife = currentLife + delta;
        splashes.lifetimes[i] = newLife;

        if (newLife < maxLife) {
          // Animate splash
          pos.x += vel.x * delta * 60;
          pos.y += vel.y * delta * 60;
          vel.y -= 0.003; // Gravity

          const progress = newLife / maxLife;
          const size = (1 - progress) * (0.5 + Math.random() * 0.5);

          splashPos.copy(pos);
          splashScale.set(size, size, size);
          splashMatrix.compose(splashPos, splashQuat, splashScale);
        } else {
          // Hide off-screen
          splashPos.set(0, -1000, 0);
          splashScale.set(0, 0, 0);
          splashMatrix.compose(splashPos, splashQuat, splashScale);
        }

        splashMesh.setMatrixAt(i, splashMatrix);
      }
      splashMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Main rain drops */}
      <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
      {/* Splash particles */}
      <instancedMesh
        ref={splashMeshRef}
        args={[splashGeometry, splashMaterial, splashCount]}
        frustumCulled={false}
      />
    </group>
  );
};

export default RainEffect;
