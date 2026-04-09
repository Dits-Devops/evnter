-- EVNTER Migration: Fix Bugs, Improve Workflow, Add Missing Features (Phase 2)
-- Run this script in your Supabase SQL Editor

-- ============================================================================
-- 1. MODIFY EVENTS TABLE
-- Goal: Make payment settings specific per event, add max participants quota
-- ============================================================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS metode_pembayaran TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS nomor_rekening TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS nama_pemilik TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS qris_image TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS catatan_pembayaran TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_peserta INTEGER DEFAULT 0; -- 0 means unlimited

-- ============================================================================
-- 2. MODIFY USERS TABLE
-- Goal: Allow storing proof of transfer for Organizer Pro verification
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_payment_proof_url TEXT;

-- NOTE: profile_image already exists based on previous migrations, but adding
--       guard just in case.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- ============================================================================
-- 3. CREATE NOTIFICATIONS TABLE
-- Goal: Track state changes (schedule change, approval accepted/rejected)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('schedule_change', 'approval_accepted', 'approval_rejected', 'general')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  action_url TEXT
);

-- Enable RLS on Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
DROP POLICY IF EXISTS "users_see_own_notifications" ON notifications;
CREATE POLICY "users_see_own_notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can update their own notifications
DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;
CREATE POLICY "users_update_own_notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Organizers/Admins (via Service Role) can create notifications
-- Handled server-side

-- ============================================================================
-- 4. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- 5. SEED / UPDATE EXISTING DATA (Optional Safety checks)
-- ============================================================================
-- Convert max_peserta to 0 (unlimited) for existing old events just in case
UPDATE events SET max_peserta = 0 WHERE max_peserta IS NULL;

-- ============================================================================
-- 6. ADD PAYMENT PROOFS & PRO UPGRADE SETTINGS (Phase 3 Fix)
-- ============================================================================
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_approval';
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'belum_bayar';

CREATE TABLE IF NOT EXISTS pro_upgrade_payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  qris_image TEXT,
  whatsapp_admin TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: No RLS on pro_upgrade_payment_settings so public can read it, or enable it and select public
ALTER TABLE pro_upgrade_payment_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_pro_settings" ON pro_upgrade_payment_settings;
CREATE POLICY "public_read_pro_settings" ON pro_upgrade_payment_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_pro_settings" ON pro_upgrade_payment_settings;
CREATE POLICY "admin_all_pro_settings" ON pro_upgrade_payment_settings FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
