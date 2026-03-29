-- =====================================
-- FANDI BANK SCHEMA V8: EVENTS & SUGGESTIONS
-- =====================================

-- 1. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date timestamp with time zone NOT NULL,
  location text DEFAULT 'Mojo Dojo Casa House',
  poster_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Only admin can insert, update, or delete events" ON events
  FOR ALL
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- 2. EVENT INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own invitations" ON event_invitations FOR SELECT
  USING ( auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Only admin can insert invitations" ON event_invitations FOR INSERT
  WITH CHECK ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Only admin can delete invitations" ON event_invitations FOR DELETE
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Users can update their own invitations" ON event_invitations FOR UPDATE
  USING ( auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- 3. SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'feature')),
  content text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all suggestions" ON suggestions FOR SELECT
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Users can insert suggestions" ON suggestions FOR INSERT
  WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Admin can delete suggestions" ON suggestions FOR DELETE
  USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
