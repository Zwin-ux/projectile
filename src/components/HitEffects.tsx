'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleEffectProps {
  position: [number, number, number];
  color?: string;
  particleCount?: number;
  onComplete?: () => void;
}

/**
 * Particle explosion effect for target hits
 */
export function ParticleEffect({ 
  position, 
  color = '#06b6d4', 
  particleCount = 20,
  onComplete 
}: ParticleEffectProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<THREE.Vector3[]>([]);
  const lifetimeRef = useRef(0);
  const maxLifetime = 1.0; // seconds

  useEffect(() => {
    // Initialize particle velocities
    velocitiesRef.current = Array.from({ length: particleCount }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 5;
      
      return new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );
    });
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    lifetimeRef.current += delta;

    if (lifetimeRef.current >= maxLifetime) {
      onComplete?.();
      return;
    }

    const positions = particlesRef.current.geometry.attributes.position;
    const velocities = velocitiesRef.current;

    for (let i = 0; i < particleCount; i++) {
      // Update position based on velocity
      positions.setXYZ(
        i,
        positions.getX(i) + velocities[i].x * delta,
        positions.getY(i) + velocities[i].y * delta,
        positions.getZ(i) + velocities[i].z * delta
      );

      // Apply gravity
      velocities[i].y -= 9.81 * delta;
    }

    positions.needsUpdate = true;

    // Fade out
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - (lifetimeRef.current / maxLifetime);
  });

  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = position[0];
    particlePositions[i * 3 + 1] = position[1];
    particlePositions[i * 3 + 2] = position[2];
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface HitMarkerProps {
  position: [number, number, number];
  points: number;
  onComplete?: () => void;
}

/**
 * Floating text marker showing points earned
 */
export function HitMarker({ position, points, onComplete }: HitMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lifetimeRef = useRef(0);
  const maxLifetime = 1.5;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    lifetimeRef.current += delta;

    if (lifetimeRef.current >= maxLifetime) {
      onComplete?.();
      return;
    }

    // Float upward
    meshRef.current.position.y += delta * 2;

    // Fade out
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 1 - (lifetimeRef.current / maxLifetime);

    // Scale pulse
    const scale = 1 + Math.sin(lifetimeRef.current * 10) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial
        color={points >= 100 ? '#ffd700' : '#06b6d4'}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  );
}

interface RingEffectProps {
  position: [number, number, number];
  color?: string;
  onComplete?: () => void;
}

/**
 * Expanding ring effect for hits
 */
export function RingEffect({ position, color = '#06b6d4', onComplete }: RingEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const lifetimeRef = useRef(0);
  const maxLifetime = 0.8;

  useFrame((state, delta) => {
    if (!ringRef.current) return;

    lifetimeRef.current += delta;

    if (lifetimeRef.current >= maxLifetime) {
      onComplete?.();
      return;
    }

    const progress = lifetimeRef.current / maxLifetime;

    // Expand ring
    const scale = 1 + progress * 3;
    ringRef.current.scale.set(scale, scale, scale);

    // Fade out
    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 1 - progress;
  });

  return (
    <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.2, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
