-- V10.5: Fandi Coins Cloud Sync + Prize Requests
-- Run this on your Supabase SQL Editor

-- 1) Add Fandi Coins columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS fandi_coins integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coin_sync_version integer DEFAULT 0;

-- 2) Create prize_requests table
CREATE TABLE IF NOT EXISTS public.prize_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL,
  cost integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now()
);

-- 3) Enable RLS
ALTER TABLE public.prize_requests ENABLE ROW LEVEL SECURITY;

-- 4) Policies: users can read their own requests, admin can read all
CREATE POLICY "Users can view own prize requests" ON public.prize_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all prize requests" ON public.prize_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own prize requests" ON public.prize_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update prize requests" ON public.prize_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
