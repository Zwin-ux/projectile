"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { getAllStages } from "@/lib/stageStorage";

export default function Home() {
  const score = useGameStore((s) => s.score);
  const maxStreak = useGameStore((s) => s.maxStreak);

  const [customStageCount, setCustomStageCount] = useState(0);
  const [stagesCompleted, setStagesCompleted] = useState(0);
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [isBooted, setIsBooted] = useState(false);

  useEffect(() => {
    // Load local custom stage count (client only)
    try {
      const count = getAllStages().length;
      setCustomStageCount(count);
    } catch {
      setCustomStageCount(0);
    }
    // Placeholder: track completions in future via persistence
    setStagesCompleted(0);

    // Boot sequence animation
    const sequence = [
      "INITIALIZING SYSTEM...",
      "LOADING PHYSICS ENGINE...",
      "CALIBRATING SENSORS...",
      "ESTABLISHING UPLINK...",
      "SYSTEM READY."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setBootSequence(prev => [...prev, sequence[i]]);
        i++;
      } else {
        setIsBooted(true);
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const programs = useMemo(
    () => [
      {
        id: "classic",
        title: "RANGE: CLASSIC TARGETS",
        objective: "Static plates. Accuracy evaluation.",
        meta: [
          { label: "TARGET PROFILE", value: "STATIC" },
          { label: "MODE", value: "PRECISION (5 SHOTS)" },
        ],
        href: "/play?scenario=classic",
      },
      {
        id: "shootingRange",
        title: "RANGE: PLATE TEST",
        objective: "Paper and steel plates at set lanes.",
        meta: [
          { label: "TARGET PROFILE", value: "STATIC" },
          { label: "MODE", value: "PRECISION (5 SHOTS)" },
        ],
        href: "/play?scenario=shootingRange",
      },
      {
        id: "basketball",
        title: "ARC ELEVATION DRILL",
        objective: "Shot calibration at increasing distance intervals.",
        meta: [
          { label: "TARGET PROFILE", value: "ELEVATED" },
          { label: "MODE", value: "TRAJECTORY STUDY" },
        ],
        href: "/play?scenario=basketball",
      },
      {
        id: "soccer",
        title: "LOW-ANGLE TRAJECTORY DRILL",
        objective: "Ground-level shots to varying goal distances.",
        meta: [
          { label: "TARGET PROFILE", value: "LOW-ANGLE" },
          { label: "MODE", value: "PRECISION (5 SHOTS)" },
        ],
        href: "/play?scenario=soccer",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-black text-[#06b6d4] font-mono p-4 sm:p-8">
      <div className="max-w-7xl mx-auto border border-[#1e40af] p-6 min-h-[80vh] relative overflow-hidden">
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

        {/* Header */}
        <header className="border-b-2 border-[#1e40af] pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-2">
              PARABOLA<span className="text-[#06b6d4]">_OS</span>
            </h1>
            <div className="text-xs sm:text-sm text-[#1e40af] tracking-[0.2em] uppercase">
              Tactical Trajectory Trainer v0.9.2
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">SYS_STATUS</div>
            <div className="text-sm text-green-500 animate-pulse">ONLINE</div>
          </div>
        </header>

        {/* Boot Sequence / Main Content */}
        {!isBooted ? (
          <div className="space-y-2 font-mono text-sm text-green-500">
            {bootSequence.map((line, idx) => (
              <div key={idx}>{`> ${line}`}</div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left: Training Programs */}
            <section className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-[#06b6d4] animate-pulse"></div>
                <h2 className="text-sm font-bold tracking-widest text-white uppercase">
                  AVAILABLE_MODULES
                </h2>
              </div>

              <div className="space-y-4">
                {programs.map((p) => (
                  <article
                    key={p.id}
                    className="group border border-[#1e40af] bg-[#0a0a0a] hover:bg-[#1e40af]/10 transition-all duration-300 p-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] border border-[#06b6d4] px-1 text-[#06b6d4]">
                        RDY
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                      <div className="space-y-2">
                        <h3 className="text-white text-lg font-bold tracking-wide group-hover:text-[#06b6d4] transition-colors">
                          {`> ${p.title}`}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                          {p.objective}
                        </p>

                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {p.meta.map((m) => (
                            <div key={m.label} className="flex items-center gap-2">
                              <span className="text-[#1e40af] font-bold">::</span>
                              <span className="text-gray-500">{m.label}</span>
                              <span className="text-gray-300">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        <Link
                          href={p.href}
                          className="inline-block w-full sm:w-auto text-center px-6 py-3 text-xs font-bold border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4] hover:text-black transition-all uppercase tracking-wider"
                        >
                          Initialize
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Right: Session Stats */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 bg-[#f59e0b] animate-pulse"></div>
                <h2 className="text-sm font-bold tracking-widest text-white uppercase">
                  OPERATOR_METRICS
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  label="SCORE_ACCUM"
                  value={score}
                  highlight={score >= 500}
                  footer="PTS"
                />
                <StatBox
                  label="STREAK_MAX"
                  value={maxStreak}
                  highlight={maxStreak >= 5}
                  footer="HITS"
                />
                <StatBox
                  label="MODULES_CLR"
                  value={stagesCompleted}
                  highlight={false}
                  footer="COUNT"
                />
                <StatBox
                  label="CUSTOM_DATA"
                  value={customStageCount}
                  highlight={customStageCount >= 1}
                  footer="FILES"
                />
              </div>

              <div className="border border-[#1e40af] p-4 bg-[#0a0a0a] mt-8">
                <div className="text-xs text-[#1e40af] mb-2 uppercase tracking-widest">System Log</div>
                <div className="font-mono text-[10px] text-gray-500 space-y-1">
                  <div>[10:42:01] Connection established</div>
                  <div>[10:42:02] User profile loaded</div>
                  <div>[10:42:02] Physics engine initialized (v2.1)</div>
                  <div>[10:42:03] Ready for input...</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  footer,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  footer: string;
}) {
  return (
    <div className="border border-[#1e40af] bg-[#0a0a0a] p-4 hover:border-[#06b6d4] transition-colors group">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-[#06b6d4] transition-colors">
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <div
          className={
            "text-3xl font-black tracking-tighter " +
            (highlight ? "text-[#f59e0b]" : "text-white")
          }
        >
          {value}
        </div>
        <div className="text-[10px] text-gray-600 font-bold">{footer}</div>
      </div>
    </div>
  );
}
