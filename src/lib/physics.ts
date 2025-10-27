/**
 * Physics Module for Projectile Motion Simulation
 * Implements ideal 2D projectile motion equations
 */

export interface TrajectoryPoint {
  t: number;  // time in seconds
  x: number;  // horizontal position in meters
  y: number;  // vertical position in meters
  z: number;  // depth (always 0 for 2D simulation)
}

export interface ProjectileParams {
  speed: number;      // launch speed in m/s
  angleDeg: number;   // launch angle in degrees
  gravity: number;    // gravitational acceleration in m/s²
}

export interface FlightStats {
  maxHeight: number;  // maximum height reached in meters
  range: number;      // horizontal distance at impact in meters
  flightTime: number; // total time in air in seconds
}

/**
 * Generates trajectory points for a projectile
 * @param params - Initial conditions (speed, angle, gravity)
 * @param dt - Time step for sampling (default: 0.02s)
 * @param maxTime - Maximum simulation time (default: 100s)
 * @returns Array of trajectory points
 */
export function generateTrajectory(
  params: ProjectileParams,
  dt: number = 0.02,
  maxTime: number = 100
): TrajectoryPoint[] {
  const { speed, angleDeg, gravity } = params;

  // Convert angle to radians
  const angleRad = (angleDeg * Math.PI) / 180;

  // Calculate initial velocity components
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);

  const points: TrajectoryPoint[] = [];
  let t = 0;

  // Generate trajectory points until projectile hits ground
  while (t < maxTime) {
    const x = vx * t;
    const y = vy * t - 0.5 * gravity * t * t;

    points.push({ t, x, y, z: 0 });

    // Stop if projectile has hit the ground (y < 0) and we're past the start
    if (y < 0 && t > 0) {
      break;
    }

    t += dt;
  }

  return points;
}

/**
 * Calculates flight statistics from trajectory points
 * @param points - Array of trajectory points
 * @returns Flight statistics (max height, range, flight time)
 */
export function flightStats(points: TrajectoryPoint[]): FlightStats {
  if (points.length === 0) {
    return { maxHeight: 0, range: 0, flightTime: 0 };
  }

  // Find maximum height
  let maxHeight = 0;
  for (const point of points) {
    if (point.y > maxHeight) {
      maxHeight = point.y;
    }
  }

  // Get range and flight time from last point
  const lastPoint = points[points.length - 1];
  const range = lastPoint.x;
  const flightTime = lastPoint.t;

  return {
    maxHeight: Number(maxHeight.toFixed(2)),
    range: Number(range.toFixed(2)),
    flightTime: Number(flightTime.toFixed(2))
  };
}

/**
 * Calculates theoretical values for projectile motion
 * Useful for validation and comparison
 */
export function theoreticalValues(params: ProjectileParams): FlightStats {
  const { speed, angleDeg, gravity } = params;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Time of flight: T = 2 * v * sin(θ) / g
  const flightTime = (2 * speed * Math.sin(angleRad)) / gravity;

  // Range: R = v² * sin(2θ) / g
  const range = (speed * speed * Math.sin(2 * angleRad)) / gravity;

  // Max height: H = v² * sin²(θ) / (2g)
  const maxHeight = (speed * speed * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * gravity);

  return {
    maxHeight: Number(maxHeight.toFixed(2)),
    range: Number(range.toFixed(2)),
    flightTime: Number(flightTime.toFixed(2))
  };
}
