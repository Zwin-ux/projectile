import { SimulationParams, SimulationResult } from '../simulation/types';

export interface ShotRecord {
    id: string;
    timestamp: number;
    modeId: string;
    stageId: string;

    // Inputs
    params: SimulationParams;

    // Outputs
    result: SimulationResult;

    // Derived Metrics
    maxHeight: number;
    range: number;
    flightTime: number;
    impactSpeed: number;
    impactAngle: number;

    // Outcome
    hit: boolean;
    score: number;
}

export interface SessionStats {
    totalShots: number;
    totalHits: number;
    totalScore: number;
    accuracy: number;
    currentStreak: number;
    bestStreak: number;
    startTime: number;
    lastShotTime: number;
}
