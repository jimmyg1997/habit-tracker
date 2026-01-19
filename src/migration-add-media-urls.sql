-- Add media_urls column to health_metrics table
ALTER TABLE health_metrics
ADD COLUMN IF NOT EXISTS media_urls TEXT[];

-- Add comment to explain the column
COMMENT ON COLUMN health_metrics.media_urls IS 'Array of media file URLs (images/videos) associated with journal entries';


