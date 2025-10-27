'use client';

/**
 * TrainingMode Component
 * Main orchestration component for mode/stage selection and round management
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { modes, stages, getStage, type GameModeId, type StageId } from '@/lib/gameConfig';
import TrainingTarget from './TrainingTarget';
import TrainingHUD from './TrainingHUD';
import RoundSummary from './RoundSummary';
import LeaderboardPanel from './LeaderboardPanel';

export default function TrainingMode() {
  const { isRoundActive, currentModeId, startRound, tickTimer } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameModeId>('precision');
  const [selectedStage, setSelectedStage] = useState<StageId>('beginner');

  // Timer loop for TIMED mode
  const lastTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!isRoundActive || currentModeId !== 'timed') return;
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;
      tickTimer(deltaMs);
    }, 100);

    return () => clearInterval(interval);
  }, [isRoundActive, currentModeId, tickTimer]);

  // Reset timer reference when round starts
  useEffect(() => {
    if (isRoundActive) {
      lastTimeRef.current = Date.now();
    }
  }, [isRoundActive]);

  const handleStartRound = () => {
    startRound(selectedMode, selectedStage);
  };

  const currentStage = getStage(selectedStage);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isRoundActive ? (
          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#06b6d4] mb-3">
                SELECT MODE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 border rounded-md text-left transition-colors ${
                      selectedMode === mode.id
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                        : 'border-[#1e40af] bg-black/40 hover:border-[#06b6d4]/50'
                    }`}
                  >
                    <div className="text-sm font-mono font-bold text-white mb-1">
                      {mode.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {mode.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Selection */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#06b6d4] mb-3">
                SELECT STAGE
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    className={`p-4 border rounded-md text-left transition-colors ${
                      selectedStage === stage.id
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                        : 'border-[#1e40af] bg-black/40 hover:border-[#06b6d4]/50'
                    }`}
                  >
                    <div className="text-sm font-mono font-bold text-white mb-1">
                      {stage.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stage.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleStartRound}
                className="px-8 py-4 text-sm font-mono border-2 border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
              >
                [ START ROUND ]
              </button>
            </div>

            {/* Leaderboard */}
            <LeaderboardPanel />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 3D Viewport */}
            <div className="h-[500px] border border-[#1e40af] rounded-md overflow-hidden">
              <Canvas camera={{ position: [0, 10, 30], fov: 50 }}>
                <color attach="background" args={['#000000']} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                  <planeGeometry args={[300, 300]} />
                  <meshStandardMaterial color="#1a1a1a" />
                </mesh>

                {/* Targets */}
                {currentStage?.targets.map((target) => (
                  <TrainingTarget
                    key={target.id}
                    target={target}
                    isHit={false}
                  />
                ))}

                <OrbitControls />
              </Canvas>
            </div>

            {/* HUD */}
            <TrainingHUD />
          </div>
        )}

        {/* Round Summary Modal */}
        <RoundSummary />
      </div>
    </div>
  );
}
