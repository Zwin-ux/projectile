'use client';

/**
 * TrainingTarget Component
 * 3D rendered target with hit effects (orange glow, pulse animation)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TargetSpec } from '@/lib/gameConfig';

interface TrainingTargetProps {
  target: TargetSpec;
  isHit: boolean;
}

export default function TrainingTarget({ target, isHit }: TrainingTargetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Pulse animation for hit targets
  useFrame((state) => {
    if (glowRef.current && isHit) {
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + pulse * 0.3);
    }
  });

  const baseColor = isHit ? '#ff6b35' : '#06b6d4'; // Orange when hit, cyan default
  const [x, y, z] = target.position;

  return (
    <group position={[x, y, z]}>
      {/* Main target ring */}
      <mesh ref={meshRef}>
        <torusGeometry args={[target.radius, target.radius * 0.15, 16, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isHit ? 0.8 : 0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Bullseye center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[target.radius * 0.2, 16, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Orange glow effect on hit */}
      {isHit && (
        <mesh ref={glowRef}>
          <torusGeometry args={[target.radius * 1.1, target.radius * 0.08, 16, 32]} />
          <meshBasicMaterial
            color="#ff6b35"
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Point value indicator (floating text) */}
      <mesh position={[0, target.radius + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 0.5]} />
        <meshBasicMaterial
          color="#1e40af"
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* TODO: Add Text3D or HTML overlay for point value display */}
    </group>
  );
}
