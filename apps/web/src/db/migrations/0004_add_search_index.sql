-- Migration: Add full-text search index on activities
-- Created: 2026-03-13

-- Enable the pg_trgm extension for trigram-based similarity/search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on title using trigrams (speeds up ilike queries)
CREATE INDEX IF NOT EXISTS activities_title_trgm_idx
  ON activities USING gin (title gin_trgm_ops);

-- GIN index on description using trigrams (speeds up ilike queries)
CREATE INDEX IF NOT EXISTS activities_description_trgm_idx
  ON activities USING gin (description gin_trgm_ops);

-- Add a generated tsvector column for proper full-text search ranking
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

-- GIN index on the tsvector column for fast full-text search
CREATE INDEX IF NOT EXISTS activities_search_vector_idx
  ON activities USING gin (search_vector);
