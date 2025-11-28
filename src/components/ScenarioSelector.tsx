"use client";

import { getAllScenarios } from "@/lib/scenarioConfig";

interface ScenarioSelectorProps {
  currentScenario: string;
  onSelectScenario: (scenarioId: string) => void;
  onImportScenario?: (jsonContent: string) => void;
  isAnimating?: boolean;
}

export default function ScenarioSelector({
  currentScenario,
  onSelectScenario,
  onImportScenario,
  isAnimating = false,
}: ScenarioSelectorProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="border border-[#1e40af] bg-black/40 rounded-md p-4">
      <h2 className="text-xs font-mono uppercase tracking-widest text-[#1e40af] mb-2">Scenario Selector</h2>

      <div className="grid grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario.id)}
            disabled={isAnimating}
            className={`p-3 rounded-md border text-left transition-colors ${currentScenario === scenario.id
              ? "border-[#06b6d4] bg-[#06b6d4]/10"
              : "border-[#1e40af] hover:bg-white/5"
              } ${isAnimating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 bg-[#06b6d4] inline-block" />
              <div className="flex-1">
                <div className="text-xs text-white font-semibold uppercase tracking-wide">{scenario.name}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{scenario.description}</p>

            {currentScenario === scenario.id && (
              <div className="mt-2 pt-2 border-t border-[#1e40af]">
                <p className="text-[11px] text-[#06b6d4] font-mono uppercase tracking-widest">Active</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="mt-3 p-3 bg-black/40 rounded-md border border-[#1e40af]">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#06b6d4] mb-1">Mode Summary</h3>
          <p className="text-xs text-gray-300 leading-relaxed mb-2">
            {scenarios.find((s) => s.id === currentScenario)?.longDescription}
          </p>
          <div className="text-xs text-gray-400">
            <span className="text-[#06b6d4] font-mono">Scoring:</span> {scenarios.find((s) => s.id === currentScenario)?.scoringInfo}
          </div>
        </div>
      )}

      {/* Import Button */}
      <div className="mt-3 pt-3 border-t border-[#1e40af]">
        <label className="flex items-center justify-center w-full p-2 text-xs font-mono border border-[#1e40af] border-dashed rounded-md text-gray-400 hover:text-[#06b6d4] hover:border-[#06b6d4] cursor-pointer transition-colors">
          <span>[ IMPORT SCENARIO ]</span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImportScenario) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const content = ev.target?.result as string;
                  onImportScenario(content);
                };
                reader.readAsText(file);
              }
              // Reset input
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
