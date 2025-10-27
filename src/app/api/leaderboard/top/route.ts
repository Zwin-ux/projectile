/**
 * Leaderboard Top Scores API Route
 * GET endpoint for fetching top scores with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import type { LeaderboardEntry } from '../submit/route';

// Import the shared leaderboard data
// TODO: Replace with real database query
// For now, we'll use a module-level shared array
// This won't persist across server restarts but works for development

// Shared storage reference (will be imported from a centralized store in production)
let leaderboardDataCache: LeaderboardEntry[] = [];

// Helper to access the shared data from the submit route
// In production, this would be a database query
function getLeaderboardData(): LeaderboardEntry[] {
  // TODO: Replace with database query
  // For development, this returns the module-level cache
  return leaderboardDataCache;
}

// Helper to sync with submit route (development only)
if (typeof global !== 'undefined') {
  if (!(global as any).leaderboardData) {
    (global as any).leaderboardData = [];
  }
  leaderboardDataCache = (global as any).leaderboardData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeId = searchParams.get('modeId');
    const stageId = searchParams.get('stageId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get all entries
    let entries = getLeaderboardData();

    // Filter by mode if specified
    if (modeId) {
      entries = entries.filter(e => e.modeId === modeId);
    }

    // Filter by stage if specified
    if (stageId) {
      entries = entries.filter(e => e.stageId === stageId);
    }

    // Sort by score (descending)
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    // Limit results
    const top = sorted.slice(0, limit);

    return NextResponse.json({ entries: top }, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
