-- Document sharing (run after db/auth.sql)
-- visibility: private (owner only) | public (link) | restricted (link + allowed emails)

CREATE TABLE IF NOT EXISTS document_shares (
  document_id TEXT PRIMARY KEY REFERENCES documents (id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'public', 'restricted')),
  share_token TEXT UNIQUE,
  allowed_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares (share_token);
CREATE INDEX IF NOT EXISTS idx_document_shares_owner ON document_shares (owner_user_id);

ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_shares_owner ON document_shares;
CREATE POLICY document_shares_owner ON document_shares
  FOR ALL
  USING (owner_user_id = requesting_user_id())
  WITH CHECK (owner_user_id = requesting_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON document_shares TO anon, authenticated;
