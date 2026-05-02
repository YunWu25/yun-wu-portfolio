import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TYPOGRAPHY, COLORS } from '../styles';
import { Language } from '../App';

// Factory function to create tapered tube geometry
function createTaperedTubeGeometry(
  start: [number, number, number],
  end: [number, number, number]
): THREE.TubeGeometry {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const curve = new THREE.LineCurve3(startVec, endVec);

  const tubularSegments = 20;
  const radiusSegments = 6;

  const geometry = new THREE.TubeGeometry(curve, tubularSegments, 0.02, radiusSegments, false);

  // Modify radius to taper from thick to thin
  const positions = geometry.attributes.position as THREE.BufferAttribute | undefined;
  if (positions) {
    for (let i = 0; i < positions.count; i++) {
      const t = Math.floor(i / radiusSegments) / tubularSegments;
      const scale = 1 - t * 0.7; // 100% at start, 30% at end
      const pos = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
      const center = curve.getPoint(t);
      const direction = pos.clone().sub(center);
      direction.multiplyScalar(scale);
      positions.setXYZ(i, center.x + direction.x, center.y + direction.y, center.z + direction.z);
    }
    positions.needsUpdate = true;
  }

  return geometry;
}

interface Phase {
  title: string;
  description: string;
}

interface OrbitalSystemProps {
  phases: Phase[];
  expandedPhase: number | null;
  onPhaseClick: (index: number) => void;
  language: Language;
}

