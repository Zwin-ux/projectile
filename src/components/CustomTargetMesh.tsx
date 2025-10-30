'use client';

/**
 * CustomTargetMesh - 3D rendering for custom stage targets
 * Supports behaviors: static, orbit, bounce-vertical, bounce-horizontal
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CustomTarget } from '@/types/customStage';

interface CustomTargetMeshProps {
  target: CustomTarget;
  isHit: boolean;
  scoreData?: { zone: string; points: number };
  onPositionUpdate?: (targetId: string, position: [number, number, number]) => void;
}

export default function CustomTargetMesh({ target, isHit, scoreData, onPositionUpdate }: CustomTargetMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const currentPositionRef = useRef<[number, number, number]>(target.position);

  // Calculate animated position based on behavior
  const animatedPosition = useMemo(() => {
    return new THREE.Vector3(...target.position);
  }, [target.position]);

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    timeRef.current += delta;

    // Apply behavior animations
    switch (target.behavior) {
      case 'orbit': {
        const speed = target.behaviorConfig?.speed || 1;
        const radius = target.behaviorConfig?.range || 5;
        const centerPoint = target.behaviorConfig?.centerPoint || target.position;

        const angle = timeRef.current * speed;
        groupRef.current.position.x = centerPoint[0] + Math.cos(angle) * radius;
        groupRef.current.position.z = centerPoint[2] + Math.sin(angle) * radius;
        groupRef.current.position.y = centerPoint[1];
        break;
      }

      case 'bounce-vertical': {
        const speed = target.behaviorConfig?.speed || 1;
        const range = target.behaviorConfig?.range || 3;
        const baseY = target.position[1];

        const offset = Math.sin(timeRef.current * speed) * range;
        groupRef.current.position.y = baseY + Math.abs(offset);
        break;
      }

      case 'bounce-horizontal': {
        const speed = target.behaviorConfig?.speed || 1;
        const range = target.behaviorConfig?.range || 5;
        const baseX = target.position[0];

        const offset = Math.sin(timeRef.current * speed) * range;
        groupRef.current.position.x = baseX + offset;
        break;
      }

      case 'static':
      default:
        // No animation - keep initial position
        groupRef.current.position.set(...target.position);
        break;
    }

    // Update current position ref and notify parent
    const currentPos: [number, number, number] = [
      groupRef.current.position.x,
      groupRef.current.position.y,
      groupRef.current.position.z,
    ];
    currentPositionRef.current = currentPos;

    if (onPositionUpdate) {
      onPositionUpdate(target.id, currentPos);
    }

    // Pulse effect when hit
    if (meshRef.current && isHit) {
      const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5;
      meshRef.current.scale.setScalar(1 + pulse * 0.2);
    }
  });

  // If target should disappear after hit
  if (isHit && target.disappearOnHit) {
    return null;
  }

  const baseColor = isHit ? '#ff6b35' : target.color;

  return (
    <group ref={groupRef} position={target.position}>
      {/* Main target ring */}
      <mesh ref={meshRef}>
        <torusGeometry args={[target.radius, target.radius * 0.15, 16, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isHit ? 0.8 : 0.4}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[target.radius * 0.25, 16, 16]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Outer glow ring when hit */}
      {isHit && (
        <mesh>
          <torusGeometry args={[target.radius * 1.2, target.radius * 0.08, 16, 32]} />
          <meshBasicMaterial
            color="#ff6b35"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Point value label background */}
      <mesh position={[0, target.radius + 0.8, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* TODO: Add Text3D for point value */}
      {/* For now, the point value is shown in the label background */}
    </group>
  );
}

/**
 * Check if projectile hits a custom target
 * Uses simple sphere collision for now
 */
export function checkCustomTargetHit(
  projectilePos: { x: number; y: number; z: number },
  target: CustomTarget,
  currentTargetPosition: [number, number, number]
): boolean {
  const dx = projectilePos.x - currentTargetPosition[0];
  const dy = projectilePos.y - currentTargetPosition[1];
  const dz = projectilePos.z - currentTargetPosition[2];
  const distanceSquared = dx * dx + dy * dy + dz * dz;
  const radiusSquared = target.radius * target.radius;

  return distanceSquared <= radiusSquared;
}
