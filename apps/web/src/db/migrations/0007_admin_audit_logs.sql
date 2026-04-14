-- Admin Audit Logs table
-- Persists admin actions that were previously stored in-memory

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_action ON admin_audit_logs (action);
CREATE INDEX idx_audit_logs_entity_type ON admin_audit_logs (entity_type);
CREATE INDEX idx_audit_logs_admin_user ON admin_audit_logs (admin_user_id);

-- Enable RLS (admin only)
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read (admin check happens in API layer)
CREATE POLICY "Authenticated users can read audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Policy: authenticated users can insert
CREATE POLICY "Authenticated users can insert audit logs"
  ON admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
