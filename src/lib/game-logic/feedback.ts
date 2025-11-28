import { ShotRecord } from "@/lib/telemetry/types";

export function generateFeedback(shot: ShotRecord): string {
    if (shot.hit) {
        return "Direct Hit! Perfect shot.";
    }

    // Check for Low Angle constraint violation
    // This assumes we have access to the constraint result, but currently it's embedded in the score or not explicitly stored as a failure reason in ShotRecord.
    // We might need to infer it or update ShotRecord to include 'failureReason'.
    // For now, let's infer from max height if we knew the limit, but we don't have the limit here easily without context.
    // So we'll focus on range misses.

    // We need the target distance to know if it was short or long.
    // The ShotRecord doesn't explicitly store the target distance, but we can infer it from the scenario or if we had a 'target' field.
    // In the current Scene, we check hits against multiple targets.
    // If we missed, which target were we aiming for?
    // Usually the one closest to the impact?

    // For Phase 2, let's assume a single primary target or just give generic feedback based on the last shot.
    // If we don't know the target, we can't say "short" or "long" relative to it.

    // However, the user requirement is "Missed short by X m".
    // This implies we know the target.
    // Let's update the function signature to accept a target position or distance.

    return "Shot completed.";
}

// Revised approach: We need the target to give meaningful feedback.
// We'll export a function that takes the shot and the target position.

export function analyzeShot(shot: ShotRecord, targetPosition: { x: number, y: number, z: number }): string {
    if (shot.hit) {
        return "Direct Hit! Perfect shot.";
    }

    const impactX = shot.range;
    const targetX = targetPosition.x;

    const diff = impactX - targetX;
    const absDiff = Math.abs(diff);

    if (absDiff < 0.5) {
        return "So close! Almost a hit.";
    }

    if (diff < 0) {
        return `Missed short by ${absDiff.toFixed(1)}m`;
    } else {
        return `Missed long by ${diff.toFixed(1)}m`;
    }
}
