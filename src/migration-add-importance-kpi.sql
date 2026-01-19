-- Add importance and kpi_type columns to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE habits ADD COLUMN IF NOT EXISTS kpi_type TEXT DEFAULT 'days';

-- Set default values for existing habits
UPDATE habits SET importance = 'medium' WHERE importance IS NULL;
UPDATE habits SET kpi_type = 'days' WHERE kpi_type IS NULL;


