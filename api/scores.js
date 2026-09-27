import { sql } from "@vercel/postgres";

// In-memory fallback if POSTGRES_URL is not yet connected in Vercel
let memoryScores = [
  { id: 1, player_name: "Aura", score: 3200, crystals: 3, time_seconds: 45, created_at: new Date().toISOString() },
  { id: 2, player_name: "Kael", score: 2850, crystals: 3, time_seconds: 52, created_at: new Date().toISOString() },
  { id: 3, player_name: "Sombra", score: 2100, crystals: 2, time_seconds: 68, created_at: new Date().toISOString() },
];

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      player_name VARCHAR(50) NOT NULL,
      score INTEGER NOT NULL,
      crystals INTEGER NOT NULL,
      time_seconds INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const hasDb = Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

  if (req.method === "GET") {
    if (hasDb) {
      try {
        await ensureTable();
        const { rows } = await sql`
          SELECT id, player_name, score, crystals, time_seconds, created_at
          FROM scores
          ORDER BY score DESC, time_seconds ASC
          LIMIT 10;
        `;
        return res.status(200).json({ source: "vercel_postgres", scores: rows });
      } catch (err) {
        console.error("Postgres error:", err);
        return res.status(200).json({ source: "fallback_error", scores: memoryScores, error: err.message });
      }
    } else {
      return res.status(200).json({ source: "memory_fallback", scores: memoryScores });
    }
  }

  if (req.method === "POST") {
    try {
      const { player_name, score, crystals, time_seconds } = req.body || {};
      const cleanName = (player_name || "Explorador").slice(0, 30);
      const cleanScore = Math.max(0, parseInt(score, 10) || 0);
      const cleanCrystals = Math.max(0, parseInt(crystals, 10) || 0);
      const cleanTime = Math.max(1, parseInt(time_seconds, 10) || 1);

      if (hasDb) {
        await ensureTable();
        const { rows } = await sql`
          INSERT INTO scores (player_name, score, crystals, time_seconds)
          VALUES (${cleanName}, ${cleanScore}, ${cleanCrystals}, ${cleanTime})
          RETURNING id, player_name, score, crystals, time_seconds, created_at;
        `;
        return res.status(201).json({ success: true, source: "vercel_postgres", entry: rows[0] });
      } else {
        const newEntry = {
          id: Date.now(),
          player_name: cleanName,
          score: cleanScore,
          crystals: cleanCrystals,
          time_seconds: cleanTime,
          created_at: new Date().toISOString(),
        };
        memoryScores.push(newEntry);
        memoryScores.sort((a, b) => b.score - a.score || a.time_seconds - b.time_seconds);
        memoryScores = memoryScores.slice(0, 10);
        return res.status(201).json({ success: true, source: "memory_fallback", entry: newEntry });
      }
    } catch (err) {
      console.error("POST error:", err);
      return res.status(500).json({ error: "Failed to save score", details: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
