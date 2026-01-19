-- Add audio_recordings and summary columns to health_metrics table
ALTER TABLE health_metrics
ADD COLUMN IF NOT EXISTS audio_recordings JSONB,
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN health_metrics.audio_recordings IS 'Array of audio recording objects with id, url, duration, and timestamp';
COMMENT ON COLUMN health_metrics.summary IS 'AI-generated summary of journal entries and voice recordings for the day';

