import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShotRecord, SessionStats } from './types';

interface TelemetryState {
    history: ShotRecord[];
    session: SessionStats;

    // Actions
    addShot: (shot: ShotRecord) => void;
    resetSession: () => void;
    clearHistory: () => void;
}

const initialSession: SessionStats = {
    totalShots: 0,
    totalHits: 0,
    totalScore: 0,
    accuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    startTime: Date.now(),
    lastShotTime: 0,
};

export const useTelemetryStore = create<TelemetryState>()(
    persist(
        (set, get) => ({
            history: [],
            session: initialSession,

            addShot: (shot: ShotRecord) => {
                const state = get();
                const newHistory = [shot, ...state.history].slice(0, 100); // Keep last 100 shots

                const newTotalShots = state.session.totalShots + 1;
                const newTotalHits = state.session.totalHits + (shot.hit ? 1 : 0);
                const newTotalScore = state.session.totalScore + shot.score;
                const newAccuracy = newTotalHits / newTotalShots;
                const newCurrentStreak = shot.hit ? state.session.currentStreak + 1 : 0;
                const newBestStreak = Math.max(newCurrentStreak, state.session.bestStreak);

                set({
                    history: newHistory,
                    session: {
                        ...state.session,
                        totalShots: newTotalShots,
                        totalHits: newTotalHits,
                        totalScore: newTotalScore,
                        accuracy: newAccuracy,
                        currentStreak: newCurrentStreak,
                        bestStreak: newBestStreak,
                        lastShotTime: shot.timestamp,
                    },
                });
            },

            resetSession: () => {
                set({
                    session: {
                        ...initialSession,
                        startTime: Date.now(),
                    },
                });
            },

            clearHistory: () => {
                set({ history: [] });
            },
        }),
        {
            name: 'parabola-telemetry',
        }
    )
);
