"use client";

import { useGameStore } from "@/store/gameStore";
import { getMode, getStage } from "@/lib/gameConfig";

export default function TrainingHUD() {
  const {
    currentModeId,
    currentStageId,
    score,
    shotCount,
    timerRemaining,
    currentStreak,
    isRoundActive,
  } = useGameStore();

  if (!isRoundActive || !currentModeId || !currentStageId) {
    return null;
  }

  const mode = getMode(currentModeId);
  const stage = getStage(currentStageId);
  if (!mode || !stage) return null;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const shotsRemaining = currentModeId === "precision" ? Math.max(0, 5 - shotCount) : null;

  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none">
      <div className="bg-black/80 border border-[#1e40af] rounded-md p-3 min-w-[240px]">
        <div className="text-[#06b6d4] text-[11px] font-mono uppercase tracking-widest mb-2">
          MODE: {mode.label} • STAGE: {stage.label}
        </div>

        <div className="mb-2">
          <div className="text-gray-400 text-[10px] font-mono uppercase mb-1">Total Score</div>
          <div className="text-orange-400 text-3xl font-mono tabular-nums">{score}</div>
        </div>

        {currentModeId === "precision" && (
          <div className="mb-1">
            <div className="text-gray-400 text-[10px] font-mono uppercase mb-1">Shots Remaining</div>
            <div className="text-white text-lg font-mono tabular-nums">{shotsRemaining}</div>
          </div>
        )}

        {currentModeId === "timed" && (
          <div className="mb-1">
            <div className="text-gray-400 text-[10px] font-mono uppercase mb-1">Time Remaining</div>
            <div className={`text-lg font-mono tabular-nums ${timerRemaining < 10000 ? "text-orange-400" : "text-white"}`}>
              {formatTime(timerRemaining)}
            </div>
          </div>
        )}

        {currentStreak > 0 && (
          <div className="mt-2 pt-2 border-t border-[#1e40af]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-[#06b6d4] inline-block" />
              <div>
                <div className="text-gray-400 text-[10px] font-mono uppercase">Current Streak</div>
                <div className="text-[#06b6d4] text-lg font-mono tabular-nums">{currentStreak}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

