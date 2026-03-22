-- Add status column to visit_requests if it doesn't exist
ALTER TABLE public.visit_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
