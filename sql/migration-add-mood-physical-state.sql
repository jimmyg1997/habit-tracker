-- Add mood, physical_state, and journal_note columns to health_metrics table
ALTER TABLE health_metrics
ADD COLUMN IF NOT EXISTS mood_rating INT CHECK (mood_rating >= 1 AND mood_rating <= 5),
ADD COLUMN IF NOT EXISTS physical_state_rating INT CHECK (physical_state_rating >= 1 AND physical_state_rating <= 5),
ADD COLUMN IF NOT EXISTS journal_note TEXT;

