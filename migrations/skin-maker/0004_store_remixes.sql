-- A remix is a separate immutable work. Source withdrawal never deletes its copies.
ALTER TABLE skin_store ADD COLUMN source_id TEXT REFERENCES skin_store(id);
ALTER TABLE skin_store ADD COLUMN remix_client TEXT;

-- Published, withdrawn and blocked copies all count toward publication quotas.
CREATE INDEX skin_store_remix_created ON skin_store(created)
  WHERE source_id IS NOT NULL;
CREATE INDEX skin_store_remix_client_created ON skin_store(remix_client, created)
  WHERE remix_client IS NOT NULL;
