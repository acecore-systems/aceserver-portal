PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS alpha_lore_world (
  id TEXT PRIMARY KEY CHECK (id = 'alpha'),
  current_revision INTEGER NOT NULL DEFAULT 0 CHECK (current_revision >= 0),
  constitution_json TEXT NOT NULL CHECK (json_valid(constitution_json)),
  constitution_version INTEGER NOT NULL CHECK (constitution_version > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO alpha_lore_world (
  id,
  current_revision,
  constitution_json,
  constitution_version,
  created_at,
  updated_at
) VALUES (
  'alpha',
  0,
  '{"language":"ja","principles":["正史はアルファくん個人の創作上の記憶だけを扱う","AceserverやAcecoreやWIKIや実在人物の事実を作成または変更しない","公開チャットからは既存の正史を上書きせず一つの記憶断片だけを追加する","一つの断片は一つの時代と一つの中心的出来事に限定する","年齢や生年月日や家族や出生地や正体などの基礎設定は直接質問された場合だけ作る","正史本文は日本語で保存し質問文そのものは保存しない"]}',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alpha_lore_revisions (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL,
  revision_no INTEGER NOT NULL CHECK (revision_no > 0),
  coverage_key TEXT NOT NULL CHECK (
    length(coverage_key) BETWEEN 3 AND 80
    AND coverage_key NOT GLOB '*[^a-z0-9._-]*'
  ),
  granularity TEXT NOT NULL CHECK (granularity = 'fragment'),
  era TEXT NOT NULL CHECK (
    era IN (
      'origin',
      'childhood',
      'adolescence',
      'early_guide',
      'recent',
      'timeless'
    )
  ),
  title_ja TEXT NOT NULL CHECK (length(title_ja) BETWEEN 1 AND 30),
  summary_ja TEXT NOT NULL CHECK (length(summary_ja) BETWEEN 1 AND 80),
  body_ja TEXT NOT NULL CHECK (length(body_ja) BETWEEN 160 AND 320),
  next_hook_ja TEXT CHECK (
    next_hook_ja IS NULL OR length(next_hook_ja) BETWEEN 1 AND 80
  ),
  facts_json TEXT NOT NULL CHECK (json_valid(facts_json)),
  related_revision_ids_json TEXT NOT NULL CHECK (
    json_valid(related_revision_ids_json)
  ),
  status TEXT NOT NULL CHECK (status IN ('active', 'withdrawn')),
  model TEXT NOT NULL,
  reasoning_effort TEXT NOT NULL CHECK (
    reasoning_effort IN ('medium', 'max')
  ),
  prompt_version TEXT NOT NULL,
  schema_version INTEGER NOT NULL CHECK (schema_version > 0),
  constitution_version INTEGER NOT NULL CHECK (constitution_version > 0),
  created_at TEXT NOT NULL,
  withdrawn_at TEXT,
  FOREIGN KEY (world_id) REFERENCES alpha_lore_world(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS alpha_lore_revisions_revision_unique
  ON alpha_lore_revisions (world_id, revision_no);

CREATE UNIQUE INDEX IF NOT EXISTS alpha_lore_revisions_coverage_active_unique
  ON alpha_lore_revisions (world_id, coverage_key)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS alpha_lore_revisions_recent_idx
  ON alpha_lore_revisions (world_id, status, revision_no DESC);

CREATE TABLE IF NOT EXISTS alpha_lore_facts (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL,
  fact_key TEXT NOT NULL CHECK (
    length(fact_key) BETWEEN 3 AND 80
    AND fact_key NOT GLOB '*[^a-z0-9._-]*'
  ),
  value_ja TEXT NOT NULL CHECK (length(value_ja) BETWEEN 1 AND 120),
  kind TEXT NOT NULL CHECK (kind IN ('ordinary', 'foundational')),
  status TEXT NOT NULL CHECK (status IN ('active', 'withdrawn')),
  source_revision_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  withdrawn_at TEXT,
  FOREIGN KEY (world_id) REFERENCES alpha_lore_world(id),
  FOREIGN KEY (source_revision_id) REFERENCES alpha_lore_revisions(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS alpha_lore_facts_key_active_unique
  ON alpha_lore_facts (world_id, fact_key)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS alpha_lore_facts_revision_idx
  ON alpha_lore_facts (source_revision_id);

CREATE TABLE IF NOT EXISTS alpha_lore_revision_refs (
  revision_id TEXT NOT NULL,
  referenced_revision_id TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('context', 'continues')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (revision_id, referenced_revision_id),
  CHECK (revision_id <> referenced_revision_id),
  FOREIGN KEY (revision_id) REFERENCES alpha_lore_revisions(id),
  FOREIGN KEY (referenced_revision_id) REFERENCES alpha_lore_revisions(id)
);

CREATE TABLE IF NOT EXISTS alpha_lore_vector_outbox (
  revision_id TEXT PRIMARY KEY,
  operation TEXT NOT NULL CHECK (operation = 'upsert'),
  status TEXT NOT NULL CHECK (status IN ('pending', 'retry', 'synced')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at TEXT NOT NULL,
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (revision_id) REFERENCES alpha_lore_revisions(id)
);

CREATE INDEX IF NOT EXISTS alpha_lore_vector_outbox_pending_idx
  ON alpha_lore_vector_outbox (status, available_at);

CREATE TABLE IF NOT EXISTS alpha_lore_generation_locks (
  world_id TEXT PRIMARY KEY,
  owner_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (world_id) REFERENCES alpha_lore_world(id)
);

CREATE TABLE IF NOT EXISTS alpha_lore_generation_events (
  id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (
    outcome IN ('busy', 'conflict', 'created', 'failed', 'rejected', 'reused')
  ),
  coverage_key TEXT,
  revision_id TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (world_id) REFERENCES alpha_lore_world(id),
  FOREIGN KEY (revision_id) REFERENCES alpha_lore_revisions(id)
);

CREATE INDEX IF NOT EXISTS alpha_lore_generation_events_created_idx
  ON alpha_lore_generation_events (world_id, created_at DESC);
