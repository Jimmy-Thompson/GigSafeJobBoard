ALTER TABLE user_submitted_jobs
  ADD COLUMN IF NOT EXISTS postalcode text;
