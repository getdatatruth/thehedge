-- Add parent_guide JSONB column to activities table
-- Stores AI-generated teaching content for parents:
-- { knowledge: [{ topic, content }], conversation_starters: [], watch_for: [] }
ALTER TABLE activities ADD COLUMN IF NOT EXISTS parent_guide jsonb;
