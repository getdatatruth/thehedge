-- Community Enhancements Migration
-- Adds comments, likes, reporting, moderation, and group metadata

-- ─── Enhance community_groups ────────────────────────────

ALTER TABLE community_groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE community_groups ADD COLUMN IF NOT EXISTS rules TEXT;
ALTER TABLE community_groups ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🏠';
ALTER TABLE community_groups ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- ─── Enhance community_posts ─────────────────────────────

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── Comments table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_post_id ON community_comments(post_id, created_at);
CREATE INDEX idx_comments_family_id ON community_comments(family_id);

-- ─── Post likes table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_post_likes (
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (family_id, post_id)
);

CREATE INDEX idx_likes_post_id ON community_post_likes(post_id);

-- ─── Reports table ───────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES community_comments(id) ON DELETE SET NULL,
  reporter_family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

CREATE INDEX idx_reports_status ON community_reports(status, created_at DESC);
CREATE INDEX idx_reports_post_id ON community_reports(post_id);

-- ─── Mutes table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS community_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  muted_by TEXT NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, group_id)
);

CREATE INDEX idx_mutes_group ON community_mutes(group_id);
CREATE INDEX idx_mutes_family ON community_mutes(family_id);

-- ─── RLS Policies ────────────────────────────────────────

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_mutes ENABLE ROW LEVEL SECURITY;

-- Comments: anyone can read, authenticated can write
CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authors can update own comments" ON community_comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete comments" ON community_comments FOR DELETE TO authenticated USING (true);

-- Likes: anyone can read, authenticated can write
CREATE POLICY "Anyone can read likes" ON community_post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage likes" ON community_post_likes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can remove likes" ON community_post_likes FOR DELETE TO authenticated USING (true);

-- Reports: only reporters can see own, admins see all (handled in API)
CREATE POLICY "Authenticated can create reports" ON community_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read reports" ON community_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update reports" ON community_reports FOR UPDATE TO authenticated USING (true);

-- Mutes: readable by authenticated
CREATE POLICY "Authenticated can read mutes" ON community_mutes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage mutes" ON community_mutes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can remove mutes" ON community_mutes FOR DELETE TO authenticated USING (true);
