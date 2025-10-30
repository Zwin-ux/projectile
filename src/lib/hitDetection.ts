/**
 * Hit Detection for Parabola Target Challenge System
 * Uses segment-sphere intersection to prevent tunneling of fast projectiles
 */

import type { TargetSpec } from './gameConfig';
import type { CustomTarget } from '@/types/customStage';

export interface HitResult {
  targetId: string;
  points: number;
}

export interface DynamicTarget {
  id: string;
  position: [number, number, number];
  radius: number;
  points: number;
}

/**
 * Check if a projectile segment intersects any targets
 * @param prevPos Previous position of projectile
 * @param currPos Current position of projectile
 * @param targets Array of target specifications
 * @returns Array of hit results
 */
export function checkSegmentHits(
  prevPos: [number, number, number],
  currPos: [number, number, number],
  targets: TargetSpec[]
): HitResult[] {
  const hits: HitResult[] = [];

  for (const target of targets) {
    if (segmentIntersectsSphere(prevPos, currPos, target.position, target.radius)) {
      hits.push({
        targetId: target.id,
        points: target.points
      });
    }
  }

  return hits;
}

/**
 * Test if a line segment intersects a sphere
 * Uses ray-sphere intersection with quadratic equation
 * @param p1 Start point of segment
 * @param p2 End point of segment
 * @param center Center of sphere
 * @param radius Radius of sphere
 * @returns True if segment intersects sphere
 */
function segmentIntersectsSphere(
  p1: [number, number, number],
  p2: [number, number, number],
  center: [number, number, number],
  radius: number
): boolean {
  // Direction vector from p1 to p2
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dz = p2[2] - p1[2];

  // Vector from p1 to sphere center
  const fx = p1[0] - center[0];
  const fy = p1[1] - center[1];
  const fz = p1[2] - center[2];

  // Quadratic equation coefficients: at^2 + bt + c = 0
  const a = dx * dx + dy * dy + dz * dz;
  const b = 2 * (fx * dx + fy * dy + fz * dz);
  const c = (fx * fx + fy * fy + fz * fz) - radius * radius;

  // Discriminant
  const discriminant = b * b - 4 * a * c;

  // No intersection if discriminant is negative
  if (discriminant < 0) {
    return false;
  }

  // Calculate intersection parameters
  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDiscriminant) / (2 * a);
  const t2 = (-b + sqrtDiscriminant) / (2 * a);

  // Check if either intersection point is within the segment (0 <= t <= 1)
  const hit = (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);

  return hit;
}

/**
 * Check segment hits with dynamic target positions (for animated targets)
 * @param prevPos Previous position of projectile
 * @param currPos Current position of projectile
 * @param targets Array of targets with dynamic positions
 * @param positionMap Optional map of target IDs to current animated positions
 * @returns Array of hit results
 */
export function checkSegmentHitsWithDynamicPositions(
  prevPos: [number, number, number],
  currPos: [number, number, number],
  targets: DynamicTarget[],
  positionMap?: Map<string, [number, number, number]>
): HitResult[] {
  const hits: HitResult[] = [];

  for (const target of targets) {
    // Use animated position if available, otherwise use base position
    const targetPos = positionMap?.get(target.id) || target.position;

    if (segmentIntersectsSphere(prevPos, currPos, targetPos, target.radius)) {
      hits.push({
        targetId: target.id,
        points: target.points
      });
    }
  }

  return hits;
}

/**
 * Check if custom targets are hit, using their current animated positions
 */
export function checkCustomTargetHits(
  prevPos: [number, number, number],
  currPos: [number, number, number],
  targets: CustomTarget[],
  positionMap: Map<string, [number, number, number]>
): HitResult[] {
  const dynamicTargets: DynamicTarget[] = targets.map(t => ({
    id: t.id,
    position: t.position,
    radius: t.radius,
    points: t.points
  }));

  return checkSegmentHitsWithDynamicPositions(prevPos, currPos, dynamicTargets, positionMap);
}

/**
 * Calculate distance from a point to sphere surface
 * Useful for proximity feedback
 */
export function distanceToTarget(
  pos: [number, number, number],
  targetPos: [number, number, number],
  targetRadius: number
): number {
  const dx = pos[0] - targetPos[0];
  const dy = pos[1] - targetPos[1];
  const dz = pos[2] - targetPos[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return Math.max(0, distance - targetRadius);
}
