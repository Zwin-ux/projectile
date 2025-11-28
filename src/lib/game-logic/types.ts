import { ShotRecord } from '../telemetry/types';

export interface GameMode {
    id: string;
    name: string;
    description: string;
    rules: ScoringRule[];
    constraints: Constraint[];
}

export interface ScoringRule {
    id: string;
    evaluate: (shot: ShotRecord) => number;
}

export interface Constraint {
    id: string;
    description: string;
    check: (shot: ShotRecord) => boolean; // Returns true if constraint is met (passed)
}

export interface GameConfig {
    modes: GameMode[];
}
