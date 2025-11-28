export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SimulationParams {
  gravity: Vector3;
  wind: Vector3;
  dragCoefficient: number; // Simple linear drag for now
  airDensity: number;
  projectileArea: number;
  projectileMass: number;
  initialPosition: Vector3;
  initialVelocity: Vector3;
  timeStep: number; // e.g., 1/120
  maxTime: number;
}

export interface TrajectoryPoint {
  time: number;
  position: Vector3;
  velocity: Vector3;
}

export interface ImpactData {
  time: number;
  position: Vector3;
  velocity: Vector3;
  angle: number; // Impact angle in degrees relative to horizontal
}

export interface SimulationResult {
  trajectory: TrajectoryPoint[];
  impact: ImpactData;
  apex: {
    time: number;
    position: Vector3;
  };
}
