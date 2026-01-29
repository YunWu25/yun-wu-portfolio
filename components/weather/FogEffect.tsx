import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWeather } from './WeatherContext';

const FogEffect: React.FC = () => {
  const { weather } = useWeather();
  const { viewport } = useThree();

  // Fog layer refs
  const layersRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Create multiple fog layers at different depths
  const fogLayers = useMemo(() => {
    return [
      { z: -3, opacity: 0.15, speed: 0.02, scale: 1.2 },
      { z: -2, opacity: 0.12, speed: 0.03, scale: 1.1 },
      { z: -1, opacity: 0.08, speed: 0.04, scale: 1.0 },
      { z: 0, opacity: 0.05, speed: 0.05, scale: 0.9 },
    ];
  }, []);

  // Fog shader material
  const createFogMaterial = useMemo(() => {
    return (baseOpacity: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: baseOpacity },
          intensity: { value: weather.intensity },
          color: { value: new THREE.Color(0xe8e8e8) },
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform float intensity;
        uniform vec3 color;
        varying vec2 vUv;

        // Simple noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));

          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * smoothNoise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          // Moving fog pattern
          vec2 uv = vUv * 3.0;
          uv.x += time * 0.1;

          float n = fbm(uv);

          // Edge fade
          float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
          edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

          float alpha = n * opacity * intensity * edgeFade;

          gl_FragColor = vec4(color, alpha);
        }
      `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
  }, [weather.intensity]);

  // Animation
  useFrame((_, delta) => {
    timeRef.current += delta;

    for (let i = 0; i < fogLayers.length; i++) {
      const layer = layersRef.current[i];
      const fogLayer = fogLayers[i];
      if (!layer || !fogLayer) continue;

      const mat = layer.material as THREE.ShaderMaterial;
      if (mat.uniforms.time && mat.uniforms.intensity) {
        mat.uniforms.time.value = timeRef.current * fogLayer.speed * 10;
        mat.uniforms.intensity.value = weather.intensity;
      }
    }
  });

  return (
    <group>
      {fogLayers.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) layersRef.current[i] = el;
          }}
          position={[0, 0, layer.z]}
        >
          <planeGeometry args={[viewport.width * layer.scale * 2, viewport.height * layer.scale * 2]} />
          <primitive object={createFogMaterial(layer.opacity)} attach="material" />
        </mesh>
      ))}
    </group>
  );
};

export default FogEffect;
