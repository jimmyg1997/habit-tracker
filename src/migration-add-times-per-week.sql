-- Add times_per_week column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS times_per_week INTEGER;

-- Set default values for existing habits (7 times per week = daily)
UPDATE habits SET times_per_week = 7 WHERE times_per_week IS NULL;


