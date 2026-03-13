-- Migration: Add collections table
-- Created: 2026-03-13

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  activity_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  seasonal BOOLEAN NOT NULL DEFAULT false,
  event_date TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS collections_slug_idx ON collections (slug);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Public read policy for published collections
CREATE POLICY "Anyone can read published collections"
  ON collections FOR SELECT
  USING (published = true);

-- Admin full access via service role (bypasses RLS)
