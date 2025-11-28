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
    gravity?: number;
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
    name: 'Arc Elevation Drill',
    emoji: '',
    description: 'Shot calibration at increasing distance intervals.',
    longDescription: 'Evaluate arc behavior at increasing distances and launch angles. Focus on consistent release height and trajectory control.',
    environment: {
      ground: 'hardwood',
      lighting: 'indoor',
      groundColor: '#8B4513'
    },
    camera: {
      position: [25, 8, 40],
      lookAt: [25, 10, 0],
      fov: 55
    },
    launchPoint: {
      height: 2.0,
      description: 'Launch height: 2.0 m'
    },
    defaultPhysics: {
      speed: 12,
      angle: 50,
      speedRange: [8, 20],
      angleRange: [30, 70]
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
    name: 'Plate Test',
    emoji: '',
    description: 'Static plates. Accuracy evaluation.',
    longDescription: 'Paper and steel plates at fixed lanes. Precision scoring across varying distances.',
    environment: {
      ground: 'concrete',
      lighting: 'outdoor',
      groundColor: '#8B7355'
    },
    camera: {
      position: [5, 1.7, 8],
      lookAt: [40, 1.5, 0],
      fov: 50
    },
    launchPoint: {
      height: 1.7,
      description: 'Standing launch height: 1.7 m'
    },
    defaultPhysics: {
      speed: 300,
      angle: 2,
      speedRange: [100, 400],
      angleRange: [0, 15]
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
    name: 'Low-Angle Trajectory Drill',
    emoji: '',
    description: 'Ground-level shots to varying goal distances.',
    longDescription: 'Low launch height. Evaluate low-angle trajectories and range control to fixed goals.',
    environment: {
      ground: 'grass',
      lighting: 'outdoor',
      groundColor: '#2d5016'
    },
    camera: {
      position: [15, 3, 20],
      lookAt: [30, 2, 0],
      fov: 60
    },
    launchPoint: {
      height: 0.2,
      description: 'Ground-level launch height: 0.2 m'
    },
    defaultPhysics: {
      speed: 25,
      angle: 15,
      speedRange: [10, 35],
      angleRange: [5, 35]
    },
    targets: [
      { id: 1, type: 'soccer-goal', position: [20, 0, 0], distance: 20 },
      { id: 2, type: 'soccer-goal', position: [30, 0, -10], distance: 30 },
      { id: 3, type: 'soccer-goal', position: [40, 0, 10], distance: 40 },
      { id: 4, type: 'soccer-goal', position: [50, 0, 0], distance: 50 }
    ],
    recommendedProjectile: 'soccerball',
    allowedProjectiles: ['soccerball'],
    scoringInfo: 'Top Corner: 200pts | Upper 90: 150pts | Side Net: 125pts | Low Corner: 100pts | Center: 50pts'
  },

  classic: {
    id: 'classic',
    name: 'Classic Targets',
    emoji: '',
    description: 'Ring targets at fixed range intervals.',
    longDescription: 'Standard range layout for baseline trajectory testing across defined distances.',
    environment: {
      ground: 'astroturf',
      lighting: 'outdoor',
      groundColor: '#1a1a1a'
    },
    camera: {
      position: [60, 35, 90],
      lookAt: [50, 0, 0],
      fov: 50
    },
    launchPoint: {
      height: 0.5,
      description: 'Standard launch height: 0.5 m'
    },
    defaultPhysics: {
      speed: 30,
      angle: 45,
      speedRange: [10, 100],
      angleRange: [5, 85]
    },
    targets: [
      { id: 1, type: 'ring-target', position: [30, 0, 0], distance: 30 },
      { id: 2, type: 'ring-target', position: [50, 0, 0], distance: 50 },
      { id: 3, type: 'ring-target', position: [75, 0, 0], distance: 75 },
      { id: 4, type: 'ring-target', position: [100, 0, 0], distance: 100 }
    ],
    recommendedProjectile: 'basketball',
    allowedProjectiles: ['basketball', 'cannonball', 'soccerball'],
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

export function registerScenario(scenario: Scenario) {
  SCENARIOS[scenario.id] = scenario;
}

