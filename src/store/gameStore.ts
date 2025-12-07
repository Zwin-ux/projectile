/**
 * Zustand Store for Parabola Target Challenge System
 * Manages game state, scoring, timer, and round lifecycle
 */

import { create } from 'zustand';
import type { GameModeId, StageId } from '@/lib/gameConfig';
import { ShotRecord } from '@/lib/telemetry/types';
import { useTelemetryStore } from '@/lib/telemetry/store';

export interface Hit {
  targetId: string;
  points: number;
  timestamp: number;
}

export interface FinalStats {
  score: number;
  accuracy: number;
  hits: number;
  shots: number;
  streak: number;
}

export const XP_THRESHOLDS = {
  ROOKIE: 0,
  GUNNER: 1000,
  SHARPSHOOTER: 5000,
  DEADEYE: 10000,
  MASTER: 25000
};

export function getRank(xp: number): { rank: string, next: number } {
  if (xp >= XP_THRESHOLDS.MASTER) return { rank: 'BALLISTICS MASTER', next: Infinity };
  if (xp >= XP_THRESHOLDS.DEADEYE) return { rank: 'DEADEYE', next: XP_THRESHOLDS.MASTER };
  if (xp >= XP_THRESHOLDS.SHARPSHOOTER) return { rank: 'SHARPSHOOTER', next: XP_THRESHOLDS.DEADEYE };
  if (xp >= XP_THRESHOLDS.GUNNER) return { rank: 'GUNNER', next: XP_THRESHOLDS.SHARPSHOOTER };
  return { rank: 'ROOKIE', next: XP_THRESHOLDS.GUNNER };
}

interface GameState {
  // Current round configuration
  currentModeId: GameModeId | null;
  currentStageId: StageId | null;

  // Round state
  isRoundActive: boolean;
  shotCount: number;
  timerRemaining: number; // milliseconds for TIMED mode

  // Scoring
  hits: Hit[];
  score: number;
  totalShotsFired: number;
  currentStreak: number;
  maxStreak: number;

  // Post-round
  finalStats: FinalStats | null;

  // Progression
  totalXp: number;
  rank: string;
  nextRankXp: number;

  // Actions
  startRound: (modeId: GameModeId, stageId: StageId) => void;
  registerShot: () => void;
  registerHit: (targetId: string, points: number) => void;
  tickTimer: (deltaMs: number) => void;
  endRound: () => void;
  resetRound: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentModeId: null,
  currentStageId: null,
  isRoundActive: false,
  shotCount: 0,
  timerRemaining: 0,
  hits: [],
  score: 0,
  totalShotsFired: 0,
  currentStreak: 0,
  maxStreak: 0,
  finalStats: null,

  // Load from local storage or default
  totalXp: typeof window !== 'undefined' ? Number(localStorage.getItem('parabola_xp') || 0) : 0,
  rank: 'ROOKIE',
  nextRankXp: 1000,

  startRound: (modeId: GameModeId, stageId: StageId) => {
    set({
      currentModeId: modeId,
      currentStageId: stageId,
      isRoundActive: true,
      shotCount: 0,
      timerRemaining: modeId === 'timed' ? 30000 : 0,
      hits: [],
      score: 0,
      totalShotsFired: 0,
      currentStreak: 0,
      maxStreak: 0,
      finalStats: null
    });
  },

  registerShot: (shot?: ShotRecord) => {
    const state = get();
    if (!state.isRoundActive) return;

    const newShotCount = state.shotCount + 1;
    const newTotalFired = state.totalShotsFired + 1;

    // Update telemetry if shot record is provided
    if (shot) {
      useTelemetryStore.getState().addShot(shot);
    }

    set({
      shotCount: newShotCount,
      totalShotsFired: newTotalFired,
      currentStreak: 0 // Miss breaks streak (will be updated if hit)
    });

    // Auto-end PRECISION mode when shots depleted
    if (state.currentModeId === 'precision' && newShotCount >= 5) {
      // Delay end to allow final shot to complete
      setTimeout(() => {
        const currentState = get();
        if (currentState.shotCount >= 5) {
          get().endRound();
        }
      }, 100);
    }
  },

  registerHit: (targetId: string, points: number) => {
    const state = get();
    if (!state.isRoundActive) return;

    const newHit: Hit = {
      targetId,
      points,
      timestamp: Date.now()
    };

    const newStreak = state.currentStreak + 1;
    const newMaxStreak = Math.max(newStreak, state.maxStreak);

    set({
      hits: [...state.hits, newHit],
      score: state.score + points,
      currentStreak: newStreak,
      maxStreak: newMaxStreak
    });
  },

  tickTimer: (deltaMs: number) => {
    const state = get();
    if (!state.isRoundActive || state.currentModeId !== 'timed') return;

    const newTime = Math.max(0, state.timerRemaining - deltaMs);
    set({ timerRemaining: newTime });

    // Auto-end TIMED mode when timer expires
    if (newTime <= 0) {
      get().endRound();
    }
  },

  endRound: () => {
    const state = get();
    if (!state.isRoundActive) return;

    const accuracy = state.totalShotsFired > 0
      ? Math.round((state.hits.length / state.totalShotsFired) * 100)
      : 0;

    // Update XP
    const newTotalXp = state.totalXp + state.score;
    const { rank, next } = getRank(newTotalXp);

    // Persist
    if (typeof window !== 'undefined') {
      localStorage.setItem('parabola_xp', newTotalXp.toString());
    }

    set({
      isRoundActive: false,
      totalXp: newTotalXp,
      rank,
      nextRankXp: next,
      finalStats: {
        score: state.score,
        accuracy,
        hits: state.hits.length,
        shots: state.totalShotsFired,
        streak: state.maxStreak
      }
    });
  },

  resetRound: () => {
    set({
      currentModeId: null,
      currentStageId: null,
      isRoundActive: false,
      shotCount: 0,
      timerRemaining: 0,
      hits: [],
      score: 0,
      totalShotsFired: 0,
      currentStreak: 0,
      maxStreak: 0,
      finalStats: null
    });
  }
}));
