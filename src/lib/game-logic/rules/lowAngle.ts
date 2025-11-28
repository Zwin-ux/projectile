import { Constraint, ScoringRule } from '../types';
import { ShotRecord } from '../../telemetry/types';

export const LowAngleConstraint: Constraint = {
    id: 'low-angle-ceiling',
    description: 'Projectile must stay below the ceiling height.',
    check: (shot: ShotRecord) => {
        // Assuming the ceiling height is defined in the stage config or passed via context
        // For now, let's hardcode or assume it's in the shot params (we might need to extend params)
        // Or we can check if the shot.maxHeight exceeds a threshold.

        // Let's assume a standard ceiling of 15m for "Low Angle" mode for now.
        const CEILING_HEIGHT = 15;
        return shot.maxHeight <= CEILING_HEIGHT;
    },
};

export const LowAngleScoring: ScoringRule = {
    id: 'low-angle-score',
    evaluate: (shot: ShotRecord) => {
        // Score is higher for lower apices (riskier)
        // Base score 100
        // Bonus = (Ceiling - MaxHeight) * 10
        const CEILING_HEIGHT = 15;
        const bonus = Math.max(0, (CEILING_HEIGHT - shot.maxHeight) * 10);
        return 100 + bonus;
    },
};
