/**
 * Physics Presets System
 * Simplified controls for non-technical users
 */

export interface PhysicsPreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  speed: number;
  angle: number;
  gravity: number;
}

export const PHYSICS_PRESETS: PhysicsPreset[] = [
  {
    id: 'gentle-lob',
    name: 'Gentle Lob',
    emoji: '🎈',
    description: 'Soft, high arc - perfect for close targets',
    speed: 15,
    angle: 60,
    gravity: 9.81
  },
  {
    id: 'perfect-arc',
    name: 'Perfect Arc',
    emoji: '🌈',
    description: 'Balanced trajectory - the classic 45°',
    speed: 25,
    angle: 45,
    gravity: 9.81
  },
  {
    id: 'laser-shot',
    name: 'Laser Shot',
    emoji: '⚡',
    description: 'Fast and flat - minimal drop',
    speed: 50,
    angle: 15,
    gravity: 9.81
  },
  {
    id: 'moon-gravity',
    name: 'Moon Gravity',
    emoji: '🌙',
    description: 'Low gravity for extreme range',
    speed: 25,
    angle: 45,
    gravity: 1.62
  },
  {
    id: 'jupiter-heavy',
    name: 'Jupiter Heavy',
    emoji: '🪐',
    description: 'High gravity - shots drop fast',
    speed: 35,
    angle: 55,
    gravity: 24.79
  },
  {
    id: 'zero-g',
    name: 'Zero Gravity',
    emoji: '🚀',
    description: 'Weightless - straight lines',
    speed: 20,
    angle: 30,
    gravity: 0.1
  }
];

/**
 * Get preset by ID
 */
export function getPreset(id: string): PhysicsPreset | undefined {
  return PHYSICS_PRESETS.find(p => p.id === id);
}

/**
 * Find closest matching preset for given physics values
 */
export function findClosestPreset(
  speed: number,
  angle: number,
  gravity: number
): PhysicsPreset | null {
  let closestPreset: PhysicsPreset | null = null;
  let smallestDistance = Infinity;

  for (const preset of PHYSICS_PRESETS) {
    // Calculate distance in physics-space (normalized)
    const speedDiff = Math.abs(preset.speed - speed) / 50; // Normalize by max speed range
    const angleDiff = Math.abs(preset.angle - angle) / 90; // Normalize by max angle
    const gravityDiff = Math.abs(preset.gravity - gravity) / 30; // Normalize by max gravity range

    const distance = Math.sqrt(speedDiff ** 2 + angleDiff ** 2 + gravityDiff ** 2);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestPreset = preset;
    }
  }

  // Only return if reasonably close (threshold of 0.3)
  return smallestDistance < 0.3 ? closestPreset : null;
}

/**
 * Apply preset to physics state
 */
export interface PhysicsState {
  speed: number;
  angle: number;
  gravity: number;
}

export function applyPreset(presetId: string): PhysicsState | null {
  const preset = getPreset(presetId);
  if (!preset) return null;

  return {
    speed: preset.speed,
    angle: preset.angle,
    gravity: preset.gravity
  };
}

/**
 * Get recommended preset for a stage based on targets
 */
export function getRecommendedPreset(
  targetDistance: number,
  targetHeight: number
): PhysicsPreset {
  // Close targets (<30m)
  if (targetDistance < 30) {
    return PHYSICS_PRESETS[0]; // Gentle Lob
  }

  // Medium range (30-60m)
  if (targetDistance < 60) {
    return PHYSICS_PRESETS[1]; // Perfect Arc
  }

  // Long range (60m+)
  return PHYSICS_PRESETS[2]; // Laser Shot
}

/**
 * Calculate suggested physics for hitting a specific target
 */
export function calculateSuggestion(
  targetPosition: [number, number, number],
  launchHeight: number = 2,
  gravity: number = 9.81
): { speed: number; angle: number } | null {
  const [x, y, z] = targetPosition;
  const distance = Math.sqrt(x ** 2 + z ** 2);
  const heightDiff = y - launchHeight;

  // Use standard projectile motion equations
  // Try angle of 45° first (optimal for max range on flat ground)
  const angleRad = (45 * Math.PI) / 180;
  const tanAngle = Math.tan(angleRad);
  const cosAngle = Math.cos(angleRad);

  // v² = g * distance / (2 * cos²θ * (distance * tanθ - heightDiff))
  const numerator = gravity * distance;
  const denominator = 2 * cosAngle ** 2 * (distance * tanAngle - heightDiff);

  if (denominator <= 0) return null;

  const speedSquared = numerator / denominator;
  if (speedSquared <= 0) return null;

  const speed = Math.sqrt(speedSquared);

  return {
    speed: Math.round(speed * 10) / 10,
    angle: 45
  };
}