const OrbitalSystem: React.FC<OrbitalSystemProps> = ({ phases, expandedPhase, onPhaseClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cardOpacities, setCardOpacities] = useState<number[]>(phases.map(() => 1));
  const cardPositionsRef = useRef<THREE.Vector3[]>(phases.map(() => new THREE.Vector3()));
  const baseRadius = 5;

  // Rotate the entire system and animate orb
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1; // Slow continuous rotation

      // Update matrix world before using it
      groupRef.current.updateMatrixWorld();

      // Get actual camera position
      const cameraPosition = state.camera.position;
      const originPosition = new THREE.Vector3(0, 0, 0); // Orb is at origin

      // Distance from camera to orb center
      const cameraToOriginDist = cameraPosition.distanceTo(originPosition);

      // Update card opacities based on distance from camera
      const newOpacities = cardPositionsRef.current.map((pos) => {
        if (!groupRef.current) return 1;
        const worldPos = pos.clone().applyMatrix4(groupRef.current.matrixWorld);

        // Distance from camera to card
        const cameraToCardDist = cameraPosition.distanceTo(worldPos);

        // If card is further from camera than orb, it's behind the orb
        if (cameraToCardDist > cameraToOriginDist) {
          // Calculate how far behind (as ratio)
          const behindRatio = (cameraToCardDist - cameraToOriginDist) / baseRadius;
          // Fade based on how far behind: 0 (just behind) to 1 (fully behind)
          const opacity = Math.max(0.1, 1 - Math.min(behindRatio, 1) * 0.9);
          return opacity;
        }
        return 1; // Full opacity when in front of orb
      });

      setCardOpacities(newOpacities);
    }

    // Pulse the orb
    if (orbRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      orbRef.current.scale.setScalar(scale);
    }
  });

  // Distribute boxes evenly in 3D spherical space
  const positionVariations = useMemo(
    () =>
      phases.map((_, index) => {
        // Use spherical coordinates for even distribution
        const phi = Math.acos(-1 + (2 * index) / phases.length); // Polar angle
        const theta = Math.sqrt(phases.length * Math.PI) * phi; // Azimuthal angle

        // Radius variation based on index
        const radiusVar = 0.9 + ((index * 7) % 10) / 50; // ±10% variation, deterministic

        return {
          phi,
          theta,
          radiusVar,
        };
      }),
    [phases]
  );

  // Calculate card positions from variations
  const cardPositions = useMemo(
    () =>
      positionVariations.map((variations) => {
        const radius = baseRadius * variations.radiusVar;
        const x = radius * Math.sin(variations.phi) * Math.cos(variations.theta);
        const y = radius * Math.sin(variations.phi) * Math.sin(variations.theta);
        const z = radius * Math.cos(variations.phi);
        return { x, y, z };
      }),
    [positionVariations, baseRadius]
  );

  // Update ref positions in useEffect (not during render)
  useEffect(() => {
    cardPositions.forEach((pos, index) => {
      const posRef = cardPositionsRef.current[index];
      if (posRef) {
        posRef.set(pos.x, pos.y, pos.z);
      }
    });
  }, [cardPositions]);

  return (
    <group ref={groupRef}>
      {/* Central Orb - Simple matte sphere - half size */}
      <mesh ref={orbRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.175, 64, 64]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff4d8f"
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Outer glow sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.225, 32, 32]} />
        <meshBasicMaterial color="#ffb3d9" transparent opacity={0.15} />
      </mesh>

      {/* Connecting Lines and Phase Cards */}
      {phases.map((phase, index) => {
        const pos = cardPositions[index];
        if (!pos) return null;

        const { x, y, z } = pos;

        return (
          <group key={index}>
            {/* Animated line from center to card - stop before card */}
            <AnimatedLine
              start={[0, 0, 0]}
              end={[x * 0.85, y * 0.85, z * 0.85]}
              color="#ff6b6b"
              glowColor="#ff99cc"
              index={index}
            />

            {/* Phase Card */}
            <Html
              position={[x, y, z]}
              center
              distanceFactor={8}
              zIndexRange={[
                (cardOpacities[index] ?? 1) < 0.5 ? 0 : 100,
                (cardOpacities[index] ?? 1) < 0.5 ? 0 : 100,
              ]}
              style={{
                transition: 'all 0.3s',
                pointerEvents: 'auto',
              }}
            >
              <div
                onClick={() => {
                  onPhaseClick(index);
                }}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                }}
                className={`
                  cursor-pointer rounded-md border shadow-md hover:shadow-xl
                  ${expandedPhase === index ? 'border-coral shadow-2xl' : 'border-gray-200 hover:border-coral'}
                  transition-all duration-300
                  ${expandedPhase === index ? 'w-80 p-4' : 'px-2 py-1'}
                `}
                style={{
                  transform:
                    expandedPhase === index
                      ? 'scale(1.1)'
                      : hoveredIndex === index
                        ? 'scale(1.03)'
                        : 'scale(1)',
                  backgroundColor:
                    expandedPhase === index
                      ? '#ffffff'
                      : `hsl(${350 + (index % 5) * 5}, 100%, ${98 - (index % 5)}%)`, // Subtle phase-based tints
                  opacity: cardOpacities[index] ?? 1,
                  transition: 'opacity 0.3s ease-out',
                }}
              >
                {/* Phase Number Badge - Only show when expanded */}
                {expandedPhase === index && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-coral rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {(index % 5) + 1}
                  </div>
                )}

                {/* Phase Title */}
                <h3
                  className={`
                  font-sans font-medium ${COLORS.coral} whitespace-nowrap
                  ${expandedPhase === index ? 'text-lg mb-2' : 'text-xs leading-tight'}
                  transition-all duration-300
                `}
                >
                  {phase.title}
                </h3>

                {/* Phase Description - Only show when expanded */}
                <div
                  className={`
                  overflow-hidden transition-all duration-300
                  ${expandedPhase === index ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}
                `}
                >
                  <p
                    className={`${TYPOGRAPHY.bodySmall} ${COLORS.gray600} leading-relaxed text-sm`}
                  >
                    {phase.description}
                  </p>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// Animated line with gradient - thicker near orb
const AnimatedLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  glowColor: string;
  index: number;
}> = ({ start, end, color, index }) => {
  const tubeRef = useRef<THREE.Mesh>(null);

  // Create tapered tube geometry using factory function
  const tubeGeometry = useMemo(() => createTaperedTubeGeometry(start, end), [start, end]);

  // Animate opacity with a wave effect
  useFrame((state) => {
    if (tubeRef.current) {
      const material = tubeRef.current.material as THREE.MeshBasicMaterial;
      const wave = Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.2 + 0.5;
      material.opacity = wave;
    }
  });

  return (
    <mesh ref={tubeRef} geometry={tubeGeometry}>
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
};

export default OrbitalSystem;
