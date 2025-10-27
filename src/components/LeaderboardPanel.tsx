"use client";

import { useState, useEffect } from 'react';
import { modes, stages, type GameModeId, type StageId } from '@/lib/gameConfig';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  modeId: GameModeId;
  stageId: StageId;
  score: number;
  accuracy: number;
  timestamp: string;
}

export default function LeaderboardPanel() {
  const [selectedMode, setSelectedMode] = useState<GameModeId>('precision');
  const [selectedStage, setSelectedStage] = useState<StageId>('beginner');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard/top?modeId=${selectedMode}&stageId=${selectedStage}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedMode, selectedStage]);

  return (
    <div className="border border-[#1e40af] bg-black/40 rounded-md p-4 min-w-[320px]">
      <h2 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-3">Top Scores</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Mode</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as GameModeId)}
            className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#06b6d4]"
          >
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Stage</label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as StageId)}
            className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#06b6d4]"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-6 text-sm font-mono">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-400 py-6 text-sm font-mono">No scores recorded.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-md border ${
                index === 0 ? 'border-orange-500/60 bg-orange-500/10' : 'border-[#1e40af] bg-black/30'
              }`}
            >
              <div className="w-8 text-center font-mono text-sm text-gray-400">#{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{entry.playerName}</div>
                <div className="text-gray-400 text-xs font-mono">{entry.accuracy}% accuracy</div>
              </div>
              <div className={`${index === 0 ? 'text-orange-400' : 'text-[#06b6d4]'} text-xl font-mono tabular-nums`}>
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

