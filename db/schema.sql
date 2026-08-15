-- Writing app schema for InsForge Postgres (database: writing)
-- Run this in your InsForge SQL editor or via: npx @insforge/cli db execute --file db/schema.sql

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled',
  parent_folder_id TEXT REFERENCES folders (id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  folder_id TEXT REFERENCES folders (id) ON DELETE SET NULL,
  parent_block_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents (id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'paragraph',
  content TEXT NOT NULL DEFAULT '',
  attrs JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  linked_document_id TEXT REFERENCES documents (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_parent_block_id_fkey;

ALTER TABLE documents
  ADD CONSTRAINT documents_parent_block_id_fkey
  FOREIGN KEY (parent_block_id) REFERENCES blocks (id) ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS workspace_meta (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version INTEGER NOT NULL DEFAULT 5,
  root_folder_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  root_document_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO workspace_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_blocks_document_position ON blocks (document_id, position);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents (folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents (deleted_at);
CREATE INDEX IF NOT EXISTS idx_folders_parent_sort ON folders (parent_folder_id, sort_order);

-- ---------------------------------------------------------------------------
-- RLS (permissive until auth is added)
-- ---------------------------------------------------------------------------

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS folders_public_all ON folders;
CREATE POLICY folders_public_all ON folders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS documents_public_all ON documents;
CREATE POLICY documents_public_all ON documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS blocks_public_all ON blocks;
CREATE POLICY blocks_public_all ON blocks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS workspace_meta_public_all ON workspace_meta;
CREATE POLICY workspace_meta_public_all ON workspace_meta FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Atomic workspace replace (used by PUT /api/workspace)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION replace_workspace(snapshot JSONB)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item JSONB;
BEGIN
  SET CONSTRAINTS documents_parent_block_id_fkey DEFERRED;

  TRUNCATE TABLE blocks, documents, folders;

  FOR item IN SELECT value FROM jsonb_each(COALESCE(snapshot->'folders', '{}'::jsonb))
  LOOP
    INSERT INTO folders (id, name, parent_folder_id, sort_order, created_at, updated_at)
    VALUES (
      item->>'id',
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
      id, title, folder_id, parent_block_id, sort_order, deleted_at, created_at, updated_at
    )
    VALUES (
      item->>'id',
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
      id, document_id, type, content, attrs, position, linked_document_id, created_at, updated_at
    )
    VALUES (
      item->>'id',
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

  UPDATE workspace_meta
  SET
    version = COALESCE((snapshot->>'version')::int, 5),
    root_folder_ids = COALESCE(snapshot->'rootFolderIds', '[]'::jsonb),
    root_document_ids = COALESCE(snapshot->'rootDocumentIds', '[]'::jsonb),
    updated_at = NOW()
  WHERE id = 1;
END;
$$;

-- ---------------------------------------------------------------------------
-- Grants for API roles (run if tables were created via raw SQL)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT TRUNCATE ON TABLE folders, documents, blocks TO anon, authenticated;
GRANT EXECUTE ON FUNCTION replace_workspace(JSONB) TO anon, authenticated;

ALTER FUNCTION replace_workspace(JSONB) SECURITY DEFINER;
