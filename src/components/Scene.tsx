"use client";

import { useMemo, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Projectile, { type ProjectileType, ProjectileMemo } from "./Projectile";
import { solveShot } from "@/lib/simulation/solver";
import { TrajectoryPoint, SimulationResult } from "@/lib/simulation/types";
import ScenarioSelector from "./ScenarioSelector";
import { getScenario, DEFAULT_SCENARIO } from "@/lib/scenarioConfig";
import { checkSegmentHits } from "@/lib/hitDetection";
import { useGameStore } from "@/store/gameStore";
import { ParticleEffect, HitMarker, RingEffect } from "./HitEffects";
import { useScreenShake } from "@/hooks/useScreenShake";
import type { TargetSpec } from "@/lib/gameConfig";
import TrajectoryPreview, { PreviewTier, TrajectoryPreviewMemo } from "./TrajectoryPreview";
import { analyzeShot } from "@/lib/game-logic/feedback";
import TheoryMode from "./TheoryMode";
import { useTelemetryStore } from "@/lib/telemetry/store";
import Leaderboard from "./Leaderboard";
import { useChaos } from "@/hooks/useChaos";

export default function Scene() {
  const [currentScenarioId, setCurrentScenarioId] = useState(DEFAULT_SCENARIO);
  const scenario = useMemo(() => getScenario(currentScenarioId), [currentScenarioId]);

  const [speed, setSpeed] = useState(scenario.defaultPhysics.speed);
  const [angle, setAngle] = useState(scenario.defaultPhysics.angle);
  const [gravity, setGravity] = useState(9.81);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [projectileType, setProjectileType] = useState<ProjectileType>(scenario.recommendedProjectile);
  const [hitEffects, setHitEffects] = useState<Array<{ id: string; position: [number, number, number]; points: number; timestamp: number }>>([]);
  const [hitTargets, setHitTargets] = useState<Set<string>>(new Set());
  const [previewTier, setPreviewTier] = useState<PreviewTier>(1);
  const [feedback, setFeedback] = useState<string>("");

  // Drill State
  const [drillStep, setDrillStep] = useState<1 | 2 | 3>(1);
  const isDrillMode = currentScenarioId === 'basketball';

  // Theory Mode State
  const [showTheoryMode, setShowTheoryMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastShotRecord, setLastShotRecord] = useState<any>(null);

  // Chaos Mode
  const [isChaosMode, setIsChaosMode] = useState(false);
  const { chaosParams, generateChaos, resetChaos } = useChaos();

  const { registerHit, registerShot, score } = useGameStore();

  const resetToDefaults = () => {
    setSpeed(scenario.defaultPhysics.speed);
    setAngle(scenario.defaultPhysics.angle);
    setFeedback("");
    setDrillStep(1);
  };

  const simulationParams = useMemo(() => ({
    gravity: { x: 0, y: -gravity * chaosParams.gravityScale, z: 0 },
    wind: chaosParams.wind,
    dragCoefficient: 0.47,
    airDensity: 1.225,
    projectileArea: 0.01,
    projectileMass: 0.6,
    initialPosition: { x: 0, y: scenario.launchPoint.height, z: 0 },
    initialVelocity: {
      x: speed * Math.cos(angle * Math.PI / 180),
      y: speed * Math.sin(angle * Math.PI / 180),
      z: 0
    },
    timeStep: 0.01,
    maxTime: 100
  }), [speed, angle, gravity, scenario.launchPoint.height]);

  const handleFire = () => {
    // In Chaos Mode, generate new conditions for the NEXT shot (or this one? Let's do this one for surprise, or next one for planning?)
    // Plan says "Randomize initial conditions per shot".
    // If we do it here, the preview might not match if we don't update it.
    // Actually, for "Chaos", the preview should probably show the "Standard" path, but the actual shot is affected by wind/gravity?
    // Or should the preview update?
    // If preview updates, it's just "Dynamic Conditions Mode".
    // "Chaos" implies unpredictability.
    // Let's make the preview show the standard path (no wind/normal gravity) but the shot gets affected.
    // Wait, that might be too hard.
    // Let's stick to: Chaos parameters are set BEFORE the shot (maybe after the previous shot lands).

    // Better approach: Generate chaos when the previous shot completes, so the user has to adjust for the CURRENT visible conditions.
    // But for the very first shot?

    const result = solveShot(simulationParams);

    setTrajectory(result.trajectory);
    setLastResult(result);
    setIsAnimating(true);
    setHitTargets(new Set()); // Reset hit targets for new shot
    setFeedback(""); // Clear previous feedback

    // Register shot with telemetry
    const shotRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      modeId: isDrillMode ? 'drill' : 'practice',
      stageId: currentScenarioId,
      params: simulationParams,
      result: result,
      maxHeight: result.apex.position.y,
      range: result.impact.position.x,
      flightTime: result.impact.time,
      impactSpeed: Math.sqrt(result.impact.velocity.x ** 2 + result.impact.velocity.y ** 2 + result.impact.velocity.z ** 2),
      impactAngle: result.impact.angle,
      hit: false,
      score: 0
    };

    setLastShotRecord(shotRecord);
    (registerShot as any)(shotRecord);
  };

  const handleShotComplete = useCallback(() => {
    setIsAnimating(false);

    if (lastResult) {
      // Find closest target
      let closestTarget = scenario.targets[0];
      let minDist = Infinity;

      scenario.targets.forEach(t => {
        const dist = Math.abs(t.position[0] - lastResult.impact.position.x);
        if (dist < minDist) {
          minDist = dist;
          closestTarget = t;
        }
      });

      // Check if we actually hit anything (hitTargets set is updated during animation)
      const isHit = hitTargets.size > 0;

      // Create a temporary shot record for feedback analysis
      const shotForFeedback = {
        range: lastResult.impact.position.x,
        hit: isHit
      } as any;

      const msg = analyzeShot(shotForFeedback, { x: closestTarget.position[0], y: closestTarget.position[1], z: closestTarget.position[2] });
      setFeedback(msg);

      if (isChaosMode) {
        generateChaos();
      }
    }
  }, [lastResult, scenario.targets, hitTargets, isChaosMode, generateChaos]);

  // Convert scenario targets to TargetSpec format for hit detection
  const targetSpecs: TargetSpec[] = useMemo(() => {
    return scenario.targets.map(t => ({
      id: t.id.toString(),
      position: t.position,
      radius: 1.0, // Default radius for scenario targets
      points: 100 // Default points
    }));
  }, [scenario.targets]);

  const handleCheckHit = useCallback((prevPos: [number, number, number], currPos: [number, number, number]) => {
    const hits = checkSegmentHits(prevPos, currPos, targetSpecs);

    hits.forEach(hit => {
      // Only register each target once per shot
      if (!hitTargets.has(hit.targetId)) {
        setHitTargets(prev => new Set(prev).add(hit.targetId));
        registerHit(hit.targetId, hit.points);

        // Add visual effects
        const hitEffect = {
          id: `${hit.targetId}-${Date.now()}`,
          position: currPos,
          points: hit.points,
          timestamp: Date.now()
        };
        setHitEffects(prev => [...prev.slice(-9), hitEffect]); // Limit to 10 effects
      }
    });
  }, [targetSpecs, hitTargets, registerHit]);

  const removeHitEffect = useCallback((id: string) => {
    setHitEffects(prev => prev.filter(effect => effect.id !== id));
  }, []);

  const handlePositionUpdate = useCallback(() => { }, []);

  return (
    <div className="flex flex-col gap-6 md:flex-row w-full h-full">
      {/* Viewport */}
      <div className="flex-1 min-h-[400px] md:min-h-[520px] rounded-md border border-[#1e40af] overflow-hidden relative">
        <Canvas camera={{ position: scenario.camera.position as any, fov: scenario.camera.fov }}>
          <ScreenShakeWrapper />
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

          {/* Trajectory Preview */}
          {!isAnimating && (
            <TrajectoryPreviewMemo params={simulationParams} tier={previewTier} />
          )}

          {/* Projectile */}
          {trajectory.length > 0 && (
            <ProjectileMemo
              trajectoryPoints={trajectory}
              isAnimating={isAnimating}
              projectileType={projectileType}
              onComplete={handleShotComplete}
              onPositionUpdate={handlePositionUpdate}
              onCheckHit={handleCheckHit}
            />
          )}

          {/* Hit Effects */}
          {hitEffects.map(effect => (
            <group key={effect.id}>
              <ParticleEffect
                position={effect.position}
                color="#06b6d4"
                particleCount={15}
                onComplete={() => removeHitEffect(effect.id)}
              />
              <HitMarker
                position={effect.position}
                points={effect.points}
              />
              <RingEffect
                position={effect.position}
                color="#ffd700"
              />
            </group>
          ))}

          <OrbitControls enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* Feedback Overlay */}
        {feedback && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 border border-[#06b6d4] px-4 py-2 rounded-full">
            <span className="text-[#06b6d4] font-mono font-bold text-sm uppercase tracking-wider animate-pulse">
              {feedback}
            </span>
          </div>
        )}

        {/* Drill Overlay Instructions */}
        {isDrillMode && (
          <div className="absolute top-4 right-4 bg-black/80 border border-[#f59e0b] p-3 rounded-md max-w-[200px]">
            <div className="text-[#f59e0b] font-mono text-xs font-bold mb-1">DRILL MODE: STEP {drillStep}/3</div>
            <div className="text-gray-300 text-xs">
              {drillStep === 1 && "Speed is locked. Adjust ANGLE to hit targets."}
              {drillStep === 2 && "Angle is locked. Adjust SPEED to hit targets."}
              {drillStep === 3 && "Free control. Master the arc."}
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {/* Score */}
        <div className="border border-[#1e40af]/50 bg-black/60 backdrop-blur-md rounded-md p-4 text-center relative group shadow-[0_0_15px_rgba(30,64,175,0.2)]">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Score</div>
          <div className="text-4xl font-mono text-white drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{score}</div>
          <div className="text-[11px] text-gray-400 mt-1">Session total</div>

          {/* Export Controls - Visible on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <button
              onClick={() => {
                import("@/lib/telemetry/export").then(({ exportToCSV }) => {
                  const shots = useTelemetryStore.getState().history;
                  exportToCSV(shots);
                });
              }}
              className="px-1 py-0.5 text-[9px] font-mono border border-[#1e40af] text-gray-400 hover:text-[#06b6d4] hover:border-[#06b6d4] bg-black rounded"
              title="Export CSV"
            >
              CSV
            </button>
            <button
              onClick={() => {
                import("@/lib/telemetry/export").then(({ exportToJSON }) => {
                  const shots = useTelemetryStore.getState().history;
                  exportToJSON(shots);
                });
              }}
              className="px-1 py-0.5 text-[9px] font-mono border border-[#1e40af] text-gray-400 hover:text-[#06b6d4] hover:border-[#06b6d4] bg-black rounded"
              title="Export JSON"
            >
              JSON
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-1 py-0.5 text-[9px] font-mono border border-[#1e40af] text-gray-400 hover:text-[#06b6d4] hover:border-[#06b6d4] bg-black rounded"
              title="Leaderboard"
            >
              TOP
            </button>
          </div>
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
            setDrillStep(1); // Reset drill step on scenario change
          }}
          onImportScenario={(jsonContent) => {
            // Dynamic import to avoid circular dependencies if any
            Promise.all([
              import("@/lib/scenarioLoader"),
              import("@/lib/scenarioConfig")
            ]).then(([{ parseScenario }, { registerScenario }]) => {
              const customScenario = parseScenario(jsonContent);
              if (customScenario) {
                registerScenario(customScenario);
                setCurrentScenarioId(customScenario.id);
                setSpeed(customScenario.defaultPhysics.speed);
                setAngle(customScenario.defaultPhysics.angle);
                setProjectileType(customScenario.recommendedProjectile);
                setDrillStep(1);

                // If gravity is defined in the scenario, update it
                if (customScenario.environment.gravity !== undefined) {
                  setGravity(customScenario.environment.gravity);
                }
              }
            });
          }}
        />

        {/* Drill Controls (Only visible in Drill Mode) */}
        {isDrillMode && (
          <div className="border border-[#f59e0b] bg-black/40 rounded-md p-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#f59e0b] mb-2">Drill Progression</h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setDrillStep(step as 1 | 2 | 3)}
                  className={`flex-1 p-1 text-xs font-mono border rounded-md ${drillStep === step ? 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10' : 'border-[#1e40af] text-gray-400 hover:bg-white/5'
                    }`}
                >
                  Step {step}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theory Mode Toggle */}
        {lastResult && !isAnimating && (
          <button
            onClick={() => setShowTheoryMode(true)}
            className="w-full py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] rounded-md hover:bg-[#06b6d4]/10"
          >
            [ ENTER THEORY MODE ]
          </button>
        )}

        {/* Physics */}
        <div className={`border ${isChaosMode ? 'border-[#ef4444] bg-[#ef4444]/10' : 'border-[#1e40af] bg-black/40'} rounded-md p-4 transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-mono uppercase tracking-widest ${isChaosMode ? 'text-[#ef4444]' : 'text-[#1e40af]'}`}>
              {isChaosMode ? '⚠️ CHAOS PHYSICS ⚠️' : 'Physics'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newMode = !isChaosMode;
                  setIsChaosMode(newMode);
                  if (newMode) {
                    generateChaos();
                    useGameStore.setState({ score: useGameStore.getState().score }); // Hack to trigger shake
                  } else {
                    resetChaos();
                  }
                }}
                className={`px-2 py-1 text-[11px] font-mono border rounded transition-colors ${isChaosMode
                  ? 'border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/20'
                  : 'border-gray-600 text-gray-400 hover:text-white'
                  }`}
              >
                {isChaosMode ? '[ DISABLE ]' : '[ ENABLE CHAOS ]'}
              </button>
              <button
                onClick={resetToDefaults}
                className="px-2 py-1 text-[11px] font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
              >
                [ RESET ]
              </button>
            </div>
          </div>
        </div>

        {isChaosMode && (
          <div className="mb-3 p-2 border border-[#ef4444] bg-black/60 rounded text-center">
            <div className="text-[#ef4444] font-bold text-xs animate-pulse mb-1">
              {chaosParams.description}
            </div>
            <div className="text-[10px] text-gray-400 grid grid-cols-2 gap-2">
              <div>Wind: {chaosParams.wind.x.toFixed(1)}, {chaosParams.wind.z.toFixed(1)}</div>
              <div>Gravity: {chaosParams.gravityScale.toFixed(2)}x</div>
            </div>
          </div>
        )}

        {/* Speed */}
        <div className="mb-2">
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Speed: <span className="text-accent font-mono">{speed}</span> m/s
            {isDrillMode && drillStep === 1 && <span className="ml-2 text-[#f59e0b] text-[10px]">[LOCKED]</span>}
          </label>
          <input
            type="range"
            min={scenario.defaultPhysics.speedRange[0]}
            max={scenario.defaultPhysics.speedRange[1]}
            step="1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isAnimating || (isDrillMode && drillStep === 1)}
            className={`w-full slider ${isDrillMode && drillStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Angle */}
        <div className="mb-2">
          <label className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            Angle: <span className="text-accent font-mono">{angle}</span>°
            {isDrillMode && drillStep === 2 && <span className="ml-2 text-[#f59e0b] text-[10px]">[LOCKED]</span>}
          </label>
          <input
            type="range"
            min={scenario.defaultPhysics.angleRange[0]}
            max={scenario.defaultPhysics.angleRange[1]}
            step="1"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            disabled={isAnimating || (isDrillMode && drillStep === 2)}
            className={`w-full slider ${isDrillMode && drillStep === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
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


        {/* Preview Tier Selector */}
        <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Preview Tier</h3>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setPreviewTier(t as PreviewTier)}
                className={`flex-1 p-1 text-xs font-mono border rounded-md ${previewTier === t ? 'border-[#06b6d4] text-[#06b6d4] bg-[#06b6d4]/10' : 'border-[#1e40af] text-gray-400 hover:bg-white/5'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Fire / Reset */}
        <div className="flex gap-2">
          <button
            onClick={handleFire}
            disabled={isAnimating}
            className={`flex-1 px-3 py-3 text-sm font-mono border ${isAnimating ? 'border-[#1e40af] text-gray-500 cursor-not-allowed' : 'border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10'
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
              if (!lastResult) return <div className="text-gray-500 text-xs">No shot data</div>;
              return (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Max Height</span>
                    <span className="font-mono text-gray-100 font-medium">{lastResult.apex.position.y.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Range</span>
                    <span className="font-mono text-gray-100 font-medium">{lastResult.impact.position.x.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Flight Time</span>
                    <span className="font-mono text-gray-100 font-medium">{lastResult.impact.time.toFixed(2)} s</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div >

      {/* Theory Mode Overlay */}
      {
        showTheoryMode && lastShotRecord && (
          <TheoryMode
            shot={lastShotRecord}
            onClose={() => setShowTheoryMode(false)}
          />
        )
      }

      {/* Leaderboard Overlay */}
      {
        showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )
      }
    </div >
  );
}

/**
 * Wrapper component to provide screen shake functionality
 */
function ScreenShakeWrapper() {
  const { triggerShake } = useScreenShake();
  const { score } = useGameStore();
  const prevScoreRef = useState(score)[0];

  // Trigger shake when score changes
  if (score !== prevScoreRef) {
    triggerShake({ intensity: 0.5, duration: 0.2 });
  }

  return null;
}
