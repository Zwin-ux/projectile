'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { TrajectoryPoint } from '@/lib/physics';

export type ProjectileType = 'basketball' | 'cannonball' | 'bullet' | 'airplane' | 'soccerball';

interface ProjectileProps {
  trajectoryPoints: TrajectoryPoint[];
  isAnimating: boolean;
  projectileType: ProjectileType;
  onComplete: () => void;
  onPositionUpdate: (point: TrajectoryPoint) => void;
}

export default function Projectile({
  trajectoryPoints,
  isAnimating,
  projectileType,
  onComplete,
  onPositionUpdate
}: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const currentIndexRef = useRef(0);

  useFrame(() => {
    if (!isAnimating || !meshRef.current || trajectoryPoints.length === 0) return;

    const speedMultiplier = getSpeedMultiplier(projectileType);
    const increment = Math.max(1, Math.floor(speedMultiplier));

    currentIndexRef.current += increment;

    if (currentIndexRef.current >= trajectoryPoints.length) {
      currentIndexRef.current = trajectoryPoints.length - 1;
      onComplete();
      return;
    }

    const point = trajectoryPoints[currentIndexRef.current];
    meshRef.current.position.set(point.x, point.y, point.z);
    onPositionUpdate(point);

    // Add rotation for visual effect
    if (projectileType === 'basketball' || projectileType === 'cannonball' || projectileType === 'soccerball') {
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.z += 0.05;
    } else if (projectileType === 'airplane') {
      // Paper airplane wobble
      meshRef.current.rotation.z = Math.sin(currentIndexRef.current * 0.1) * 0.2;
    }
  });

  // Reset index when animation starts
  if (isAnimating && currentIndexRef.current >= trajectoryPoints.length - 1) {
    currentIndexRef.current = 0;
  }

  const { geometry, material, scale } = getProjectileAppearance(projectileType);

  return (
    <group>
      <Trail
        width={projectileType === 'bullet' ? 0.5 : 1}
        length={projectileType === 'bullet' ? 10 : 20}
        color={getTrailColor(projectileType)}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} position={[0, 0, 0]}>
          {geometry}
          {material}
        </mesh>
      </Trail>
    </group>
  );
}

function getProjectileAppearance(type: ProjectileType) {
  switch (type) {
    case 'basketball':
      return {
        geometry: <sphereGeometry args={[0.6, 16, 16]} />,
        material: (
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={0.3}
            roughness={0.8}
          />
        ),
        scale: 1
      };
    case 'cannonball':
      return {
        geometry: <sphereGeometry args={[0.8, 16, 16]} />,
        material: (
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.8}
            roughness={0.2}
          />
        ),
        scale: 1
      };
    case 'bullet':
      return {
        geometry: (
          <group>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          </group>
        ),
        material: (
          <meshStandardMaterial
            color="#ffd700"
            metalness={1.0}
            roughness={0.1}
          />
        ),
        scale: 1
      };
    case 'soccerball':
      return {
        geometry: <sphereGeometry args={[0.55, 16, 16]} />,
        material: (
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
            roughness={0.7}
          />
        ),
        scale: 1
      };
    case 'airplane':
      return {
        geometry: (
          <group>
            {/* Simple paper airplane shape */}
            <coneGeometry args={[0.3, 1.2, 3]} />
          </group>
        ),
        material: (
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
          />
        ),
        scale: 1
      };
    default:
      return {
        geometry: <sphereGeometry args={[0.5, 16, 16]} />,
        material: <meshStandardMaterial color="#3b82f6" />,
        scale: 1
      };
  }
}

function getTrailColor(type: ProjectileType): string {
  switch (type) {
    case 'basketball':
      return '#ff6b35';
    case 'cannonball':
      return '#666666';
    case 'bullet':
      return '#ffd700';
    case 'soccerball':
      return '#06b6d4';
    case 'airplane':
      return '#ffffff';
    default:
      return '#3b82f6';
  }
}

function getSpeedMultiplier(type: ProjectileType): number {
  switch (type) {
    case 'basketball':
      return 1.5;
    case 'cannonball':
      return 1.0;
    case 'bullet':
      return 3.0;
    case 'soccerball':
      return 1.4;
    case 'airplane':
      return 1.2;
    default:
      return 1.0;
  }
}
