import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

interface RayData {
  angle: number;
  length: number;
  width: number;
  speed: number;
}

function createRays(rayCount: number): RayData[] {
  const rayData: RayData[] = [];
  for (let i = 0; i < rayCount; i++) {
    rayData.push({
      angle: (i / rayCount) * Math.PI * 2 + Math.random() * 0.2,
      length: 3 + Math.random() * 4,
      width: 0.1 + Math.random() * 0.15,
      speed: 0.2 + Math.random() * 0.3,
    });
  }
  return rayData;
}

interface DustParticleData {
  positions: THREE.Vector3[];
  velocities: THREE.Vector3[];
  sizes: number[];
}

function createDustParticles(count: number, bounds: { width: number; height: number }): DustParticleData {
  const positions: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];
  const sizes: number[] = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * bounds.width,
        (Math.random() - 0.5) * bounds.height,
        Math.random() * 2
      )
    );
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        0
      )
    );
    sizes.push(0.01 + Math.random() * 0.02);
  }

  return { positions, velocities, sizes };
}

const SunEffect: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Mesh[]>([]);
  const { weather } = useWeather();
  const { viewport } = useThree();

  const sunPosition = useMemo(() => {
    return new THREE.Vector3(viewport.width * 0.4, viewport.height * 0.4, -2);
  }, [viewport]);

  const rayCount = 12;

  // Use useState to store rays data so it's available for rendering
  const [rays] = React.useState<RayData[]>(() => createRays(rayCount));

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;

    // Update glow material through mesh ref
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms.time && mat.uniforms.intensity) {
        mat.uniforms.time.value = timeRef.current;
        mat.uniforms.intensity.value = weather.intensity;
      }
    }

    // Update rays
    for (let i = 0; i < rays.length; i++) {
      const ray = raysRef.current[i];
      const rayData = rays[i];
      if (!ray || !rayData) continue;

      ray.rotation.z = rayData.angle + Math.sin(timeRef.current * rayData.speed) * 0.1;
      const mat = ray.material as THREE.MeshBasicMaterial;
      mat.opacity = (0.1 + Math.sin(timeRef.current * rayData.speed + i) * 0.05) * weather.intensity;
    }
  });

  return (
    <group ref={groupRef} position={sunPosition}>
      <mesh ref={glowMeshRef}>
        <planeGeometry args={[4, 4]} />
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            intensity: { value: weather.intensity },
            color: { value: new THREE.Color(0xfff5e6) },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform float intensity;
            uniform vec3 color;
            varying vec2 vUv;

            void main() {
              vec2 center = vec2(0.5, 0.5);
              float dist = distance(vUv, center);
              float pulse = 1.0 + sin(time * 0.5) * 0.1;
              float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * intensity * pulse * 0.6;
              gl_FragColor = vec4(color, alpha);
            }
          `}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {rays.map((ray, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) raysRef.current[i] = el;
          }}
          rotation={[0, 0, ray.angle]}
          position={[0, ray.length / 2, 0.1]}
        >
          <planeGeometry args={[ray.width, ray.length]} />
          <meshBasicMaterial
            color={0xfffaed}
            transparent={true}
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <SunDust count={100} bounds={{ width: 6, height: 6 }} intensity={weather.intensity} />
    </group>
  );
};

interface SunDustProps {
  count: number;
  bounds: { width: number; height: number };
  intensity: number;
}

const SunDust: React.FC<SunDustProps> = ({ count, bounds, intensity }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<DustParticleData | null>(null);

  useEffect(() => {
    particlesRef.current = createDustParticles(count, bounds);
  }, [count, bounds]);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.01, 4, 4), []);

  // PERFORMANCE: Reusable objects to avoid GC pressure
  const reusable = useRef({
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(),
  });

  useFrame((_, delta) => {
    if (!meshRef.current || !particlesRef.current) return;

    const mesh = meshRef.current;
    const particles = particlesRef.current;
    const { matrix, position, quaternion, scale } = reusable.current;

    for (let i = 0; i < count; i++) {
      const pos = particles.positions[i];
      const vel = particles.velocities[i];
      const size = particles.sizes[i];

      if (!pos || !vel || size === undefined) continue;

      pos.x += vel.x * delta * 60;
      pos.y += vel.y * delta * 60;

      if (Math.abs(pos.x) > bounds.width / 2) vel.x *= -1;
      if (Math.abs(pos.y) > bounds.height / 2) vel.y *= -1;

      position.copy(pos);
      scale.set(size, size, size);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.4 * intensity;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial color={0xffffee} transparent={true} opacity={0.4} />
    </instancedMesh>
  );
};

export default SunEffect;
