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

    set({
      isRoundActive: false,
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
