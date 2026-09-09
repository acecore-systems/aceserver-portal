CREATE TABLE IF NOT EXISTS skin_maker_diagnostics (
  id TEXT PRIMARY KEY,
  created INTEGER NOT NULL,
  stage TEXT NOT NULL,
  code TEXT NOT NULL,
  status INTEGER NOT NULL,
  elapsed_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS skin_maker_diagnostics_created
  ON skin_maker_diagnostics(created);
