/*
  # Add lessons_completed column to user_progress

  1. Changes
    - Add `lessons_completed` column to track number of completed lessons
    - Rename `last_activity_date` to `last_accessed` for consistency with code
    - Update to use timestamptz instead of date for more precise tracking

  2. Purpose
    - Fix mismatch between code and database schema
    - Enable proper progress tracking in LearningModule component
*/

-- Add lessons_completed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'lessons_completed'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN lessons_completed integer DEFAULT 0;
  END IF;
END $$;

-- Add last_accessed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'last_accessed'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN last_accessed timestamptz DEFAULT now();
  END IF;
END $$;
