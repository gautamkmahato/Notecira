-- Patch replace_workspace to ensure document_shares inside the same transaction.
-- Run in InsForge SQL editor if workspace save fails with document_shares_document_id_fkey.

CREATE OR REPLACE FUNCTION replace_workspace(p_user_id TEXT, snapshot JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLAREP
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

  INSERT INTO document_shares (document_id, owner_user_id, visibility, share_token, allowed_emails)
  SELECT d.id, p_user_id, 'private', NULL, '[]'::jsonb
  FROM documents d
  WHERE d.user_id = p_user_id
  ON CONFLICT (document_id) DO NOTHING;
END;
$$;
