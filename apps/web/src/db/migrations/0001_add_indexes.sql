-- Performance indexes for The Hedge platform
-- Created: 2026-03-11

-- ─── Activity Logs ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activity_logs_family_date
  ON activity_logs (family_id, date);

CREATE INDEX IF NOT EXISTS idx_activity_logs_activity
  ON activity_logs (activity_id);

-- ─── Daily Plans ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_plans_education_plan_date
  ON daily_plans (education_plan_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_plans_child_date
  ON daily_plans (child_id, date);

-- ─── Children ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_children_family
  ON children (family_id);

-- ─── Education Plans ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_education_plans_family_child
  ON education_plans (family_id, child_id);

-- ─── Community Posts ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_community_posts_group_created
  ON community_posts (group_id, created_at);

-- ─── Community Memberships ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_community_memberships_family
  ON community_memberships (family_id);

CREATE INDEX IF NOT EXISTS idx_community_memberships_group
  ON community_memberships (group_id);

-- ─── Portfolio Entries ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_portfolio_entries_child_date
  ON portfolio_entries (child_id, date);

-- ─── Events ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_group_date
  ON events (group_id, date);

-- ─── Notifications (if table exists) ─────────────────────
-- Run separately after the notifications table is created:
-- CREATE INDEX IF NOT EXISTS idx_notifications_family_read_created
--   ON notifications (family_id, read, created_at);

-- ─── Activity Favourites (if table exists) ───────────────
-- Run separately after the activity_favourites table is created:
-- CREATE INDEX IF NOT EXISTS idx_activity_favourites_family
--   ON activity_favourites (family_id);
