import { SimulationParams, SimulationResult, TrajectoryPoint, Vector3 } from './types';

const cloneVector = (v: Vector3): Vector3 => ({ ...v });

const addVector = (v1: Vector3, v2: Vector3): Vector3 => ({
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z,
});

const scaleVector = (v: Vector3, s: number): Vector3 => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
});

export function solveShot(params: SimulationParams): SimulationResult {
    const {
        gravity,
        wind,
        dragCoefficient,
        airDensity,
        projectileArea,
        projectileMass,
        initialPosition,
        initialVelocity,
        timeStep,
        maxTime,
    } = params;

    const trajectory: TrajectoryPoint[] = [];
    let currentPos = cloneVector(initialPosition);
    let currentVel = cloneVector(initialVelocity);
    let currentTime = 0;

    let apexHeight = -Infinity;
    let apexTime = 0;
    let apexPos = cloneVector(initialPosition);

    // Pre-calculate drag constant factor: 0.5 * rho * A * Cd
    const dragFactor = 0.5 * airDensity * projectileArea * dragCoefficient;

    while (currentTime <= maxTime) {
        // Record state
        trajectory.push({
            time: currentTime,
            position: cloneVector(currentPos),
            velocity: cloneVector(currentVel),
        });

        // Check for apex
        if (currentPos.y > apexHeight) {
            apexHeight = currentPos.y;
            apexTime = currentTime;
            apexPos = cloneVector(currentPos);
        }

        // Check for ground collision (simple y <= 0 check)
        // We check AFTER pushing the initial state, but for subsequent steps we check before pushing if we want to clamp?
        // Actually, let's simulate a step, then check.

        // Forces
        // Gravity is constant
        // Drag = -0.5 * rho * A * Cd * |v| * v
        // We need relative velocity to air (wind)
        const relVel = {
            x: currentVel.x - wind.x,
            y: currentVel.y - wind.y,
            z: currentVel.z - wind.z,
        };

        const speed = Math.sqrt(relVel.x * relVel.x + relVel.y * relVel.y + relVel.z * relVel.z);
        const dragForceMagnitude = dragFactor * speed * speed;

        // Drag direction is opposite to relative velocity
        // F_drag = -dragMagnitude * (relVel / speed)
        // a_drag = F_drag / mass

        let ax = gravity.x;
        let ay = gravity.y;
        let az = gravity.z;

        if (speed > 0.000001) {
            const dragForceScale = -dragForceMagnitude / speed;
            const dragForceX = dragForceScale * relVel.x;
            const dragForceY = dragForceScale * relVel.y;
            const dragForceZ = dragForceScale * relVel.z;

            ax += dragForceX / projectileMass;
            ay += dragForceY / projectileMass;
            az += dragForceZ / projectileMass;
        }

        // Semi-Implicit Euler Integration
        // 1. Update velocity
        currentVel.x += ax * timeStep;
        currentVel.y += ay * timeStep;
        currentVel.z += az * timeStep;

        // 2. Update position
        currentPos.x += currentVel.x * timeStep;
        currentPos.y += currentVel.y * timeStep;
        currentPos.z += currentVel.z * timeStep;

        currentTime += timeStep;

        // Ground collision check
        if (currentPos.y <= 0 && currentTime > 0) {
            // Linear interpolation to find exact impact time/pos
            // prevPos.y + (0 - prevPos.y) / (currentPos.y - prevPos.y) * ...
            // For now, just clamping to 0 and stopping is "good enough" for v1, 
            // but let's be slightly more precise by just using the last state as impact
            // or simply breaking here.

            // Let's add the final point at y=0 (approx)
            // Simple approach: just break, the last point in trajectory (next loop) would be underground.
            // So we add this "underground" point or clamp it?
            // Let's clamp the final point to y=0 for visual niceness

            const prevPos = trajectory[trajectory.length - 1].position;
            const fraction = (0 - prevPos.y) / (currentPos.y - prevPos.y);

            const impactTime = currentTime - timeStep + fraction * timeStep;
            const impactPos = {
                x: prevPos.x + (currentPos.x - prevPos.x) * fraction,
                y: 0,
                z: prevPos.z + (currentPos.z - prevPos.z) * fraction,
            };

            // We don't push the underground point. We push the impact point.
            trajectory.push({
                time: impactTime,
                position: impactPos,
                velocity: cloneVector(currentVel), // Velocity at impact
            });

            break;
        }
    }

    const lastPoint = trajectory[trajectory.length - 1];

    // Calculate impact angle
    // angle = atan2(vy, vx) (assuming 2D x-y plane for angle)
    // In 3D, it's angle with horizontal plane.
    // Horizontal speed = sqrt(vx^2 + vz^2)
    const hSpeed = Math.sqrt(lastPoint.velocity.x * lastPoint.velocity.x + lastPoint.velocity.z * lastPoint.velocity.z);
    const impactAngle = Math.atan2(Math.abs(lastPoint.velocity.y), hSpeed) * (180 / Math.PI);

    return {
        trajectory,
        impact: {
            time: lastPoint.time,
            position: lastPoint.position,
            velocity: lastPoint.velocity,
            angle: impactAngle,
        },
        apex: {
            time: apexTime,
            position: apexPos,
        },
    };
}
