/*
# Community Issue Intelligence Platform — Schema

1. Purpose
   A platform where citizens report local community problems (potholes, safety
   hazards, environmental issues, etc.) and an AI engine automatically categorizes
   them, scores priority, and surfaces community-wide insights and trends.

2. New Tables

   - `issues`
     - id (uuid, PK)
     - title (text, not null) — short summary of the problem
     - description (text, not null) — detailed description
     - category (text, not null) — AI-assigned category (transportation, healthcare,
       education, public_safety, environment, energy, public_services, other)
     - priority (text, not null) — AI-assigned priority level (critical, high, medium, low)
     - priority_score (integer, 0-100) — numeric AI priority score
     - status (text, not null, default 'open') — open, acknowledged, in_progress, resolved
     - location (text) — human-readable location
     - latitude (double precision) — optional geo coords
     - longitude (double precision) — optional geo coords
     - upvotes (integer, default 0) — community support count
     - reporter_name (text) — optional name of the person reporting
     - ai_summary (text) — AI-generated one-line summary
     - ai_tags (text[]) — AI-extracted tags
     - sentiment_score (double precision) — AI sentiment (-1 to 1)
     - created_at (timestamptz, default now())
     - updated_at (timestamptz, default now())

   - `comments`
     - id (uuid, PK)
     - issue_id (uuid, FK → issues.id ON DELETE CASCADE)
     - author_name (text, not null)
     - content (text, not null)
     - sentiment_score (double precision) — AI sentiment
     - created_at (timestamptz, default now())

   - `issue_votes`
     - id (uuid, PK)
     - issue_id (uuid, FK → issues.id ON DELETE CASCADE)
     - voter_fingerprint (text) — simple dedup based on browser fingerprint
     - created_at (timestamptz, default now())
     - UNIQUE(issue_id, voter_fingerprint)

3. Indexes
   - issues(category), issues(priority), issues(status), issues(created_at DESC)
   - comments(issue_id)
   - issue_votes(issue_id)

4. Security
   - RLS enabled on all tables.
   - No auth/sign-in in this app → policies use TO anon, authenticated (public/shared data).
   - All CRUD allowed for anon + authenticated since data is intentionally community-shared.

5. Notes
   - No user_id columns or auth references — single-tenant community board.
   - upvotes denormalized on issues for fast reads; issue_votes table provides dedup.
*/

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  priority text NOT NULL DEFAULT 'medium',
  priority_score integer NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'open',
  location text,
  latitude double precision,
  longitude double precision,
  upvotes integer NOT NULL DEFAULT 0,
  reporter_name text,
  ai_summary text,
  ai_tags text[] DEFAULT '{}',
  sentiment_score double precision DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  sentiment_score double precision DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  voter_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issue_id, voter_fingerprint)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_votes_issue_id ON issue_votes(issue_id);

-- Enable RLS on all tables
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;

-- Issues: public CRUD (community-shared data, no auth)
DROP POLICY IF EXISTS "public_select_issues" ON issues;
CREATE POLICY "public_select_issues" ON issues FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_issues" ON issues;
CREATE POLICY "public_insert_issues" ON issues FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_issues" ON issues;
CREATE POLICY "public_update_issues" ON issues FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_issues" ON issues;
CREATE POLICY "public_delete_issues" ON issues FOR DELETE
  TO anon, authenticated USING (true);

-- Comments: public CRUD
DROP POLICY IF EXISTS "public_select_comments" ON comments;
CREATE POLICY "public_select_comments" ON comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_comments" ON comments;
CREATE POLICY "public_insert_comments" ON comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_comments" ON comments;
CREATE POLICY "public_delete_comments" ON comments FOR DELETE
  TO anon, authenticated USING (true);

-- Issue votes: public read/insert/delete
DROP POLICY IF EXISTS "public_select_votes" ON issue_votes;
CREATE POLICY "public_select_votes" ON issue_votes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_votes" ON issue_votes;
CREATE POLICY "public_insert_votes" ON issue_votes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_votes" ON issue_votes;
CREATE POLICY "public_delete_votes" ON issue_votes FOR DELETE
  TO anon, authenticated USING (true);

-- Function to increment upvotes safely
CREATE OR REPLACE FUNCTION increment_upvotes(issue_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE issues SET upvotes = upvotes + 1, updated_at = now() WHERE id = issue_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement upvotes
CREATE OR REPLACE FUNCTION decrement_upvotes(issue_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE issues SET upvotes = GREATEST(upvotes - 1, 0), updated_at = now() WHERE id = issue_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant execute on functions to anon and authenticated
GRANT EXECUTE ON FUNCTION increment_upvotes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_upvotes(uuid) TO anon, authenticated;

-- Auto-update updated_at on issues
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS issues_updated_at ON issues;
CREATE TRIGGER issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
