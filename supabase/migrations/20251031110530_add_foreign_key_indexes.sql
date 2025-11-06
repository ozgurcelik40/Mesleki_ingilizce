/*
  # Add indexes for foreign keys

  1. Performance Optimization
    - Add indexes on all foreign key columns to improve query performance
    - This resolves the unindexed foreign key warnings

  2. Indexes Created
    - `achievements.user_id` - for user achievement queries
    - `activities.user_id` - for user activity queries
    - `lesson_completions.lesson_id` - for lesson completion lookups
    - `lessons.module_id` - for module lesson queries
    - `modules.course_id` - for course module queries
    - `user_progress.course_id` - for course progress queries
    - `vocabulary.lesson_id` - for lesson vocabulary queries

  3. Notes
    - Indexes significantly improve JOIN and WHERE clause performance
    - Each index is created with IF NOT EXISTS to prevent errors on re-run
*/

-- Add index on achievements.user_id
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Add index on activities.user_id
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Add index on lesson_completions.lesson_id
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);

-- Add index on lessons.module_id
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- Add index on modules.course_id
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);

-- Add index on user_progress.course_id
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);

-- Add index on vocabulary.lesson_id
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON vocabulary(lesson_id);
