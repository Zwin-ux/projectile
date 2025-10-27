"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { CustomStage, CustomTarget } from "@/types/customStage";
import { DEFAULT_CUSTOM_STAGE } from "@/types/customStage";
import { getStageById, saveStage, updateStage } from "@/lib/stageStorage";

type EditableStage = Omit<CustomStage, "id" | "created" | "lastModified"> & {
  id?: string;
};

export default function StageBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id") || undefined;

  const [stage, setStage] = useState<EditableStage>({
    ...DEFAULT_CUSTOM_STAGE,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }
    const existing = getStageById(editId);
    if (existing) {
      const { created, lastModified, ...rest } = existing;
      setStage(rest as EditableStage);
    }
    setLoading(false);
  }, [editId]);

  const handleAddTarget = () => {
    const newTarget: CustomTarget = {
      id: `t_${Date.now()}`,
      position: [25, 2, 0],
      radius: 1.5,
      points: 100,
      color: "#06b6d4",
      behavior: "static",
      disappearOnHit: false,
    };
    setStage((s) => ({ ...s, targets: [...s.targets, newTarget] }));
  };

  const handleRemoveTarget = (id: string) => {
    setStage((s) => ({ ...s, targets: s.targets.filter((t) => t.id !== id) }));
  };

  const saveCurrent = () => {
    if (!stage.name.trim()) return;
    if (stage.id) {
      updateStage(stage.id, stage as any);
    } else {
      const { id, created, lastModified, ...payload } = stage as any;
      const saved = saveStage(payload);
      setStage({ ...saved });
    }
  };

  const pageTitle = editId ? "Edit Custom Stage" : "New Custom Stage";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Toolbar */}
      <header className="bg-[#0a0a0a] border-b border-[#1e40af]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#1e40af]">{pageTitle}</div>
            <div className="text-[11px] text-gray-400">Configure targets and environment</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5"
            >
              [ EXIT ]
            </button>
            <button
              onClick={saveCurrent}
              className="px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
            >
              [ SAVE ]
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage Meta */}
        <section className="lg:col-span-1 border border-[#1e40af] bg-black/40 rounded-md p-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-3">Stage Metadata</h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Name</label>
              <input
                type="text"
                value={stage.name}
                onChange={(e) => setStage((s) => ({ ...s, name: e.target.value }))}
                className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#06b6d4]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Description</label>
              <textarea
                value={stage.description}
                onChange={(e) => setStage((s) => ({ ...s, description: e.target.value }))}
                className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm h-20 focus:outline-none focus:border-[#06b6d4]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Difficulty</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={stage.difficulty}
                  onChange={(e) => setStage((s) => ({ ...s, difficulty: Math.max(1, Math.min(5, Number(e.target.value))) as 1|2|3|4|5 }))}
                  className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Par Score</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={stage.parScore}
                  onChange={(e) => setStage((s) => ({ ...s, parScore: Number(e.target.value) }))}
                  className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Launch Height (m)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={stage.launchPoint.height}
                onChange={(e) => setStage((s) => ({ ...s, launchPoint: { ...s.launchPoint, height: Number(e.target.value) } }))}
                className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1.5 text-white text-sm"
              />
              <p className="text-[11px] text-gray-400 mt-1 font-mono">{stage.launchPoint.description}</p>
            </div>
          </div>
        </section>

        {/* Targets */}
        <section className="lg:col-span-2 border border-[#1e40af] bg-black/40 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#1e40af]">Targets</h2>
            <button onClick={handleAddTarget} className="px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10">[ ADD TARGET ]</button>
          </div>
          {stage.targets.length === 0 ? (
            <div className="text-gray-400 text-sm font-mono">No targets defined.</div>
          ) : (
            <div className="space-y-2">
              {stage.targets.map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-center border border-[#1e40af] rounded-md p-2 text-[12px]">
                  <div className="col-span-2 text-gray-300 font-mono truncate">{t.id}</div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-mono">X</label>
                    <input type="number" value={t.position[0]} onChange={(e) => updateTarget(stage, setStage, t.id, { position: [Number(e.target.value), t.position[1], t.position[2]] })} className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1 text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-mono">Y</label>
                    <input type="number" value={t.position[1]} onChange={(e) => updateTarget(stage, setStage, t.id, { position: [t.position[0], Number(e.target.value), t.position[2]] })} className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1 text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-mono">Z</label>
                    <input type="number" value={t.position[2]} onChange={(e) => updateTarget(stage, setStage, t.id, { position: [t.position[0], t.position[1], Number(e.target.value)] })} className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono">R</label>
                    <input type="number" min={0.3} step={0.1} value={t.radius} onChange={(e) => updateTarget(stage, setStage, t.id, { radius: Number(e.target.value) })} className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono">PTS</label>
                    <input type="number" min={0} step={25} value={t.points} onChange={(e) => updateTarget(stage, setStage, t.id, { points: Number(e.target.value) })} className="w-full bg-black/40 border border-[#1e40af] rounded px-2 py-1 text-white" />
                  </div>
                  <div className="text-right">
                    <button onClick={() => handleRemoveTarget(t.id)} className="px-3 py-2 text-xs font-mono border border-[#1e40af] text-gray-200 hover:bg-white/5">[ REMOVE ]</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function updateTarget(stage: EditableStage, setStage: React.Dispatch<React.SetStateAction<EditableStage>>, id: string, updates: Partial<CustomTarget>) {
  setStage((s) => ({
    ...s,
    targets: s.targets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  }));
}

