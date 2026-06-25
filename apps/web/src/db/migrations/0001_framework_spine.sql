-- Framework spine: the seed The Kitchen Table writes and every surface projects from.
-- Additive and idempotent. Safe to run against an existing database.
ALTER TABLE families ADD COLUMN IF NOT EXISTS approach education_approach;
ALTER TABLE families ADD COLUMN IF NOT EXISTS doorway text;

CREATE TABLE IF NOT EXISTS family_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  rendered_markdown text,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS family_frameworks_family_id_idx ON family_frameworks(family_id);
