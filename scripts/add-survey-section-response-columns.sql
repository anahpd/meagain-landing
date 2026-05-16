-- Survey responses: per-section jsonb columns so each cell stays small (dashboard / Row Level Security friendly).
-- Ensure `responses` is JSONB (not VARCHAR): truncation often comes from TEXT limits or UI caps, not JSONB itself).

ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS responses_a jsonb,
  ADD COLUMN IF NOT EXISTS responses_b jsonb,
  ADD COLUMN IF NOT EXISTS responses_c jsonb,
  ADD COLUMN IF NOT EXISTS responses_d jsonb,
  ADD COLUMN IF NOT EXISTS responses_e jsonb,
  ADD COLUMN IF NOT EXISTS responses_f jsonb,
  ADD COLUMN IF NOT EXISTS responses_g jsonb,
  ADD COLUMN IF NOT EXISTS responses_h jsonb,
  ADD COLUMN IF NOT EXISTS responses_i jsonb;

-- Optional: if `responses` was created as text/varchar, widen it (run only if needed):
-- ALTER TABLE public.survey_responses
--   ALTER COLUMN responses TYPE jsonb USING responses::jsonb;
