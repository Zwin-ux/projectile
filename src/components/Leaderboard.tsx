"use client";

import { useMemo } from "react";
import { useTelemetryStore } from "@/lib/telemetry/store";
import { getScenario } from "@/lib/scenarioConfig";

interface LeaderboardProps {
    onClose: () => void;
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
    const history = useTelemetryStore((state) => state.history);

    // Aggregate scores by session or just show top shots?
    // Let's show top individual shots for now, as we don't strictly track "sessions" with IDs in the history array easily without grouping.
    // Actually, we can group by timestamp proximity or just show top shots.
    // The requirement says "Local Leaderboards". Let's do Top Shots by Score.

    const topShots = useMemo(() => {
        return [...history]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }, [history]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-black border border-[#1e40af] rounded-lg shadow-[0_0_50px_rgba(30,64,175,0.3)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-[#1e40af] flex justify-between items-center bg-[#1e40af]/10">
                    <h2 className="text-xl font-mono font-bold text-[#06b6d4] tracking-widest uppercase">
                        Local Leaderboard
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white font-mono text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {topShots.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 font-mono">
                            No shots recorded yet.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-mono text-gray-500 uppercase tracking-wider border-b border-[#1e40af]/30">
                                    <th className="p-2">Rank</th>
                                    <th className="p-2">Score</th>
                                    <th className="p-2">Scenario</th>
                                    <th className="p-2">Distance</th>
                                    <th className="p-2">Date</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {topShots.map((shot, index) => {
                                    const scenario = getScenario(shot.stageId);
                                    return (
                                        <tr key={shot.id} className="border-b border-[#1e40af]/10 hover:bg-white/5 transition-colors">
                                            <td className="p-2 text-[#06b6d4] font-bold">#{index + 1}</td>
                                            <td className="p-2 text-white font-bold">{shot.score}</td>
                                            <td className="p-2 text-gray-300">{scenario?.name || shot.stageId}</td>
                                            <td className="p-2 text-gray-400">{shot.range.toFixed(1)}m</td>
                                            <td className="p-2 text-gray-500 text-xs">
                                                {new Date(shot.timestamp).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#1e40af] bg-[#1e40af]/5 text-center">
                    <p className="text-xs text-gray-500 font-mono">
                        Top 10 shots recorded locally.
                    </p>
                </div>
            </div>
        </div>
    );
}
