-- =====================================
-- FANDI BANK SCHEMA V6: FRIENDS + NOTIFICATIONS
-- =====================================

-- 1. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING ( auth.uid() = requester_id OR auth.uid() = addressee_id );

CREATE POLICY "Users can insert friendships"
  ON friendships FOR INSERT
  WITH CHECK ( auth.uid() = requester_id );

CREATE POLICY "Users can update friendships they received"
  ON friendships FOR UPDATE
  USING ( auth.uid() = addressee_id );

-- 2. FRIEND MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.friend_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  shared_debt_ids uuid[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.friend_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend messages"
  ON friend_messages FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can send friend messages"
  ON friend_messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );

-- 3. ADMIN NOTIFICATION WEBHOOK (Option C: pg_net)
-- You must enable the pg_net extension first in Supabase Dashboard > Extensions
-- Then replace YOUR_EMAIL and YOUR_RESEND_API_KEY below

-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- 
-- CREATE OR REPLACE FUNCTION public.notify_admin_on_request()
-- RETURNS trigger AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url := 'https://api.resend.com/emails',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer YOUR_RESEND_API_KEY',
--       'Content-Type', 'application/json'
--     ),
--     body := jsonb_build_object(
--       'from', 'Fandi Bank <noreply@yourdomain.com>',
--       'to', 'dannyfandi.3@gmail.com',
--       'subject', 'New Request on Fandi Bank',
--       'text', 'You have a new request pending in Fandi Bank Admin HQ. Check it now!'
--     )
--   );
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- 
-- CREATE TRIGGER on_loan_request AFTER INSERT ON public.loan_requests
--   FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_request();
-- 
-- CREATE TRIGGER on_ticket_request AFTER INSERT ON public.ticket_requests
--   FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_request();
-- 
-- CREATE TRIGGER on_visit_request AFTER INSERT ON public.visit_requests
--   FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_request();
-- 
-- CREATE TRIGGER on_help_message AFTER INSERT ON public.messages
--   FOR EACH ROW WHEN (NEW.receiver_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))
--   EXECUTE FUNCTION public.notify_admin_on_request();
