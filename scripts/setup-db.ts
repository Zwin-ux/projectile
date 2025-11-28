import { sql } from '@vercel/postgres';

async function main() {
    try {
        console.log('Creating leaderboard table...');
        await sql`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id UUID PRIMARY KEY,
        player_name VARCHAR(255) NOT NULL,
        mode_id VARCHAR(50) NOT NULL,
        stage_id VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        accuracy FLOAT NOT NULL,
        replay_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('✅ Leaderboard table created successfully.');
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

main();
