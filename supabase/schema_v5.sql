-- =====================================
-- FANDI BANK SCHEMA V5: FACTORY RESET & AVATAR STORAGE
-- =====================================

-- 1. FACTORY RESET (WARNING: THIS WIPES ALL DATA)
-- This natively deletes every single user, dropping all their debts, visits, tickets, and profile info instantly via ON DELETE CASCADE.
DELETE FROM auth.users;

-- 2. SUPABASE STORAGE BUCKET FOR AVATARS
-- Create a public bucket to hold avatar image files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE SECURITY POLICIES
-- Allow any user to see the avatars
CREATE POLICY "Public Avatar Views" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'avatars' );

-- Allow logged-in users to upload image files
CREATE POLICY "Authenticated users can upload avatars" 
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Allow logged-in users to update their own image files
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
