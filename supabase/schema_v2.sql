-- 1. Add credit_balance to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credit_balance numeric(12,2) DEFAULT 0;

-- 2. Add paid_amount to debts
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0;

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  created_by_admin uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins all payments" ON payments FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. Create payment_allocations table
CREATE TABLE IF NOT EXISTS public.payment_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  debt_id uuid REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  allocated_amount numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own allocations" ON payment_allocations FOR SELECT USING (
  EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_allocations.payment_id AND p.user_id = auth.uid())
);
CREATE POLICY "Admins all allocations" ON payment_allocations FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Create visit_requests table
CREATE TABLE IF NOT EXISTS public.visit_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visit_date date NOT NULL,
  arrival_time time NOT NULL,
  stay_status text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert/view own visits" ON visit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own visits" ON visit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins all visits" ON visit_requests FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
