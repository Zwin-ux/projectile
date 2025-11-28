import { ShotRecord } from '../telemetry/types';
import { GameMode } from './types';

export function calculateScore(shot: ShotRecord, mode: GameMode): number {
    if (!shot.hit) return 0;

    // Check all constraints
    for (const constraint of mode.constraints) {
        if (!constraint.check(shot)) {
            return 0; // Failed constraint = 0 score
        }
    }

    // Sum up all scoring rules
    let totalScore = 0;
    for (const rule of mode.rules) {
        totalScore += rule.evaluate(shot);
    }

    return Math.round(totalScore);
}
