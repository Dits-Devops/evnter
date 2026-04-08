-- EVNTER Database Migration
-- Run this in Supabase SQL Editor before using new features

-- 1. Add price field to events (amount in Indonesian Rupiah / IDR, integer)
ALTER TABLE events ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;

-- 2. Add profile_image to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- 3. Create event_registrations table (approval flow)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  approval_status TEXT DEFAULT 'pending_approval'
    CHECK (approval_status IN ('pending_approval', 'approved', 'rejected')),
  payment_status TEXT DEFAULT 'belum_bayar'
    CHECK (payment_status IN ('belum_bayar', 'menunggu_verifikasi', 'sudah_bayar', 'ditolak')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  UNIQUE(user_id, event_id)
);

-- Enable RLS on event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 4. Add registration_id to tickets (link ticket to registration)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES event_registrations(id);

-- 5. Create checkin_logs table
CREATE TABLE IF NOT EXISTS checkin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES users(id),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  result TEXT DEFAULT 'success'
    CHECK (result IN ('success', 'already_used', 'invalid', 'event_not_started'))
);

-- Enable RLS on checkin_logs
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_name TEXT DEFAULT 'BCA',
  account_name TEXT DEFAULT 'EVNTER Indonesia',
  account_number TEXT DEFAULT '1234567890',
  qris_image TEXT,
  whatsapp_admin TEXT DEFAULT '085882846665',
  description TEXT DEFAULT 'Transfer ke rekening di atas atau scan QRIS',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on payment_settings
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Insert default payment settings (only if table is empty)
INSERT INTO payment_settings (payment_name, account_name, account_number, whatsapp_admin, description)
SELECT 'BCA', 'EVNTER Indonesia', '1234567890', '085882846665', 'Transfer ke rekening di atas atau scan QRIS'
WHERE NOT EXISTS (SELECT 1 FROM payment_settings LIMIT 1);

-- 7. RLS Policies for event_registrations
-- Users can see their own registrations
CREATE POLICY IF NOT EXISTS "users_see_own_registrations"
  ON event_registrations FOR SELECT
  USING (user_id = auth.uid());

-- Organizers/admins can see all (handled server-side via service role key, no RLS issue)

-- 8. RLS Policies for payment_settings
-- Anyone can read payment settings
CREATE POLICY IF NOT EXISTS "public_read_payment_settings"
  ON payment_settings FOR SELECT
  TO public USING (true);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(approval_status);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_event_id ON checkin_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_ticket_id ON checkin_logs(ticket_id);
