"use client";

/**
 * SceneWrapper - Handles URL params and loads appropriate stage
 * Wraps Scene component with custom stage support
 */

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import SceneWithCustomStages from "./SceneWithCustomStages";
import { getStageById } from "@/lib/stageStorage";
import type { CustomStage } from "@/types/customStage";

export default function SceneWrapper() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const customId = searchParams.get("custom");
  const [customStage, setCustomStage] = useState<CustomStage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customId) {
      const stage = getStageById(customId);
      setCustomStage(stage);
    }
    setLoading(false);
  }, [customId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-sm font-mono">Loading…</div>
      </div>
    );
  }

  if (customId && !customStage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center border border-[#1e40af] bg-black/40 rounded-md p-6">
          <h2 className="text-white text-base font-semibold mb-1">Stage Not Found</h2>
          <p className="text-gray-400 text-sm">This custom stage could not be loaded.</p>
        </div>
      </div>
    );
  }

  return <SceneWithCustomStages customStage={customStage} initialScenarioId={mode || undefined} />;
}

