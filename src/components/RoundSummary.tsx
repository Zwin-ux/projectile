'use client';

/**
 * RoundSummary Component
 * Post-round modal with stats and leaderboard submission
 */

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getMode, getStage } from '@/lib/gameConfig';

export default function RoundSummary() {
  const { finalStats, currentModeId, currentStageId, resetRound } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!finalStats || !currentModeId || !currentStageId) {
    return null;
  }

  const mode = getMode(currentModeId);
  const stage = getStage(currentStageId);

  if (!mode || !stage) return null;

  const handleSubmit = async () => {
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          modeId: currentModeId,
          stageId: currentStageId,
          score: finalStats.score,
          accuracy: finalStats.accuracy
        })
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-[#1e40af] rounded-md max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-wide">
          ROUND COMPLETE
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {mode.label} - {stage.label}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/40 border border-[#1e40af] rounded-md p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
              SCORE
            </div>
            <div className="text-3xl font-mono text-white font-bold">
              {finalStats.score}
            </div>
          </div>

          <div className="bg-black/40 border border-[#1e40af] rounded-md p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
              ACCURACY
            </div>
            <div className="text-3xl font-mono text-white font-bold">
              {finalStats.accuracy}%
            </div>
          </div>

          <div className="bg-black/40 border border-[#1e40af] rounded-md p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
              HITS
            </div>
            <div className="text-3xl font-mono text-white font-bold">
              {finalStats.hits}
            </div>
          </div>

          <div className="bg-black/40 border border-[#1e40af] rounded-md p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
              SHOTS
            </div>
            <div className="text-3xl font-mono text-white font-bold">
              {finalStats.shots}
            </div>
          </div>
        </div>

        {/* Leaderboard Submission */}
        {!submitted ? (
          <div className="mb-6">
            <label className="block text-xs font-mono uppercase tracking-widest text-[#06b6d4] mb-2">
              SUBMIT TO LEADERBOARD
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter name"
                maxLength={20}
                className="flex-1 px-3 py-2 bg-black border border-[#1e40af] text-white text-sm font-mono focus:outline-none focus:border-[#06b6d4]"
              />
              <button
                onClick={handleSubmit}
                disabled={!playerName.trim() || isSubmitting}
                className="px-4 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : '[ SUBMIT ]'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-[#06b6d4]/10 border border-[#06b6d4] rounded-md">
            <p className="text-sm font-mono text-[#06b6d4]">
              Score submitted successfully
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={resetRound}
            className="flex-1 px-4 py-3 text-sm font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
          >
            [ CONTINUE ]
          </button>
        </div>
      </div>
    </div>
  );
}
