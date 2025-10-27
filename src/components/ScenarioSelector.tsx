'use client';

import { getAllScenarios, Scenario } from '@/lib/scenarioConfig';

interface ScenarioSelectorProps {
  currentScenario: string;
  onSelectScenario: (scenarioId: string) => void;
  isAnimating?: boolean;
}

export default function ScenarioSelector({
  currentScenario,
  onSelectScenario,
  isAnimating = false
}: ScenarioSelectorProps) {
  const scenarios = getAllScenarios();

  return (
    <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-6">
      <h2 className="text-xl font-semibold text-neutral-100 mb-4">Game Mode</h2>

      <div className="grid grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario.id)}
            disabled={isAnimating}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              currentScenario === scenario.id
                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
            } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{scenario.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-neutral-100">{scenario.name}</div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{scenario.description}</p>

            {currentScenario === scenario.id && (
              <div className="mt-2 pt-2 border-t border-neutral-700">
                <p className="text-xs text-blue-400">✓ Currently Playing</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="mt-4 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-100 mb-2">About This Mode</h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            {scenarios.find(s => s.id === currentScenario)?.longDescription}
          </p>
          <div className="text-xs text-neutral-500">
            <strong className="text-neutral-300">Scoring:</strong>{' '}
            {scenarios.find(s => s.id === currentScenario)?.scoringInfo}
          </div>
        </div>
      )}
    </div>
  );
}
