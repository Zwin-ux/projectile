'use client';

/**
 * HomeScreen - Range Control Dashboard
 * Ballistic test range control surface
 */

import Link from 'next/link';
import { getAllScenarios, type Scenario } from '@/lib/scenarioConfig';
import { getStageLibrary } from '@/lib/stageStorage';

export default function HomeScreen() {
  const scenarios = getAllScenarios();
  const customStages = getStageLibrary();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Training Programs */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
                TRAINING PROGRAMS
              </h2>
              <div className="h-px bg-[#1e40af]"></div>
            </div>
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          </div>

          {/* Right Column: Session Stats */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#06b6d4] mb-1">
                SESSION STATS
              </h2>
              <div className="h-px bg-[#1e40af]"></div>
            </div>
            <div className="space-y-3">
              <StatPanel label="TOTAL SCORE" value="0" unit="PTS" />
              <StatPanel label="BEST STREAK" value="0" unit="HITS" />
              <StatPanel label="STAGES COMPLETED" value="0" unit="RUNS" />
              <StatPanel label="CUSTOM STAGES CREATED" value={customStages.length.toString()} unit="STAGES" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Scenario Card - Training program entry
 */
function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const metadata = getScenarioMetadata(scenario);
  
  return (
    <div className="bg-black/40 border border-[#1e40af] rounded-md p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-1">
            {metadata.name}
          </h3>
          <p className="text-xs text-gray-400">
            {metadata.objective}
          </p>
        </div>
        <div className="w-2 h-2 bg-[#06b6d4] flex-shrink-0 mt-1"></div>
      </div>
      
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-[#06b6d4] uppercase">TARGET PROFILE:</span>
          <span className="text-gray-300">{metadata.targetProfile}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-[#06b6d4] uppercase">MODE:</span>
          <span className="text-gray-300">{metadata.mode}</span>
        </div>
      </div>
      
      <Link
        href={`/play?mode=${scenario.id}`}
        className="inline-block px-3 py-2 text-xs font-mono border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
      >
        [ LAUNCH ]
      </Link>
    </div>
  );
}

/**
 * Get scenario metadata for display
 */
function getScenarioMetadata(scenario: Scenario) {
  const metadataMap: Record<string, { name: string; objective: string; targetProfile: string; mode: string }> = {
    basketball: {
      name: 'RANGE: ARC ELEVATION DRILL',
      objective: 'High-angle trajectory at increasing distance intervals.',
      targetProfile: 'ELEVATED / STATIC',
      mode: 'PRECISION'
    },
    shootingRange: {
      name: 'RANGE: FLAT TRAJECTORY TEST',
      objective: 'Near-horizontal ballistics. Center-mass accuracy evaluation.',
      targetProfile: 'STATIC PLATES',
      mode: 'PRECISION'
    },
    soccer: {
      name: 'RANGE: LOW-ANGLE TRAJECTORY DRILL',
      objective: 'Ground-level launch. Angular deviation assessment.',
      targetProfile: 'STATIC / ANGULAR',
      mode: 'PRECISION'
    },
    classic: {
      name: 'RANGE: CALIBRATION STANDARD',
      objective: 'Standard distance intervals. Baseline accuracy protocol.',
      targetProfile: 'STATIC / FIXED',
      mode: 'PRECISION'
    }
  };
  
  return metadataMap[scenario.id] || {
    name: 'RANGE: STANDARD PROTOCOL',
    objective: 'Target engagement at specified parameters.',
    targetProfile: 'STATIC',
    mode: 'PRECISION'
  };
}

/**
 * Stat Panel - Diagnostic readout
 */
function StatPanel({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-black/40 border border-[#1e40af] rounded-md p-3">
      <div className="text-[10px] font-mono text-[#06b6d4] uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-mono text-white font-bold">
          {value}
        </div>
        <div className="text-xs font-mono text-gray-500">
          {unit}
        </div>
      </div>
    </div>
  );
}
