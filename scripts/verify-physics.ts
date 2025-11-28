import { solveShot } from '../src/lib/simulation/solver';
import { SimulationParams } from '../src/lib/simulation/types';

function runTest() {
    console.log('Running Physics Verification...');

    const params: SimulationParams = {
        gravity: { x: 0, y: -9.81, z: 0 },
        wind: { x: 0, y: 0, z: 0 },
        dragCoefficient: 0, // No drag for analytical comparison
        airDensity: 0,      // No air density
        projectileArea: 0.01,
        projectileMass: 1,
        initialPosition: { x: 0, y: 0, z: 0 },
        initialVelocity: {
            x: 10 * Math.cos(45 * Math.PI / 180),
            y: 10 * Math.sin(45 * Math.PI / 180),
            z: 0
        },
        timeStep: 0.01,
        maxTime: 100
    };

    const result = solveShot(params);

    // Analytical values for 45 deg, 10 m/s, g=9.81
    // Range = v^2 * sin(2*theta) / g = 100 * 1 / 9.81 = 10.1936
    // Max Height = v^2 * sin^2(theta) / 2g = 100 * 0.5 / 19.62 = 2.5484
    // Flight Time = 2 * v * sin(theta) / g = 20 * 0.707 / 9.81 = 1.441

    const expectedRange = 10.19;
    const expectedHeight = 2.55;
    const expectedTime = 1.44;

    const actualRange = result.impact.position.x;
    const actualHeight = result.apex.position.y;
    const actualTime = result.impact.time;

    console.log(`Range: Expected ~${expectedRange}, Actual ${actualRange.toFixed(2)}`);
    console.log(`Height: Expected ~${expectedHeight}, Actual ${actualHeight.toFixed(2)}`);
    console.log(`Time: Expected ~${expectedTime}, Actual ${actualTime.toFixed(2)}`);

    const rangeError = Math.abs(actualRange - expectedRange);
    const heightError = Math.abs(actualHeight - expectedHeight);

    if (rangeError < 0.1 && heightError < 0.1) {
        console.log('SUCCESS: Simulation matches analytical results within tolerance.');
    } else {
        console.error('FAILURE: Simulation deviates too much from analytical results.');
        process.exit(1);
    }
}

runTest();
