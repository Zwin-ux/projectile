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
    <div className="bg-gray-900/50 rounded-panel border border-primary-800/40 p-5 shadow-panel">
      <h2 className="text-base font-bold text-gray-100 mb-3 tracking-tight">Game Mode</h2>

      <div className="grid grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario.id)}
            disabled={isAnimating}
            className={`p-3 rounded-lg border transition-all text-left ${
              currentScenario === scenario.id
                ? 'border-accent bg-accent/10 shadow-glow-sm'
                : 'border-gray-700 hover:border-gray-600'
            } ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{scenario.emoji}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-100">{scenario.name}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{scenario.description}</p>

            {currentScenario === scenario.id && (
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <p className="text-xs text-accent font-medium">Active</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-xs font-semibold text-gray-100 mb-1">About This Mode</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-2">
            {scenarios.find(s => s.id === currentScenario)?.longDescription}
          </p>
          <div className="text-xs text-gray-500">
            <strong className="text-gray-300">Scoring:</strong>{' '}
            {scenarios.find(s => s.id === currentScenario)?.scoringInfo}
          </div>
        </div>
      )}
    </div>
  );
}
