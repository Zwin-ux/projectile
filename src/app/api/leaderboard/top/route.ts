/**
 * Leaderboard Top Scores API Route
 * GET endpoint for fetching top scores with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeId = searchParams.get('modeId');
    const stageId = searchParams.get('stageId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    // Note: Vercel Postgres sql template literal handles parameterization safely
    // However, for dynamic WHERE clauses, we need to be careful or use a query builder.
    // For simplicity with standard sql tag, we'll fetch and filter or use basic logic.
    // Actually, let's write a proper query.

    let result;

    if (modeId && stageId) {
      result = await sql`
        SELECT id, player_name as "playerName", mode_id as "modeId", stage_id as "stageId", score, accuracy, created_at as "timestamp"
        FROM leaderboard
        WHERE mode_id = ${modeId} AND stage_id = ${stageId}
        ORDER BY score DESC
        LIMIT ${limit}
      `;
    } else {
      // Fallback if filters missing (though frontend usually sends them)
      result = await sql`
        SELECT id, player_name as "playerName", mode_id as "modeId", stage_id as "stageId", score, accuracy, created_at as "timestamp"
        FROM leaderboard
        ORDER BY score DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ entries: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
