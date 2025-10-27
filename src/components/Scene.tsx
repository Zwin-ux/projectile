"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Projectile, { type ProjectileType } from "./Projectile";
import { generateTrajectory, flightStats, type TrajectoryPoint } from "@/lib/physics";
import ScenarioSelector from "./ScenarioSelector";
import { getScenario, DEFAULT_SCENARIO } from "@/lib/scenarioConfig";

export default function Scene() {
  const [currentScenarioId, setCurrentScenarioId] = useState(DEFAULT_SCENARIO);
  const scenario = useMemo(() => getScenario(currentScenarioId), [currentScenarioId]);

  const [speed, setSpeed] = useState(scenario.defaultPhysics.speed);
  const [angle, setAngle] = useState(scenario.defaultPhysics.angle);
  const [gravity, setGravity] = useState(9.81);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [projectileType, setProjectileType] = useState<ProjectileType>(scenario.recommendedProjectile);

  const resetToDefaults = () => {
    setSpeed(scenario.defaultPhysics.speed);
    setAngle(scenario.defaultPhysics.angle);
  };

  const handleFire = () => {
    const points = generateTrajectory(
      { speed, angleDeg: angle, gravity },
      0.02,
      100,
      scenario.launchPoint.height
    );
    setTrajectory(points);
    setIsAnimating(true);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row w-full h-full">
      {/* Viewport */}
      <div className="flex-1 min-h-[400px] md:min-h-[520px] rounded-md border border-[#1e40af] overflow-hidden">
        <Canvas camera={{ position: scenario.camera.position as any, fov: scenario.camera.fov }}>
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[300, 300]} />
            <meshStandardMaterial color={scenario.environment.groundColor} />
          </mesh>

          {/* Simple target markers */}
          {scenario.targets.map((t) => (
            <mesh key={t.id} position={t.position as any}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.3} />
            </mesh>
          ))}

          {/* Projectile */}
          {trajectory.length > 0 && (
            <Projectile
              trajectoryPoints={trajectory}
              isAnimating={isAnimating}
              projectileType={projectileType}
              onComplete={() => setIsAnimating(false)}
              onPositionUpdate={() => {}}
            />
          )}

          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {/* Score */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Score</div>
          <div className="text-4xl font-mono text-white">0</div>
          <div className="text-[11px] text-gray-400 mt-1">Session total</div>
        </div>

        {/* Scenario selector */}
        <ScenarioSelector
          currentScenario={currentScenarioId}
          onSelectScenario={(id) => {
            setCurrentScenarioId(id);
            const s = getScenario(id);
            setSpeed(s.defaultPhysics.speed);
            setAngle(s.defaultPhysics.angle);
            setProjectileType(s.recommendedProjectile);
          }}
        />

        {/* Physics */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af]">Physics</h3>
            <button
              onClick={resetToDefaults}
              className="px-2 py-1 text-[11px] font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
            >
              [ RESET ]
            </button>
          </div>

          {/* Speed */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Speed: <span className="text-accent font-mono">{speed}</span> m/s
            </label>
            <input
              type="range"
              min={scenario.defaultPhysics.speedRange[0]}
              max={scenario.defaultPhysics.speedRange[1]}
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full slider"
            />
          </div>

          {/* Angle */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Angle: <span className="text-accent font-mono">{angle}</span>°
            </label>
            <input
              type="range"
              min={scenario.defaultPhysics.angleRange[0]}
              max={scenario.defaultPhysics.angleRange[1]}
              step="1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full slider"
            />
          </div>

          {/* Gravity */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Gravity: <span className="text-accent font-mono">{gravity.toFixed(2)}</span> m/s²
            </label>
            <input
              type="range"
              min={0.1}
              max={30}
              step={0.1}
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full slider"
            />
          </div>
        </div>

        {/* Fire / Reset */}
        <div className="flex gap-2">
          <button
            onClick={handleFire}
            disabled={isAnimating}
            className={`flex-1 px-3 py-3 text-sm font-mono border ${
              isAnimating ? 'border-[#1e40af] text-gray-500 cursor-not-allowed' : 'border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10'
            }`}
          >
            [ FIRE ]
          </button>
          <button
            onClick={() => { setTrajectory([]); setIsAnimating(false); resetToDefaults(); }}
            className="flex-1 px-3 py-3 text-sm font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
          >
            [ RESET ]
          </button>
        </div>


        {/* Projectile */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Projectile</h3>
          <div className="grid grid-cols-2 gap-2">
            {scenario.allowedProjectiles.map((p) => (
              <button
                key={p}
                onClick={() => setProjectileType(p)}
                disabled={isAnimating}
                className="p-2 text-xs font-mono border rounded-md text-left"
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>        {/* Stats */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Trajectory Stats</h3>
          <div className="space-y-2 text-sm">
            {(() => {
              const s = flightStats(trajectory);
              return (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Max Height</span>
                    <span className="font-mono text-gray-100 font-medium">{s.maxHeight} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Range</span>
                    <span className="font-mono text-gray-100 font-medium">{s.range} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Flight Time</span>
                    <span className="font-mono text-gray-100 font-medium">{s.flightTime} s</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}










