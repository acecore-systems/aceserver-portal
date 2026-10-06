-- Apply to an isolated local/Preview database first. Production is a separate release step.
CREATE TABLE IF NOT EXISTS skin_store (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
  model TEXT NOT NULL CHECK (model IN ('classic', 'slim')),
  created INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'published' CHECK (state IN ('published', 'withdrawn', 'blocked')),
  png TEXT NOT NULL,
  preview TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS skin_store_catalogue ON skin_store (state, created DESC, id DESC);
CREATE INDEX IF NOT EXISTS skin_store_model ON skin_store (state, model, created DESC, id DESC);

CREATE TABLE IF NOT EXISTS skin_store_reports (
  skin_id TEXT NOT NULL REFERENCES skin_store (id),
  client TEXT NOT NULL,
  day TEXT NOT NULL,
  created INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'rights', 'other')),
  PRIMARY KEY (skin_id, client, day)
);
CREATE INDEX IF NOT EXISTS skin_store_reports_quota ON skin_store_reports (day, client);
