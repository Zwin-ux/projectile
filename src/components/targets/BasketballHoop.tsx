'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BasketballHoopProps {
  position: [number, number, number];
  distance: number;
  label: string;
  isScored: boolean;
  onScore?: (points: number, type: string) => void;
}

export default function BasketballHoop({
  position,
  distance,
  label,
  isScored
}: BasketballHoopProps) {
  const groupRef = useRef<THREE.Group>(null);
  const netRef = useRef<THREE.Group>(null);

  // Animate net swish when scored
  useFrame((state) => {
    if (netRef.current && isScored) {
      netRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.15;
    } else if (netRef.current) {
      netRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  // Regulation basketball hoop: 10ft high, 18" diameter
  const rimHeight = 3.048; // 10 feet = 3.048 meters
  const rimRadius = 0.2286; // 18 inches = 0.4572m diameter / 2
  const backboardHeight = 1.05; // 3.5 feet
  const backboardWidth = 1.8; // 6 feet

  return (
    <group ref={groupRef} position={position}>
      {/* Support Pole */}
      <mesh position={[0, rimHeight / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, rimHeight, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Backboard */}
      <group position={[0, rimHeight, -0.15]}>
        <mesh>
          <boxGeometry args={[backboardWidth, backboardHeight, 0.02]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            metalness={0.1}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Backboard Frame */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(backboardWidth, backboardHeight, 0.02)]} />
          <lineBasicMaterial color="#ff6600" linewidth={2} />
        </lineSegments>

        {/* Inner Rectangle (target box) */}
        <mesh position={[0, -0.15, 0.02]}>
          <boxGeometry args={[0.59, 0.45, 0.01]} />
          <meshBasicMaterial color="#ff6600" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Rim */}
      <mesh position={[0, rimHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rimRadius, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={isScored ? '#10b981' : '#ff6600'}
          metalness={0.8}
          roughness={0.2}
          emissive={isScored ? '#10b981' : '#ff6600'}
          emissiveIntensity={isScored ? 0.5 : 0.2}
        />
      </mesh>

      {/* Net */}
      <group ref={netRef} position={[0, rimHeight, 0]}>
        {/* Net mesh - simplified cone */}
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[rimRadius * 0.9, 0.8, 12, 1, true]} />
          <meshStandardMaterial
            color={isScored ? '#10b981' : '#ffffff'}
            wireframe
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Net detail lines */}
        {[0, Math.PI / 6, Math.PI / 3, Math.PI / 2, (2 * Math.PI) / 3, (5 * Math.PI) / 6].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * rimRadius * 0.5,
              -0.4,
              Math.sin(angle) * rimRadius * 0.5
            ]}
            rotation={[0, angle, 0]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.8, 4]} />
            <meshStandardMaterial
              color={isScored ? '#10b981' : '#ffffff'}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* Distance Label */}
      <group position={[0, rimHeight + 1.5, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.3, 0.05]} />
          <meshStandardMaterial color="#1f1f1f" />
        </mesh>
        {/* Text would go here - using mesh as placeholder */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.4, 0.25]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} />
        </mesh>
      </group>

      {/* Scored Effect */}
      {isScored && (
        <group position={[0, rimHeight, 0]}>
          <mesh>
            <torusGeometry args={[rimRadius * 1.5, 0.05, 16, 32]} />
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      )}

      {/* Floor marking - free throw line, 3-point line, etc */}
      {label === 'Free Throw' && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {label === '3-Pointer' && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Helper function to check if ball went through the hoop
export function checkBasketballScore(
  projectile: { x: number; y: number; z: number },
  previousProjectile: { x: number; y: number; z: number } | null,
  hoop: { position: [number, number, number]; radius: number }
): { scored: boolean; type: string; points: number } {
  const rimHeight = 3.048; // 10 feet
  const rimRadius = 0.2286; // 18 inches radius

  const hoopX = hoop.position[0];
  const hoopY = hoop.position[1] + rimHeight;
  const hoopZ = hoop.position[2];

  // Check if projectile is passing through the hoop height
  const isAtHoopHeight = projectile.y >= hoopY - 0.3 && projectile.y <= hoopY + 0.1;
  const wasAboveHoop = previousProjectile && previousProjectile.y > hoopY + 0.1;
  const isNowBelow = projectile.y < hoopY - 0.3;

  // Calculate horizontal distance from hoop center
  const dx = projectile.x - hoopX;
  const dz = projectile.z - hoopZ;
  const horizontalDist = Math.sqrt(dx * dx + dz * dz);

  // Ball went through the hoop cylinder
  if (wasAboveHoop && isNowBelow && horizontalDist < rimRadius) {
    // Determine shot type based on distance
    const shotDistance = Math.abs(hoop.position[0]);

    // Check if it's a swish (close to center, clean through)
    const isSwish = horizontalDist < rimRadius * 0.5;

    let type = 'basket';
    let points = 50;

    if (shotDistance < 5) {
      type = 'layup';
      points = 30;
    } else if (shotDistance < 16) {
      type = 'free-throw';
      points = 50;
    } else if (shotDistance < 24) {
      type = 'mid-range';
      points = 75;
    } else if (shotDistance < 32) {
      type = '3-pointer';
      points = 100;
    } else if (shotDistance < 48) {
      type = 'deep-3';
      points = 200;
    } else {
      type = 'half-court';
      points = 500;
    }

    if (isSwish) {
      points += 25; // Swish bonus
      type += '-swish';
    }

    return { scored: true, type, points };
  }

  return { scored: false, type: '', points: 0 };
}
