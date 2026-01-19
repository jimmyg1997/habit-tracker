-- Cleanup script to remove duplicate habits
-- This keeps the oldest habit (by created_at) and removes duplicates by name

-- First, see what duplicates exist
SELECT 
  name,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as ids,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM habits
WHERE user_id = auth.uid()  -- Replace with your user ID if needed
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Delete duplicates, keeping only the oldest one
WITH ranked_habits AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY created_at ASC) as rn
  FROM habits
  WHERE user_id = auth.uid()  -- Replace with your user ID if needed
)
DELETE FROM habits
WHERE id IN (
  SELECT id FROM ranked_habits WHERE rn > 1
);

-- Verify cleanup
SELECT 
  name,
  COUNT(*) as count
FROM habits
WHERE user_id = auth.uid()  -- Replace with your user ID if needed
GROUP BY name
HAVING COUNT(*) > 1;


