/**
 * Game Configuration for Parabola Target Challenge System
 * Defines game modes, stages, and target specifications
 */

export type GameModeId = 'precision' | 'timed';
export type StageId = 'beginner' | 'mid' | 'precision';

export interface TargetSpec {
  id: string;
  position: [number, number, number];
  radius: number;
  points: number;
}

export interface Stage {
  id: StageId;
  label: string;
  description: string;
  targets: TargetSpec[];
}

export interface GameMode {
  id: GameModeId;
  label: string;
  description: string;
  rules: {
    maxShots?: number;
    timeLimitMs?: number;
  };
}

export const modes: GameMode[] = [
  {
    id: 'precision',
    label: 'PRECISION',
    description: '5 shots. No timer. Make every shot count.',
    rules: {
      maxShots: 5
    }
  },
  {
    id: 'timed',
    label: 'TIMED',
    description: '30 seconds. Unlimited shots. Score as much as possible.',
    rules: {
      timeLimitMs: 30000
    }
  }
];

export const stages: Stage[] = [
  {
    id: 'beginner',
    label: 'Beginner Range',
    description: 'Close targets, large hit zones. Perfect for learning.',
    targets: [
      { id: 'b1', position: [20, 1.5, 0], radius: 2.5, points: 50 },
      { id: 'b2', position: [25, 1.5, -3], radius: 2.5, points: 50 },
      { id: 'b3', position: [30, 1.5, 3], radius: 2.5, points: 75 },
      { id: 'b4', position: [35, 2.0, 0], radius: 2.0, points: 100 },
      { id: 'b5', position: [40, 2.5, -2], radius: 2.0, points: 100 }
    ]
  },
  {
    id: 'mid',
    label: 'Mid Range',
    description: 'Medium distance, elevated targets. Test your arc control.',
    targets: [
      { id: 'm1', position: [50, 3.0, 0], radius: 1.5, points: 100 },
      { id: 'm2', position: [60, 4.0, -5], radius: 1.5, points: 125 },
      { id: 'm3', position: [65, 3.5, 5], radius: 1.5, points: 125 },
      { id: 'm4', position: [70, 5.0, 0], radius: 1.2, points: 150 },
      { id: 'm5', position: [80, 4.5, -3], radius: 1.2, points: 150 }
    ]
  },
  {
    id: 'precision',
    label: 'Precision High Arc',
    description: 'Far, tiny targets. Master-level challenge.',
    targets: [
      { id: 'p1', position: [100, 5.0, 0], radius: 0.8, points: 200 },
      { id: 'p2', position: [120, 6.0, -4], radius: 0.8, points: 250 },
      { id: 'p3', position: [130, 7.0, 4], radius: 0.8, points: 250 },
      { id: 'p4', position: [140, 8.0, 0], radius: 0.6, points: 300 },
      { id: 'p5', position: [150, 9.0, -2], radius: 0.6, points: 300 }
    ]
  }
];

export function getMode(id: GameModeId): GameMode | undefined {
  return modes.find(m => m.id === id);
}

export function getStage(id: StageId): Stage | undefined {
  return stages.find(s => s.id === id);
}
