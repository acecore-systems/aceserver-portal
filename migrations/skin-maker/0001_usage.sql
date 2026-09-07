-- Apply only after deployment approval. Contains no prompts, images or raw IPs.
CREATE TABLE IF NOT EXISTS skin_maker_usage (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  client TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS skin_maker_usage_day ON skin_maker_usage(day, client);
CREATE INDEX IF NOT EXISTS skin_maker_usage_client ON skin_maker_usage(client, created);
CREATE INDEX IF NOT EXISTS skin_maker_usage_created ON skin_maker_usage(created);
