/**
 * Leaderboard Submit API Route
 * POST endpoint for score submission
 */

import { NextRequest, NextResponse } from 'next/server';
import type { GameModeId, StageId } from '@/lib/gameConfig';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  modeId: GameModeId;
  stageId: StageId;
  score: number;
  accuracy: number;
  timestamp: string;
}

// TODO: Replace with real database (PostgreSQL, MongoDB, etc.)
// Using global for development to share data between routes
if (typeof global !== 'undefined') {
  if (!(global as any).leaderboardData) {
    (global as any).leaderboardData = [];
  }
}

function getLeaderboardData(): LeaderboardEntry[] {
  return (global as any).leaderboardData || [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, modeId, stageId, score, accuracy } = body;

    // Validation
    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    if (!modeId || !stageId) {
      return NextResponse.json(
        { error: 'Mode and stage are required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100) {
      return NextResponse.json(
        { error: 'Invalid accuracy' },
        { status: 400 }
      );
    }

    // Create entry
    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      playerName: playerName.trim().substring(0, 20),
      modeId,
      stageId,
      score,
      accuracy,
      timestamp: new Date().toISOString()
    };

    // Add to in-memory store
    getLeaderboardData().push(entry);

    return NextResponse.json({ ok: true, entry }, { status: 201 });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
