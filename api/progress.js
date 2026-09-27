import { sql } from "@vercel/postgres";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS player_progress (
      player_id VARCHAR(64) PRIMARY KEY,
      level INTEGER DEFAULT 1,
      unlocked_runes TEXT DEFAULT '[]',
      high_score INTEGER DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const hasDb = Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

  if (req.method === "GET") {
    const { id = "guest" } = req.query;
    if (hasDb) {
      try {
        await ensureTable();
        const { rows } = await sql`
          SELECT * FROM player_progress WHERE player_id = ${id} LIMIT 1;
        `;
        return res.status(200).json({ progress: rows[0] || { player_id: id, level: 1, high_score: 0 } });
      } catch (err) {
        return res.status(200).json({ progress: { player_id: id, level: 1, high_score: 0 }, error: err.message });
      }
    }
    return res.status(200).json({ progress: { player_id: id, level: 1, high_score: 0 } });
  }

  if (req.method === "POST") {
    const { player_id = "guest", level = 1, unlocked_runes = "[]", high_score = 0 } = req.body || {};
    if (hasDb) {
      try {
        await ensureTable();
        const { rows } = await sql`
          INSERT INTO player_progress (player_id, level, unlocked_runes, high_score, updated_at)
          VALUES (${player_id}, ${level}, ${JSON.stringify(unlocked_runes)}, ${high_score}, CURRENT_TIMESTAMP)
          ON CONFLICT (player_id)
          DO UPDATE SET
            level = EXCLUDED.level,
            unlocked_runes = EXCLUDED.unlocked_runes,
            high_score = GREATEST(player_progress.high_score, EXCLUDED.high_score),
            updated_at = CURRENT_TIMESTAMP
          RETURNING *;
        `;
        return res.status(200).json({ success: true, progress: rows[0] });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
    return res.status(200).json({ success: true, progress: { player_id, level, high_score } });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
