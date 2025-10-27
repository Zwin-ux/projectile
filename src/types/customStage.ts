/**
 * Custom Stage Types for Stage Builder
 * Allows users to create, save, and share custom target layouts
 */

import type { ProjectileType } from '@/components/Projectile';

export type TargetBehavior = 'static' | 'orbit' | 'bounce-vertical' | 'bounce-horizontal';
export type GroundType = 'grass' | 'hardwood' | 'concrete' | 'sand' | 'moon' | 'lava';
export type GravityPreset = 'earth' | 'moon' | 'mars' | 'jupiter' | 'zero-g' | 'custom';

export interface CustomTarget {
  id: string;
  position: [number, number, number];
  radius: number;
  points: number;
  color: string;
  behavior: TargetBehavior;
  behaviorConfig?: {
    speed?: number;
    range?: number;
    centerPoint?: [number, number, number];
  };
  disappearOnHit: boolean;
  respawnTime?: number; // seconds, if disappearOnHit is true
}

export interface CustomStage {
  id: string;
  name: string;
  description: string;
  creator: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=Easy, 5=Expert
  parScore: number; // Score to beat

  // Environment
  environment: {
    groundType: GroundType;
    groundColor: string;
    gravityPreset: GravityPreset;
    customGravity?: number;
  };

  // Camera
  camera: {
    position: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };

  // Launch settings
  launchPoint: {
    height: number;
    description: string;
  };

  // Physics defaults
  defaultPhysics: {
    speed: number;
    angle: number;
    speedRange: [number, number];
    angleRange: [number, number];
  };

  // Targets
  targets: CustomTarget[];

  // Projectile settings
  recommendedProjectile: ProjectileType;
  allowedProjectiles: ProjectileType[];

  // Metadata
  created: string; // ISO date
  lastModified: string; // ISO date
  thumbnail?: string; // Base64 image or URL
  plays: number;
  averageScore: number;
  tags: string[]; // e.g., ['challenging', 'creative', 'beginner-friendly']
}

export interface StageLibraryEntry {
  id: string;
  name: string;
  creator: string;
  difficulty: number;
  parScore: number;
  thumbnail?: string;
  plays: number;
  averageScore: number;
  tags: string[];
  isFeatured: boolean;
  isOfficial: boolean;
}

// Predefined color palette for targets
export const TARGET_COLORS = [
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#ff6b35' },
  { name: 'Yellow', hex: '#fbbf24' },
  { name: 'Green', hex: '#10b981' }
];

// Gravity presets
export const GRAVITY_PRESETS: Record<GravityPreset, { value: number; label: string }> = {
  'earth': { value: 9.81, label: 'Earth (9.81 m/s²)' },
  'moon': { value: 1.62, label: 'Moon (1.62 m/s²)' },
  'mars': { value: 3.71, label: 'Mars (3.71 m/s²)' },
  'jupiter': { value: 24.79, label: 'Jupiter (24.79 m/s²)' },
  'zero-g': { value: 0.1, label: 'Zero Gravity (0.1 m/s²)' },
  'custom': { value: 9.81, label: 'Custom' }
};

// Default stage template
export const DEFAULT_CUSTOM_STAGE: Omit<CustomStage, 'id' | 'created' | 'lastModified'> = {
  name: 'Untitled Stage',
  description: 'A custom stage',
  creator: 'Anonymous',
  difficulty: 3,
  parScore: 500,
  environment: {
    groundType: 'grass',
    groundColor: '#2d5016',
    gravityPreset: 'earth'
  },
  camera: {
    position: [0, 10, 30],
    lookAt: [25, 5, 0],
    fov: 60
  },
  launchPoint: {
    height: 2.0,
    description: 'Standard launch height'
  },
  defaultPhysics: {
    speed: 25,
    angle: 45,
    speedRange: [10, 50],
    angleRange: [15, 75]
  },
  targets: [],
  recommendedProjectile: 'cannonball',
  allowedProjectiles: ['basketball', 'cannonball', 'bullet', 'soccerball', 'airplane'],
  plays: 0,
  averageScore: 0,
  tags: []
};
