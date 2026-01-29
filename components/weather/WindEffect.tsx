import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

interface WindEffectProps {
  count?: number;
}

interface StreakData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  lengths: number[];
  opacities: number[];
}

interface LeafData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  rotations: number[];
  rotationSpeeds: number[];
}

function createStreaks(count: number, bounds: { width: number; height: number; depth: number }): StreakData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const lengths: number[] = [];
  const opacities: number[] = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * bounds.width,
        (Math.random() - 0.5) * bounds.height,
        (Math.random() - 0.5) * bounds.depth
      )
    );
    velocities.push(
      new THREE.Vector3(
        0.3 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.05,
        0
      )
    );
    lengths.push(0.1 + Math.random() * 0.3);
    opacities.push(0.1 + Math.random() * 0.2);
  }

  return { positions, velocities, lengths, opacities };
}

function createLeaves(leafCount: number, bounds: { width: number; height: number }): LeafData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const rotations: number[] = [];
  const rotationSpeeds: number[] = [];

  for (let i = 0; i < leafCount; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * bounds.width,
        (Math.random() - 0.5) * bounds.height,
        (Math.random() - 0.5) * 5
      )
    );
    velocities.push(
      new THREE.Vector3(
        0.15 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.1,
        0
      )
    );
    rotations.push(Math.random() * Math.PI * 2);
    rotationSpeeds.push((Math.random() - 0.5) * 5);
  }

  return { positions, velocities, rotations, rotationSpeeds };
}

const WindEffect: React.FC<WindEffectProps> = ({ count = 150 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const { weather } = useWeather();
  const { viewport } = useThree();

  const bounds = useMemo(() => {
    const width = viewport.width * 1.5;
    const height = viewport.height * 1.5;
    return { width, height, depth: 10 };
  }, [viewport]);

  const streaksRef = useRef<StreakData | null>(null);
  const leafCount = 30;
  const leavesDataRef = useRef<LeafData | null>(null);

  useEffect(() => {
    streaksRef.current = createStreaks(count, bounds);
    leavesDataRef.current = createLeaves(leafCount, bounds);
  }, [count, bounds]);

  const streakGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(0.3, 0.01);
  }, []);

  const streakMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.03);
    shape.lineTo(0.015, 0);
    shape.lineTo(0, -0.03);
    shape.lineTo(-0.015, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, []);

  const leafMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x8b7355,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
  }, []);

  // PERFORMANCE: Reusable objects to avoid GC pressure
  const reusable = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
    euler: new THREE.Euler(),
  });

  useFrame((_, delta) => {
    if (!meshRef.current || !leavesRef.current || !streaksRef.current || !leavesDataRef.current) return;

    const mesh = meshRef.current;
    const leavesMesh = leavesRef.current;
    const streaks = streaksRef.current;
    const leavesData = leavesDataRef.current;
    const { matrix, position, quaternion, scale, euler } = reusable.current;

    const windMultiplier = Math.max(0.5, Math.abs(weather.windDirection.x) + 0.5);

    // Update streaks
    for (let i = 0; i < count; i++) {
      const pos = streaks.positions[i];
      const vel = streaks.velocities[i];
      const length = streaks.lengths[i];

      if (!pos || !vel || length === undefined) continue;

      pos.x += vel.x * delta * 60 * weather.intensity * windMultiplier;
      pos.y += vel.y * delta * 60 * weather.intensity;

      if (pos.x > bounds.width / 2) {
        pos.x = -bounds.width / 2;
        pos.y = (Math.random() - 0.5) * bounds.height;
      }

      position.copy(pos);
      scale.set(length * windMultiplier, 1, 1);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Update leaves
    for (let i = 0; i < leafCount; i++) {
      const pos = leavesData.positions[i];
      const vel = leavesData.velocities[i];
      const rotSpeed = leavesData.rotationSpeeds[i];
      const currentRotation = leavesData.rotations[i];

      if (!pos || !vel || rotSpeed === undefined || currentRotation === undefined) continue;

      const newRotation = currentRotation + rotSpeed * delta * weather.intensity;
      leavesData.rotations[i] = newRotation;

      const tumble = Math.sin(newRotation) * 0.02;

      pos.x += vel.x * delta * 60 * weather.intensity * windMultiplier;
      pos.y += (vel.y + tumble) * delta * 60 * weather.intensity;

      if (pos.x > bounds.width / 2) {
        pos.x = -bounds.width / 2;
        pos.y = (Math.random() - 0.5) * bounds.height;
      }

      position.copy(pos);
      euler.set(0, 0, newRotation);
      quaternion.setFromEuler(euler);
      scale.set(1, 1, 1);
      matrix.compose(position, quaternion, scale);
      leavesMesh.setMatrixAt(i, matrix);
    }
    leavesMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[streakGeometry, streakMaterial, count]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={leavesRef}
        args={[leafGeometry, leafMaterial, leafCount]}
        frustumCulled={false}
      />
    </group>
  );
};

export default WindEffect;
