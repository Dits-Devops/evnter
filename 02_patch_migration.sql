-- ============================================================================
-- EVNTER Patch Migration: Broadcasts & Notifications
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- 1. Modify Notifications Table
-- Add title column if it doesn't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;

-- We need to drop the old check constraint to allow new 'announcement' type
-- Identify the existing constraint name. In Supabase, if we used `CHECK (type IN (...))` 
-- without naming it, PostgreSQL generated a name like `notifications_type_check`.
-- Alternatively, we can just alter type to TEXT without constraints, but dropping is safer:
DO $$
DECLARE
  conname text;
BEGIN
  -- Find the constraint on the "type" column for table "notifications"
  SELECT tc.constraint_name INTO conname
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
  WHERE tc.table_name = 'notifications' AND ccu.column_name = 'type' AND tc.constraint_type = 'CHECK';

  IF conname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT ' || conname;
  END IF;
END $$;

-- Add new constraint
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('schedule_change', 'approval_accepted', 'approval_rejected', 'general', 'announcement'));


-- 2. Create Broadcasts Table
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_role TEXT NOT NULL CHECK (target_role IN ('user', 'organizer', 'all')),
  type TEXT DEFAULT 'info',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Note: Broadcasts are only created/viewed by admins via API (Service Role)
-- So we can keep it strict, or allow admins to select
DROP POLICY IF EXISTS "admin_all_broadcasts" ON broadcasts;
CREATE POLICY "admin_all_broadcasts" ON broadcasts FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
-- 3. Enable Realtime Replication
-- Add tables to the supabase_realtime publication
-- First check if the publication exists, then add tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
    ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  ELSE
    CREATE PUBLICATION supabase_realtime FOR TABLE event_registrations, tickets, notifications;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- table already in publication
END $$;
