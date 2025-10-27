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
    <div className="bg-black">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Training Programs */}
          <section className="lg:col-span-7">
            <h2 className="text-xs font-mono tracking-widest text-[#1e40af] uppercase mb-2">TRAINING PROGRAMS</h2>

            <div className="space-y-3">
              {programs.map((p) => (
                <article
                  key={p.id}
                  className="border border-[#1e40af] bg-black/40 rounded-md p-4 text-xs sm:text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="text-white text-sm sm:text-base font-semibold">
                        {p.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{p.objective}</p>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {p.meta.map((m) => (
                          <div key={m.label} className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-[#06b6d4] inline-block" />
                            <span className="text-[#06b6d4] font-mono tracking-wider">
                              {m.label}:
                            </span>
                            <span className="text-gray-300 font-mono">{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-start">
                      <Link
                        href={p.href}
                        className="px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
                      >
                        [ LAUNCH ]
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Right: Session Stats */}
          <aside className="lg:col-span-5">
            <h2 className="text-xs font-mono tracking-widest text-[#1e40af] uppercase mb-2">SESSION STATS</h2>

            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="TOTAL SCORE"
                value={score}
                highlight={score >= 500}
                footer="Accumulated points this session"
              />
              <StatBox
                label="BEST STREAK"
                value={maxStreak}
                highlight={maxStreak >= 5}
                footer="Consecutive hits without a miss"
              />
              <StatBox
                label="STAGES COMPLETED"
                value={stagesCompleted}
                highlight={false}
                footer="Completed rounds in this session"
              />
              <StatBox
                label="CUSTOM STAGES CREATED"
                value={customStageCount}
                highlight={customStageCount >= 1}
                footer="User-authored stages available locally"
              />
            </div>
          </aside>
        </div>
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
    <div className="border border-[#1e40af] bg-black/40 rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4]">{label}</div>
      <div
        className={
          "mt-1 font-mono text-2xl md:text-3xl " +
          (highlight ? "text-orange-400" : "text-white")
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-gray-400">{footer}</div>
    </div>
  );
}

