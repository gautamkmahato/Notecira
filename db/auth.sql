-- Auth migration: per-user workspaces + RLS
-- Run after db/schema.sql in your InsForge SQL editor.

-- ---------------------------------------------------------------------------
-- Helper: current user id from JWT (InsForge auth)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- Per-user ownership columns
-- ---------------------------------------------------------------------------

ALTER TABLE folders ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Migrate workspace_meta from singleton to per-user
CREATE TABLE IF NOT EXISTS workspace_meta_v2 (
  user_id TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 5,
  root_folder_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  root_document_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop legacy singleton table if present
DROP TABLE IF EXISTS workspace_meta;
ALTER TABLE workspace_meta_v2 RENAME TO workspace_meta;

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON blocks (user_id);

-- ---------------------------------------------------------------------------
-- RLS: users only access their own rows
-- ---------------------------------------------------------------------------

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS folders_public_all ON folders;
DROP POLICY IF EXISTS documents_public_all ON documents;
DROP POLICY IF EXISTS blocks_public_all ON blocks;
DROP POLICY IF EXISTS workspace_meta_public_all ON workspace_meta;

DROP POLICY IF EXISTS folders_owner ON folders;
CREATE POLICY folders_owner ON folders
  FOR ALL
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS documents_owner ON documents;
CREATE POLICY documents_owner ON documents
  FOR ALL
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS blocks_owner ON blocks;
CREATE POLICY blocks_owner ON blocks
  FOR ALL
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS workspace_meta_owner ON workspace_meta;
CREATE POLICY workspace_meta_owner ON workspace_meta
  FOR ALL
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

-- ---------------------------------------------------------------------------
-- Atomic per-user workspace replace
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION replace_workspace(p_user_id TEXT, snapshot JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
BEGIN
  IF p_user_id IS NULL OR length(trim(p_user_id)) = 0 THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  SET CONSTRAINTS documents_parent_block_id_fkey DEFERRED;

  DELETE FROM blocks WHERE user_id = p_user_id;
  DELETE FROM documents WHERE user_id = p_user_id;
  DELETE FROM folders WHERE user_id = p_user_id;

  FOR item IN SELECT value FROM jsonb_each(COALESCE(snapshot->'folders', '{}'::jsonb))
  LOOP
    INSERT INTO folders (id, user_id, name, parent_folder_id, sort_order, created_at, updated_at)
    VALUES (
      item->>'id',
      p_user_id,
      COALESCE(item->>'name', 'Untitled'),
      NULLIF(item->>'parentFolderId', 'null'),
      COALESCE((item->>'sortOrder')::int, 0),
      COALESCE((item->>'createdAt')::timestamptz, NOW()),
      COALESCE((item->>'updatedAt')::timestamptz, NOW())
    );
  END LOOP;

  FOR item IN SELECT value FROM jsonb_each(COALESCE(snapshot->'documents', '{}'::jsonb))
  LOOP
    INSERT INTO documents (
      id, user_id, title, folder_id, parent_block_id, sort_order, deleted_at, created_at, updated_at
    )
    VALUES (
      item->>'id',
      p_user_id,
      COALESCE(item->>'title', 'Untitled'),
      NULLIF(item->>'folderId', 'null'),
      NULLIF(item->>'parentBlockId', 'null'),
      COALESCE((item->>'sortOrder')::int, 0),
      CASE
        WHEN item->'deletedAt' IS NULL OR item->>'deletedAt' = 'null' THEN NULL
        ELSE (item->>'deletedAt')::timestamptz
      END,
      COALESCE((item->>'createdAt')::timestamptz, NOW()),
      COALESCE((item->>'updatedAt')::timestamptz, NOW())
    );
  END LOOP;

  FOR item IN SELECT value FROM jsonb_each(COALESCE(snapshot->'blocks', '{}'::jsonb))
  LOOP
    INSERT INTO blocks (
      id, user_id, document_id, type, content, attrs, position, linked_document_id, created_at, updated_at
    )
    VALUES (
      item->>'id',
      p_user_id,
      item->>'documentId',
      COALESCE(item->>'type', 'paragraph'),
      COALESCE(item->>'content', ''),
      COALESCE(item->'attrs', '{}'::jsonb),
      COALESCE((item->>'position')::int, 0),
      NULLIF(item->>'linkedDocumentId', 'null'),
      COALESCE((item->>'createdAt')::timestamptz, NOW()),
      COALESCE((item->>'updatedAt')::timestamptz, NOW())
    );
  END LOOP;

  INSERT INTO workspace_meta (user_id, version, root_folder_ids, root_document_ids, updated_at)
  VALUES (
    p_user_id,
    COALESCE((snapshot->>'version')::int, 5),
    COALESCE(snapshot->'rootFolderIds', '[]'::jsonb),
    COALESCE(snapshot->'rootDocumentIds', '[]'::jsonb),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    version = EXCLUDED.version,
    root_folder_ids = EXCLUDED.root_folder_ids,
    root_document_ids = EXCLUDED.root_document_ids,
    updated_at = NOW();

  -- Create missing private share rows for documents inserted above (same transaction).
  INSERT INTO document_shares (document_id, owner_user_id, visibility, share_token, allowed_emails)
  SELECT d.id, p_user_id, 'private', NULL, '[]'::jsonb
  FROM documents d
  WHERE d.user_id = p_user_id
  ON CONFLICT (document_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION replace_workspace(TEXT, JSONB) TO anon, authenticated;
