/**
 * Leaderboard Submit API Route
 * POST endpoint for score submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

// Validation schema
const submitSchema = z.object({
  playerName: z.string().min(1).max(50),
  modeId: z.string(),
  stageId: z.string(),
  score: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  replayData: z.array(z.object({
    p: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    v: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    t: z.number()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = submitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { playerName, modeId, stageId, score, accuracy, replayData } = result.data;
    const id = crypto.randomUUID();

    // Insert into Vercel Postgres
    // Note: We use JSON.stringify for replayData if it exists
    await sql`
      INSERT INTO leaderboard (id, player_name, mode_id, stage_id, score, accuracy, replay_data)
      VALUES (${id}, ${playerName}, ${modeId}, ${stageId}, ${score}, ${accuracy}, ${replayData ? JSON.stringify(replayData) : null})
    `;

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
