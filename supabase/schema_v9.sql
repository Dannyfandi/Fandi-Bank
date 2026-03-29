-- =====================================
-- FANDI BANK SCHEMA V9: VISIT REQUESTS & EVENTS LINK
-- =====================================

-- 1. Add event_id to visit_requests
ALTER TABLE public.visit_requests ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

-- Note: The ON DELETE CASCADE ensures that if an admin deletes an event from the events table,
-- any automatically generated house visits tied to that event are immediately deleted too.
