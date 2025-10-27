'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { useState, useMemo, useCallback, useRef } from 'react';
import { generateTrajectory, flightStats, type TrajectoryPoint } from '@/lib/physics';
import * as THREE from 'three';
import Projectile, { type ProjectileType } from './Projectile';
import Target, { checkTargetHit } from './Target';
import BasketballHoop, { checkBasketballScore } from './targets/BasketballHoop';
import ShootingTarget, { checkShootingTargetHit } from './targets/ShootingTarget';
import SoccerGoal, { checkSoccerGoalScore } from './targets/SoccerGoal';
import ScenarioSelector from './ScenarioSelector';
import { getScenario, DEFAULT_SCENARIO } from '@/lib/scenarioConfig';

export default function Scene() {
  // Physics parameters
  const [speed, setSpeed] = useState(30);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);

  // Scenario state
  const [currentScenarioId, setCurrentScenarioId] = useState(DEFAULT_SCENARIO);
  const scenario = useMemo(() => getScenario(currentScenarioId), [currentScenarioId]);

  // Game state
  const [projectileType, setProjectileType] = useState<ProjectileType>(scenario.recommendedProjectile);
  const [isAnimating, setIsAnimating] = useState(false);
  const [score, setScore] = useState(0);
  const [hitTargets, setHitTargets] = useState<Set<number>>(new Set());
  const [scoredTargets, setScoredTargets] = useState<Map<number, { zone: string; points: number }>>(new Map());
  const [currentProjectilePos, setCurrentProjectilePos] = useState<TrajectoryPoint | null>(null);
  const previousProjectilePos = useRef<TrajectoryPoint | null>(null);
  const [lastHitScore, setLastHitScore] = useState<{ points: number; type: string } | null>(null);

  // Generate trajectory
  const trajectoryPoints = useMemo(() => {
    return generateTrajectory({ speed, angleDeg: angle, gravity });
  }, [speed, angle, gravity]);

  // Calculate stats
  const stats = useMemo(() => {
    return flightStats(trajectoryPoints);
  }, [trajectoryPoints]);

  // Trajectory line points
  const linePoints = useMemo(() => {
    return trajectoryPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
  }, [trajectoryPoints]);

  // Impact point
  const impactPoint = trajectoryPoints[trajectoryPoints.length - 1] || { x: 0, y: 0, z: 0 };

  // Change scenario handler
  const handleScenarioChange = useCallback((scenarioId: string) => {
    if (isAnimating) return;

    setCurrentScenarioId(scenarioId);
    const newScenario = getScenario(scenarioId);
    setProjectileType(newScenario.recommendedProjectile);
    setScore(0);
    setHitTargets(new Set());
    setScoredTargets(new Map());
    setLastHitScore(null);
  }, [isAnimating]);

  // Fire button handler
  const handleFire = useCallback(() => {
    setIsAnimating(true);
    setLastHitScore(null);
    previousProjectilePos.current = null;
  }, []);

  // Animation complete handler
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setCurrentProjectilePos(null);
    previousProjectilePos.current = null;
  }, []);

  // Update projectile position and check for hits
  const handleProjectileUpdate = useCallback((point: TrajectoryPoint) => {
    setCurrentProjectilePos(point);

    scenario.targets.forEach((target) => {
      if (hitTargets.has(target.id)) return;

      // Basketball hoop detection
      if (target.type === 'basketball-hoop' && previousProjectilePos.current) {
        const result = checkBasketballScore(
          point,
          previousProjectilePos.current,
          { position: target.position, radius: 0.2286 }
        );

        if (result.scored) {
          setHitTargets(prev => new Set([...prev, target.id]));
          setScore(prevScore => prevScore + result.points);
          setLastHitScore({ points: result.points, type: result.type });
          setScoredTargets(prev => new Map(prev).set(target.id, { zone: result.type, points: result.points }));
        }
      }

      // Shooting target detection
      if ((target.type === 'bullseye' || target.type === 'silhouette' || target.type === 'steel-plate')) {
        const result = checkShootingTargetHit(point, { position: target.position, type: target.type });

        if (result.hit) {
          setHitTargets(prev => new Set([...prev, target.id]));
          setScore(prevScore => prevScore + result.points);
          setLastHitScore({ points: result.points, type: result.zone });
          setScoredTargets(prev => new Map(prev).set(target.id, { zone: result.zone, points: result.points }));
        }
      }

      // Soccer goal detection
      if (target.type === 'soccer-goal') {
        const result = checkSoccerGoalScore(point, { position: target.position });

        if (result.scored) {
          setHitTargets(prev => new Set([...prev, target.id]));
          setScore(prevScore => prevScore + result.points);
          setLastHitScore({ points: result.points, type: result.zone });
          setScoredTargets(prev => new Map(prev).set(target.id, { zone: result.zone, points: result.points }));
        }
      }

      // Classic ring target detection (existing system)
      if (target.type === 'ring-target') {
        const result = checkTargetHit(point, target.position);
        if (result.hit) {
          setHitTargets(prev => new Set([...prev, target.id]));
          setScore(prevScore => prevScore + result.score);
          setLastHitScore({ points: result.score, type: 'hit' });
        }
      }
    });

    previousProjectilePos.current = point;
  }, [hitTargets, scenario.targets]);

  // Reset game
  const handleReset = useCallback(() => {
    setScore(0);
    setHitTargets(new Set());
    setScoredTargets(new Map());
    setIsAnimating(false);
    setCurrentProjectilePos(null);
    previousProjectilePos.current = null;
    setLastHitScore(null);
  }, []);

  // Projectile type descriptions
  const projectileInfo: Record<ProjectileType, { emoji: string; name: string; description: string }> = {
    basketball: { emoji: '🏀', name: 'Basketball', description: 'Bouncy and fun!' },
    cannonball: { emoji: '💣', name: 'Cannonball', description: 'Heavy and powerful' },
    bullet: { emoji: '🔫', name: 'Bullet', description: 'Fast and precise' },
    airplane: { emoji: '✈️', name: 'Paper Plane', description: 'Light and wobbly' },
  };

  // Get ground color based on scenario
  const groundColor = scenario.environment.groundColor;

  return (
    <div className="flex flex-col gap-6 md:flex-row w-full h-full">
      {/* 3D Viewport */}
      <div className="flex-1 min-h-[400px] md:min-h-[600px] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden relative">
        {/* Score Display Overlay */}
        {lastHitScore && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
            <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-2xl shadow-lg">
              +{lastHitScore.points} points! {lastHitScore.type.includes('swish') ? '🔥 SWISH!' : '🎯'}
            </div>
          </div>
        )}

        <Canvas
          camera={{ position: [60, 35, 90], fov: 50 }}
          style={{ background: '#0a0a0a' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />

          {/* Ground plane with scenario-specific color */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color={groundColor} />
          </mesh>

          {/* Grid helper */}
          <gridHelper args={[200, 40, '#333333', '#222222']} position={[0, 0.01, 0]} />

          {/* Launch point */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1, 1.5, 0.5, 16]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
          </mesh>

          {/* Render targets based on scenario */}
          {scenario.targets.map((target) => {
            const isHit = hitTargets.has(target.id);
            const scoreData = scoredTargets.get(target.id);

            if (target.type === 'basketball-hoop') {
              return (
                <BasketballHoop
                  key={target.id}
                  position={target.position}
                  distance={target.distance || 0}
                  label={target.label || ''}
                  isScored={isHit}
                />
              );
            }

            if (target.type === 'bullseye' || target.type === 'silhouette' || target.type === 'steel-plate') {
              return (
                <ShootingTarget
                  key={target.id}
                  position={target.position}
                  distance={target.distance || 0}
                  type={target.type as any}
                  isHit={isHit}
                  hitRing={scoreData?.points ? Math.floor(scoreData.points / 10) : undefined}
                />
              );
            }

            if (target.type === 'soccer-goal') {
              return (
                <SoccerGoal
                  key={target.id}
                  position={target.position}
                  isScored={isHit}
                  scoreZone={scoreData?.zone}
                />
              );
            }

            // Classic ring target (fallback)
            if (target.type === 'ring-target') {
              return (
                <Target
                  key={target.id}
                  position={target.position}
                  distance={target.distance || 0}
                  isHit={isHit}
                />
              );
            }

            return null;
          })}

          {/* Trajectory prediction line (only show when not animating) */}
          {!isAnimating && linePoints.length > 1 && (
            <Line
              points={linePoints}
              color="#3b82f6"
              lineWidth={1}
              transparent
              opacity={0.4}
              dashed
              dashSize={2}
              gapSize={1}
            />
          )}

          {/* Impact marker */}
          {!isAnimating && (
            <mesh position={[impactPoint.x, Math.max(0, impactPoint.y), impactPoint.z]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          )}

          {/* Animated Projectile */}
          {isAnimating && (
            <Projectile
              trajectoryPoints={trajectoryPoints}
              isAnimating={isAnimating}
              projectileType={projectileType}
              onComplete={handleAnimationComplete}
              onPositionUpdate={handleProjectileUpdate}
            />
          )}

          {/* Camera controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={30}
            maxDistance={180}
          />
        </Canvas>
      </div>

      {/* Control Panel */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        {/* Game Score */}
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl border border-yellow-500 p-6 text-center">
          <div className="text-sm font-medium text-yellow-100 mb-1">SCORE</div>
          <div className="text-5xl font-bold text-white">{score}</div>
          <div className="text-xs text-yellow-200 mt-2">
            Targets Hit: {hitTargets.size} / {scenario.targets.length}
          </div>
        </div>

        {/* Scenario Selector */}
        <ScenarioSelector
          currentScenario={currentScenarioId}
          onSelectScenario={handleScenarioChange}
          isAnimating={isAnimating}
        />

        {/* Projectile Selection */}
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-100 mb-4">Choose Projectile</h2>
          <div className="grid grid-cols-2 gap-3">
            {scenario.allowedProjectiles.map((type) => {
              const info = projectileInfo[type];
              return (
                <button
                  key={type}
                  onClick={() => setProjectileType(type)}
                  disabled={isAnimating}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    projectileType === type
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-neutral-700 hover:border-neutral-600'
                  } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-3xl mb-1">{info.emoji}</div>
                  <div className="text-xs font-semibold text-neutral-100">{info.name}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-3 text-center">
            {projectileInfo[projectileType].description}
          </p>
        </div>

        {/* Physics Controls */}
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-xl font-semibold text-neutral-100 mb-4">Physics Controls</h2>

          {/* Speed */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Speed: {speed} m/s
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Angle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Angle: {angle}°
            </label>
            <input
              type="range"
              min="5"
              max="85"
              step="1"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Gravity */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Gravity: {gravity.toFixed(2)} m/s²
            </label>
            <input
              type="range"
              min="0.5"
              max="30"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              disabled={isAnimating}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Fire Button */}
        <button
          onClick={handleFire}
          disabled={isAnimating}
          className={`w-full py-6 rounded-xl font-bold text-2xl transition-all ${
            isAnimating
              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isAnimating ? '🚀 FLYING...' : '🔥 FIRE!'}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 transition-all"
        >
          🔄 Reset Game
        </button>

        {/* Stats */}
        <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-100 mb-3">Trajectory Stats</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Max Height:</span>
              <span className="font-mono text-neutral-100">{stats.maxHeight} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Range:</span>
              <span className="font-mono text-neutral-100">{stats.range} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Flight Time:</span>
              <span className="font-mono text-neutral-100">{stats.flightTime} s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
