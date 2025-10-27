import { ProjectileType } from '@/components/Projectile';

export interface ScenarioTarget {
  id: number;
  type: string;
  position: [number, number, number];
  distance?: number;
  label?: string;
}

export interface Scenario {
  id: string;
  name: string;
  emoji: string;
  description: string;
  longDescription: string;
  environment: {
    ground: 'grass' | 'hardwood' | 'concrete' | 'indoor' | 'astroturf';
    lighting: 'outdoor' | 'indoor' | 'stadium';
    groundColor: string;
  };
  camera: {
    position: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };
  launchPoint: {
    height: number;
    description: string;
  };
  defaultPhysics: {
    speed: number;
    angle: number;
    speedRange: [number, number];
    angleRange: [number, number];
  };
  targets: ScenarioTarget[];
  recommendedProjectile: ProjectileType;
  allowedProjectiles: ProjectileType[];
  scoringInfo: string;
}

export const SCENARIOS: Record<string, Scenario> = {
  basketball: {
    id: 'basketball',
    name: 'Basketball Court',
    emoji: '🏀',
    description: 'Sink shots from various distances!',
    longDescription: 'Practice your basketball shooting skills! Start with free throws and work your way up to half-court shots. Get bonus points for swishes!',
    environment: {
      ground: 'hardwood',
      lighting: 'indoor',
      groundColor: '#8B4513'
    },
    camera: {
      position: [25, 8, 40],     // Lower camera, closer to player perspective
      lookAt: [25, 10, 0],        // Looking UP at hoop height (10 feet)
      fov: 55
    },
    launchPoint: {
      height: 2.0,                // 2 meters = chest/shoulder height
      description: 'Shooting from chest height'
    },
    defaultPhysics: {
      speed: 12,                  // 12 m/s = ~27 mph (realistic basketball shot)
      angle: 50,                  // High arc for swishes
      speedRange: [8, 20],        // Basketball throw range
      angleRange: [30, 70]        // Realistic shooting angles
    },
    targets: [
      { id: 1, type: 'basketball-hoop', position: [15, 0, 0], distance: 15, label: 'Free Throw' },
      { id: 2, type: 'basketball-hoop', position: [23.75, 0, 0], distance: 23.75, label: '3-Pointer' },
      { id: 3, type: 'basketball-hoop', position: [30, 0, 0], distance: 30, label: 'Deep Range' },
      { id: 4, type: 'basketball-hoop', position: [47, 0, 0], distance: 47, label: 'Half Court' }
    ],
    recommendedProjectile: 'basketball',
    allowedProjectiles: ['basketball'],
    scoringInfo: 'Free Throw: 50pts | 3-Pointer: 100pts | Deep: 200pts | Half Court: 500pts | Swish Bonus: +25pts'
  },

  shootingRange: {
    id: 'shootingRange',
    name: 'Shooting Range',
    emoji: '🔫',
    description: 'Hit bullseyes and steel plates!',
    longDescription: 'Test your marksmanship on paper targets and reactive steel plates. Score higher by hitting the center rings!',
    environment: {
      ground: 'concrete',
      lighting: 'outdoor',
      groundColor: '#8B7355'
    },
    camera: {
      position: [5, 1.7, 8],      // At shooter eye level, in firing position
      lookAt: [40, 1.5, 0],       // Looking STRAIGHT ahead at targets
      fov: 50
    },
    launchPoint: {
      height: 1.7,                // 1.7m = eye level standing
      description: 'Firing from standing position'
    },
    defaultPhysics: {
      speed: 300,                 // 300 m/s = ~670 mph (rifle velocity)
      angle: 2,                   // Nearly flat trajectory
      speedRange: [100, 400],     // Various rifle speeds
      angleRange: [0, 15]         // Flat shooting angles
    },
    targets: [
      { id: 1, type: 'bullseye', position: [25, 1.5, 0], distance: 25 },
      { id: 2, type: 'bullseye', position: [50, 1.5, 0], distance: 50 },
      { id: 3, type: 'silhouette', position: [40, 1.5, -5], distance: 40 },
      { id: 4, type: 'silhouette', position: [40, 1.5, 5], distance: 40 },
      { id: 5, type: 'steel-plate', position: [60, 1, -3], distance: 60 },
      { id: 6, type: 'steel-plate', position: [60, 1, 3], distance: 60 }
    ],
    recommendedProjectile: 'bullet',
    allowedProjectiles: ['bullet'],
    scoringInfo: '10-Ring: 100pts | Center Mass: 100pts | Headshot: 150pts | Steel Plate: 75pts'
  },

  soccer: {
    id: 'soccer',
    name: 'Soccer Goal',
    emoji: '⚽',
    description: 'Score goals from different angles!',
    longDescription: 'Become a goal-scoring legend! Aim for the corners to maximize your points. Top corners are worth the most!',
    environment: {
      ground: 'grass',
      lighting: 'outdoor',
      groundColor: '#2d5016'
    },
    camera: {
      position: [15, 3, 20],      // Low behind the kicker
      lookAt: [30, 2, 0],         // Looking at goal height from ground
      fov: 60
    },
    launchPoint: {
      height: 0.2,                // 20cm = ball on ground
      description: 'Kicking from ground level'
    },
    defaultPhysics: {
      speed: 25,                  // 25 m/s = ~56 mph (strong kick)
      angle: 15,                  // Low, driven shot
      speedRange: [10, 35],       // Kick strength range
      angleRange: [5, 35]         // Ground shots to chips
    },
    targets: [
      { id: 1, type: 'soccer-goal', position: [20, 0, 0], distance: 20 },
      { id: 2, type: 'soccer-goal', position: [30, 0, -10], distance: 30 },
      { id: 3, type: 'soccer-goal', position: [40, 0, 10], distance: 40 },
      { id: 4, type: 'soccer-goal', position: [50, 0, 0], distance: 50 }
    ],
    recommendedProjectile: 'basketball',
    allowedProjectiles: ['basketball', 'cannonball'],
    scoringInfo: 'Top Corner: 200pts | Upper 90: 150pts | Side Net: 125pts | Low Corner: 100pts | Center: 50pts'
  },

  classic: {
    id: 'classic',
    name: 'Classic Targets',
    emoji: '🎯',
    description: 'Original target practice mode!',
    longDescription: 'The original target practice experience with ring targets at various distances.',
    environment: {
      ground: 'astroturf',
      lighting: 'outdoor',
      groundColor: '#1a1a1a'
    },
    camera: {
      position: [60, 35, 90],     // Bird's eye view (original)
      lookAt: [50, 0, 0],
      fov: 50
    },
    launchPoint: {
      height: 0.5,                // Slight elevation
      description: 'Standard launch height'
    },
    defaultPhysics: {
      speed: 30,                  // Medium speed
      angle: 45,                  // Classic 45-degree angle
      speedRange: [10, 100],      // Full range
      angleRange: [5, 85]         // Full flexibility
    },
    targets: [
      { id: 1, type: 'ring-target', position: [30, 0, 0], distance: 30 },
      { id: 2, type: 'ring-target', position: [50, 0, 0], distance: 50 },
      { id: 3, type: 'ring-target', position: [75, 0, 0], distance: 75 },
      { id: 4, type: 'ring-target', position: [100, 0, 0], distance: 100 }
    ],
    recommendedProjectile: 'basketball',
    allowedProjectiles: ['basketball', 'cannonball', 'bullet', 'airplane'],
    scoringInfo: 'Bullseye: 100pts | Middle Ring: 50pts | Outer Ring: 25pts'
  }
};

export const DEFAULT_SCENARIO = 'classic';

export function getScenario(id: string): Scenario {
  return SCENARIOS[id] || SCENARIOS[DEFAULT_SCENARIO];
}

export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}
