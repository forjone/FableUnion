CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pack_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  ending_id TEXT NOT NULL,
  ending_title TEXT NOT NULL,
  grade TEXT NOT NULL,
  turns INTEGER NOT NULL,
  final REAL NOT NULL,
  date INTEGER NOT NULL,
  ip TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scores_final ON scores (final DESC);
CREATE INDEX IF NOT EXISTS idx_scores_ip_date ON scores (ip, date);
