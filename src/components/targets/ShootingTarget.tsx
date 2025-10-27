'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShootingTargetProps {
  position: [number, number, number];
  distance: number;
  type: 'bullseye' | 'silhouette' | 'steel-plate';
  isHit: boolean;
  hitRing?: number;
}

export default function ShootingTarget({
  position,
  distance,
  type,
  isHit,
  hitRing
}: ShootingTargetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [fallingAngle, setFallingAngle] = useState(0);

  // Animate steel plate falling when hit
  useFrame(() => {
    if (groupRef.current && isHit && type === 'steel-plate' && fallingAngle < Math.PI / 2) {
      setFallingAngle(prev => Math.min(prev + 0.05, Math.PI / 2));
      groupRef.current.rotation.x = -fallingAngle;
    }
  });

  if (type === 'bullseye') {
    return (
      <group ref={groupRef} position={position}>
        {/* Target Stand */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Paper backing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 1.2, 0.05]} />
          <meshStandardMaterial color="#f5deb3" />
        </mesh>

        {/* Bullseye Rings */}
        {[
          { radius: 0.5, color: '#000000', ring: 10 },
          { radius: 0.45, color: '#ffffff', ring: 9 },
          { radius: 0.4, color: '#000000', ring: 8 },
          { radius: 0.35, color: '#ffffff', ring: 7 },
          { radius: 0.3, color: '#000000', ring: 6 },
          { radius: 0.25, color: '#2563eb', ring: 5 },
          { radius: 0.2, color: '#ef4444', ring: 4 },
          { radius: 0.15, color: '#2563eb', ring: 3 },
          { radius: 0.1, color: '#ef4444', ring: 2 },
          { radius: 0.05, color: '#fbbf24', ring: 1 }
        ].map((ring, i) => (
          <mesh key={i} position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
            <circleGeometry args={[ring.radius, 32]} />
            <meshStandardMaterial
              color={isHit && hitRing === ring.ring ? '#10b981' : ring.color}
              emissive={isHit && hitRing === ring.ring ? '#10b981' : '#000000'}
              emissiveIntensity={isHit && hitRing === ring.ring ? 0.5 : 0}
            />
          </mesh>
        ))}

        {/* Hit marker */}
        {isHit && (
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
          </mesh>
        )}
      </group>
    );
  }

  if (type === 'silhouette') {
    return (
      <group ref={groupRef} position={position}>
        {/* Stand */}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>

        {/* Cardboard backing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 1.2, 0.02]} />
          <meshStandardMaterial color="#e8d5b7" />
        </mesh>

        {/* Silhouette shape (simplified human torso) */}
        <group position={[0, 0, 0.02]}>
          {/* Head */}
          <mesh position={[0, 0.45, 0]}>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>

          {/* Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.8, 0.01]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>

          {/* Center Mass Zone (high value) */}
          <mesh position={[0, 0.1, 0.01]}>
            <circleGeometry args={[0.12, 32]} />
            <meshStandardMaterial
              color={isHit ? '#10b981' : '#ef4444'}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Head shot zone */}
          <mesh position={[0, 0.45, 0.01]}>
            <circleGeometry args={[0.08, 32]} />
            <meshStandardMaterial
              color={isHit ? '#10b981' : '#fbbf24'}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>

        {/* Bullet hole */}
        {isHit && (
          <group position={[0, 0, 0.03]}>
            <mesh>
              <circleGeometry args={[0.02, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            {/* Radial cracks */}
            {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
              <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, angle]}>
                <planeGeometry args={[0.001, 0.1]} />
                <meshBasicMaterial color="#666666" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  }

  if (type === 'steel-plate') {
    return (
      <group ref={groupRef} position={position}>
        {/* Base */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Hinge */}
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Steel Plate */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.02]} />
          <meshStandardMaterial
            color={isHit ? '#10b981' : '#c0c0c0'}
            metalness={0.9}
            roughness={0.1}
            emissive={isHit ? '#10b981' : '#000000'}
            emissiveIntensity={isHit ? 0.3 : 0}
          />
        </mesh>

        {/* Impact spark effect */}
        {isHit && fallingAngle < 0.5 && (
          <group position={[0, 0.15, 0.05]}>
            {[0, 1, 2, 3, 4].map(i => (
              <mesh
                key={i}
                position={[
                  (Math.random() - 0.5) * 0.2,
                  (Math.random() - 0.5) * 0.2,
                  Math.random() * 0.1
                ]}
              >
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    );
  }

  return null;
}

// Helper function to check hit on shooting target
export function checkShootingTargetHit(
  projectile: { x: number; y: number; z: number },
  target: { position: [number, number, number]; type: string }
): { hit: boolean; ring: number; points: number; zone: string } {
  const dx = projectile.x - target.position[0];
  const dy = projectile.y - target.position[1];
  const dz = projectile.z - target.position[2];

  // Check if projectile is at target position (depth check)
  if (Math.abs(dx) > 0.5) {
    return { hit: false, ring: 0, points: 0, zone: 'miss' };
  }

  const distance = Math.sqrt(dy * dy + dz * dz);

  if (target.type === 'bullseye') {
    // Bullseye scoring (10-ring system)
    if (distance <= 0.05) return { hit: true, ring: 10, points: 100, zone: 'bullseye' };
    if (distance <= 0.1) return { hit: true, ring: 9, points: 90, zone: '9-ring' };
    if (distance <= 0.15) return { hit: true, ring: 8, points: 80, zone: '8-ring' };
    if (distance <= 0.2) return { hit: true, ring: 7, points: 70, zone: '7-ring' };
    if (distance <= 0.25) return { hit: true, ring: 6, points: 60, zone: '6-ring' };
    if (distance <= 0.3) return { hit: true, ring: 5, points: 50, zone: '5-ring' };
    if (distance <= 0.35) return { hit: true, ring: 4, points: 40, zone: '4-ring' };
    if (distance <= 0.4) return { hit: true, ring: 3, points: 30, zone: '3-ring' };
    if (distance <= 0.45) return { hit: true, ring: 2, points: 20, zone: '2-ring' };
    if (distance <= 0.5) return { hit: true, ring: 1, points: 10, zone: '1-ring' };
  }

  if (target.type === 'silhouette') {
    // Check headshot (high value)
    const headY = 0.45;
    const distToHead = Math.sqrt(Math.pow(dy - headY, 2) + dz * dz);
    if (distToHead <= 0.12) {
      return { hit: true, ring: 10, points: 150, zone: 'headshot' };
    }

    // Check center mass
    const centerY = 0.1;
    const distToCenter = Math.sqrt(Math.pow(dy - centerY, 2) + dz * dz);
    if (distToCenter <= 0.12) {
      return { hit: true, ring: 9, points: 100, zone: 'center-mass' };
    }

    // Check body hit
    if (Math.abs(dz) < 0.2 && dy > -0.4 && dy < 0.8) {
      return { hit: true, ring: 5, points: 50, zone: 'body' };
    }
  }

  if (target.type === 'steel-plate') {
    // Simple rectangular hit check
    if (Math.abs(dy - 0.15) < 0.25 && Math.abs(dz) < 0.2) {
      return { hit: true, ring: 8, points: 75, zone: 'plate' };
    }
  }

  return { hit: false, ring: 0, points: 0, zone: 'miss' };
}
