-- =====================================
-- FANDI BANK DATABASE SCHEMA V4
-- =====================================

-- 1. ADD NEW COLUMNS TO PROFILES
ALTER TABLE public.profiles 
ADD COLUMN description text,
ADD COLUMN avatar_url text;

-- 2. FIX THE SIGNUP TRIGGER (CRITICAL FOR USERNAMES)
-- This replaces the old trigger completely! Now it uses the actual username passed from the signup form,
-- and falls back to the email prefix string ONLY if they left the form blank.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
