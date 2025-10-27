'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TargetProps {
  position: [number, number, number];
  distance: number;
  isHit: boolean;
  onHit?: () => void;
}

export default function Target({ position, distance, isHit }: TargetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoverIntensity, setHoverIntensity] = useState(0);

  useFrame((state) => {
    if (groupRef.current && !isHit) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const outerRadius = 3;
  const middleRadius = 2;
  const innerRadius = 1;

  return (
    <group ref={groupRef} position={position}>
      {/* Target Stand/Post */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Outer Ring (25 points) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[middleRadius, outerRadius, 32]} />
        <meshStandardMaterial
          color={isHit ? '#10b981' : '#ef4444'}
          emissive={isHit ? '#10b981' : '#ef4444'}
          emissiveIntensity={isHit ? 0.8 : 0.3}
          transparent
          opacity={isHit ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Middle Ring (50 points) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[innerRadius, middleRadius, 32]} />
        <meshStandardMaterial
          color={isHit ? '#10b981' : '#fbbf24'}
          emissive={isHit ? '#10b981' : '#fbbf24'}
          emissiveIntensity={isHit ? 0.8 : 0.4}
          transparent
          opacity={isHit ? 0.9 : 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bullseye (100 points) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[innerRadius, 32]} />
        <meshStandardMaterial
          color={isHit ? '#10b981' : '#3b82f6'}
          emissive={isHit ? '#10b981' : '#3b82f6'}
          emissiveIntensity={isHit ? 1.0 : 0.5}
          transparent
          opacity={isHit ? 1.0 : 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Distance Label */}
      {!isHit && (
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[2, 0.8, 0.1]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
      )}

      {/* Hit effect - expanding rings */}
      {isHit && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
            <ringGeometry args={[outerRadius, outerRadius + 0.5, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={1.0}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// Helper function to check if projectile hit target
export function checkTargetHit(
  projectilePos: { x: number; y: number; z: number },
  targetPos: [number, number, number]
): { hit: boolean; score: number } {
  const dx = projectilePos.x - targetPos[0];
  const dy = projectilePos.y - targetPos[1];
  const dz = projectilePos.z - targetPos[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Bullseye (100 points)
  if (distance <= 1) {
    return { hit: true, score: 100 };
  }
  // Middle ring (50 points)
  if (distance <= 2) {
    return { hit: true, score: 50 };
  }
  // Outer ring (25 points)
  if (distance <= 3) {
    return { hit: true, score: 25 };
  }

  return { hit: false, score: 0 };
}
