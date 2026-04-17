-- =====================================
-- FANDI BANK SCHEMA V10: THEME PROGRESSION & RLS BUGFIX
-- =====================================

-- 1. ADD PROGRESSION COLUMNS TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_theme text DEFAULT 'normal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sf_progress jsonb DEFAULT '{"unlocked_mains": [], "randoms_smiled": 0}'::jsonb;

-- 2. FIX PROFILE UPDATE RLS FOR POSITIVE BALANCE CARRYOVER
-- Previously, only the user could update their own profile, meaning the Admin could not update credit_balance!
-- This safely allows Admins to update ANY profile.
CREATE POLICY "Admins update profiles" ON profiles FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
