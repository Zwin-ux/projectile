"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { generateTrajectory, flightStats, type TrajectoryPoint } from "@/lib/physics";
import Projectile, { type ProjectileType } from "./Projectile";
import type { CustomStage } from "@/types/customStage";
import OfficialScene from "./Scene";

interface SceneProps {
  customStage?: CustomStage | null;
  initialScenarioId?: string;
}

export default function SceneWithCustomStages({ customStage }: SceneProps) {
  const [speed, setSpeed] = useState(customStage?.defaultPhysics.speed ?? 30);
  const [angle, setAngle] = useState(customStage?.defaultPhysics.angle ?? 45);
  const [gravity, setGravity] = useState(customStage?.environment.customGravity ?? 9.81);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [projectileType, setProjectileType] = useState<ProjectileType>(customStage?.recommendedProjectile ?? 'basketball');
  
  if (!customStage) return <OfficialScene />;

  const handleFire = () => {
    const points = generateTrajectory(
      { speed, angleDeg: angle, gravity },
      0.02,
      100,
      customStage.launchPoint.height
    );
    setTrajectory(points);
    setIsAnimating(true);
  };
  const reset = () => {
    setSpeed(customStage.defaultPhysics.speed);
    setAngle(customStage.defaultPhysics.angle);
    setTrajectory([]);
    setIsAnimating(false);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row w-full h-full">
      {/* Viewport */}
      <div className="flex-1 min-h-[400px] md:min-h-[520px] rounded-md border border-[#1e40af] overflow-hidden">
        <Canvas camera={{ position: customStage.camera.position as any, fov: customStage.camera.fov }}>
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[300, 300]} />
            <meshStandardMaterial color={customStage.environment.groundColor} />
          </mesh>

          {/* Targets */}
          {customStage.targets.map((t) => (
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
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Physics</h3>
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Speed: <span className="text-accent font-mono">{speed}</span> m/s
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full slider"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Angle: <span className="text-accent font-mono">{angle}</span>°
            </label>
            <input
              type="range"
              min={0}
              max={90}
              step="1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full slider"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Gravity: <span className="text-accent font-mono">{gravity.toFixed(2)}</span> m/sÂ²
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


        {/* Projectile */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Projectile</h3>
          <div className="grid grid-cols-2 gap-2">
            {customStage.allowedProjectiles.map((p) => (
              <button
                key={p}
                onClick={() => setProjectileType(p)}
                disabled={isAnimating}
                className={`p-2 text-xs font-mono border rounded-md text-left ${
                  projectileType === p ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10' : 'border-[#1e40af] text-gray-200 hover:bg-white/5'
                } ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>        <div className="flex gap-2">
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
            onClick={reset}
            className="flex-1 px-3 py-3 text-sm font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
          >
            [ RESET ]
          </button>
        </div>

        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Trajectory Stats</h3>
          {(() => {
  const s = flightStats(trajectory);
            return (
              <div className="space-y-2 text-sm">
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
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}







