-- Revert sub-blocks migration (run each statement separately in InsForge SQL editor)
-- Keeps documents.parent_block_id (used for linked sub-documents).

DELETE FROM blocks WHERE parent_block_id IS NOT NULL;

DROP INDEX IF EXISTS idx_blocks_parent_position;

ALTER TABLE blocks DROP COLUMN IF EXISTS parent_block_id;
