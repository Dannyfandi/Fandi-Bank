-- 1. Create messages table for Chat Help Center
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins full messages" ON messages FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. Create loan_requests table
CREATE TABLE IF NOT EXISTS public.loan_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own loans" ON loan_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users request loans" ON loan_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access to loans" ON loan_requests FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Update debts table with V3 tracking
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS is_loan boolean DEFAULT false;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS fully_paid_at timestamp with time zone;
