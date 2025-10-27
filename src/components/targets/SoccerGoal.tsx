'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SoccerGoalProps {
  position: [number, number, number];
  isScored: boolean;
  scoreZone?: string;
}

export default function SoccerGoal({
  position,
  isScored,
  scoreZone
}: SoccerGoalProps) {
  const netRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Generate stable particle positions
  const particlePositions = useMemo(() => {
    return Array.from({ length: 10 }, () => ([
      (Math.random() - 0.5) * 7.32,
      (Math.random() - 0.5) * 2.44,
      0.5
    ] as [number, number, number]));
  }, []);

  // Animate net bulge when ball scores
  useFrame((state) => {
    if (netRef.current && isScored) {
      const bulge = Math.sin(state.clock.elapsedTime * 6) * 0.2;
      netRef.current.position.x = bulge;
    } else if (netRef.current) {
      netRef.current.position.x = 0;
    }
  });

  // Regulation goal: 24ft (7.32m) wide x 8ft (2.44m) tall
  const goalWidth = 7.32;
  const goalHeight = 2.44;
  const goalDepth = 2.5;

  return (
    <group ref={groupRef} position={position}>
      {/* Goal Posts - Left */}
      <mesh position={[-goalWidth / 2, goalHeight / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, goalHeight, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Goal Posts - Right */}
      <mesh position={[goalWidth / 2, goalHeight / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, goalHeight, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, goalHeight, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, goalWidth, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back Left Post */}
      <mesh position={[-goalWidth / 2, goalHeight / 2, -goalDepth]}>
        <cylinderGeometry args={[0.06, 0.06, goalHeight, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back Right Post */}
      <mesh position={[goalWidth / 2, goalHeight / 2, -goalDepth]}>
        <cylinderGeometry args={[0.06, 0.06, goalHeight, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back Crossbar */}
      <mesh position={[0, goalHeight, -goalDepth]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, goalWidth, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Ground Bars */}
      <mesh position={[-goalWidth / 2, 0, -goalDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, goalDepth, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[goalWidth / 2, 0, -goalDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, goalDepth, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Net - Back */}
      <group ref={netRef} position={[0, 0, 0]}>
        <mesh position={[0, goalHeight / 2, -goalDepth]}>
          <planeGeometry args={[goalWidth, goalHeight]} />
          <meshStandardMaterial
            color={isScored ? '#10b981' : '#ffffff'}
            wireframe
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Net - Top */}
        <mesh position={[0, goalHeight, -goalDepth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[goalWidth, goalDepth]} />
          <meshStandardMaterial
            color={isScored ? '#10b981' : '#ffffff'}
            wireframe
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Net - Left Side */}
        <mesh position={[-goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial
            color={isScored ? '#10b981' : '#ffffff'}
            wireframe
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Net - Right Side */}
        <mesh position={[goalWidth / 2, goalHeight / 2, -goalDepth / 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[goalDepth, goalHeight]} />
          <meshStandardMaterial
            color={isScored ? '#10b981' : '#ffffff'}
            wireframe
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Detailed net strands - vertical */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = (i / 14 - 0.5) * goalWidth;
          return (
            <mesh key={`v-${i}`} position={[x, goalHeight / 2, -goalDepth]}>
              <cylinderGeometry args={[0.005, 0.005, goalHeight, 4]} />
              <meshStandardMaterial
                color={isScored ? '#10b981' : '#e0e0e0'}
                transparent
                opacity={0.5}
              />
            </mesh>
          );
        })}

        {/* Detailed net strands - horizontal */}
        {Array.from({ length: 10 }).map((_, i) => {
          const y = (i / 9) * goalHeight;
          return (
            <mesh key={`h-${i}`} position={[0, y, -goalDepth]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, goalWidth, 4]} />
              <meshStandardMaterial
                color={isScored ? '#10b981' : '#e0e0e0'}
                transparent
                opacity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* Score Zone Highlights */}
      {!isScored && (
        <>
          {/* Top Left Corner (hardest) */}
          <mesh position={[-goalWidth / 2 + 0.8, goalHeight - 0.6, 0.1]}>
            <boxGeometry args={[1.5, 1.2, 0.05]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Top Right Corner */}
          <mesh position={[goalWidth / 2 - 0.8, goalHeight - 0.6, 0.1]}>
            <boxGeometry args={[1.5, 1.2, 0.05]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Center Zone (easiest) */}
          <mesh position={[0, goalHeight / 2, 0.1]}>
            <boxGeometry args={[2, 1.5, 0.05]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Scored Effect */}
      {isScored && (
        <group position={[0, goalHeight / 2, 0]}>
          <mesh>
            <boxGeometry args={[goalWidth * 1.2, goalHeight * 1.2, 0.1]} />
            <meshBasicMaterial
              color={scoreZone === 'top-corner' ? '#fbbf24' : '#10b981'}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Particle effect */}
          {particlePositions.map((pos, i) => (
            <mesh
              key={i}
              position={pos}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* Goal Line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[goalWidth, 0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Helper function to check if ball scored in soccer goal
export function checkSoccerGoalScore(
  projectile: { x: number; y: number; z: number },
  goal: { position: [number, number, number] }
): { scored: boolean; zone: string; points: number } {
  const goalWidth = 7.32;
  const goalHeight = 2.44;

  // Check if ball crossed the goal line (x position)
  const crossedLine = projectile.x >= goal.position[0];

  // Check if within goal width
  const relativeZ = projectile.z - goal.position[2];
  const withinWidth = Math.abs(relativeZ) < goalWidth / 2;

  // Check if within goal height
  const withinHeight = projectile.y > 0 && projectile.y < goalHeight;

  if (!crossedLine || !withinWidth || !withinHeight) {
    return { scored: false, zone: 'miss', points: 0 };
  }

  // Determine zone and points
  const normalizedZ = Math.abs(relativeZ) / (goalWidth / 2); // 0 = center, 1 = edge
  const normalizedY = projectile.y / goalHeight; // 0 = bottom, 1 = top

  // Top corners (hardest shots)
  if (normalizedY > 0.6 && normalizedZ > 0.6) {
    return { scored: true, zone: 'top-corner', points: 200 };
  }

  // Upper 90 (high shots)
  if (normalizedY > 0.7) {
    return { scored: true, zone: 'upper-90', points: 150 };
  }

  // Side netting (corners)
  if (normalizedZ > 0.7) {
    return { scored: true, zone: 'side-netting', points: 125 };
  }

  // Low corners
  if (normalizedY < 0.4 && normalizedZ > 0.6) {
    return { scored: true, zone: 'low-corner', points: 100 };
  }

  // Center (easiest)
  if (normalizedZ < 0.3) {
    return { scored: true, zone: 'center', points: 50 };
  }

  // General goal
  return { scored: true, zone: 'goal', points: 75 };
}
