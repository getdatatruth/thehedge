CREATE TABLE IF NOT EXISTS activity_favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, activity_id)
);

-- RLS policies
ALTER TABLE activity_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their family's favourites"
  ON activity_favourites FOR SELECT
  USING (family_id IN (SELECT family_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can add favourites for their family"
  ON activity_favourites FOR INSERT
  WITH CHECK (family_id IN (SELECT family_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can remove their family's favourites"
  ON activity_favourites FOR DELETE
  USING (family_id IN (SELECT family_id FROM users WHERE id = auth.uid()));
