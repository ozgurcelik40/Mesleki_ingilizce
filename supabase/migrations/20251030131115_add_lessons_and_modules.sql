/*
  # Add Lessons and Modules Schema

  1. New Tables
    - `modules`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text) - Module title (e.g., "Module 1: Introduction")
      - `description` (text) - Module description
      - `order_index` (integer) - Order of the module in the course
      - `created_at` (timestamptz)

    - `lessons`
      - `id` (uuid, primary key)
      - `module_id` (uuid, references modules)
      - `title` (text) - Lesson title
      - `content` (text) - Lesson content/description
      - `lesson_type` (text) - Type: video, reading, quiz, exercise
      - `video_url` (text) - URL to video content (if applicable)
      - `order_index` (integer) - Order of the lesson in the module
      - `duration_minutes` (integer) - Estimated duration
      - `created_at` (timestamptz)

    - `lesson_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lesson_id` (uuid, references lessons)
      - `completed_at` (timestamptz)
      - `score` (integer) - For quizzes/exercises (0-100)
      - Unique constraint on (user_id, lesson_id)

    - `vocabulary`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, references lessons)
      - `term` (text) - Vocabulary term
      - `definition` (text) - Definition
      - `example_sentence` (text) - Example usage
      - `pronunciation` (text) - Phonetic pronunciation
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to view content
    - Add policies for users to track their own completions
*/

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  lesson_type text NOT NULL CHECK (lesson_type IN ('video', 'reading', 'quiz', 'exercise')),
  video_url text,
  order_index integer NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Lesson completions table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  score integer CHECK (score >= 0 AND score <= 100),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON lesson_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON lesson_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON lesson_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons ON DELETE CASCADE NOT NULL,
  term text NOT NULL,
  definition text NOT NULL,
  example_sentence text,
  pronunciation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vocabulary"
  ON vocabulary FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample modules and lessons for IT course
DO $$
DECLARE
  v_course_id uuid;
  v_module1_id uuid;
  v_module2_id uuid;
  v_lesson_id uuid;
BEGIN
  -- Get IT course ID
  SELECT id INTO v_course_id FROM courses WHERE field = 'IT' LIMIT 1;
  
  IF v_course_id IS NOT NULL THEN
    -- Create Module 1: Introduction
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (v_course_id, 'Module 1: Introduction', 'Introduction to IT English fundamentals', 1)
    RETURNING id INTO v_module1_id;
    
    -- Add lessons to Module 1
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module1_id, '1.1 Welcome to IT English', 'Introduction to the course and learning objectives', 'video', 1, 15),
      (v_module1_id, '1.2 Key Terminology', 'Essential IT vocabulary and concepts', 'reading', 2, 20);
    
    -- Create Module 2: Hardware
    INSERT INTO modules (course_id, title, description, order_index)
    VALUES (v_course_id, 'Module 2: Hardware', 'Computer hardware components and terminology', 2)
    RETURNING id INTO v_module2_id;
    
    -- Add lessons to Module 2
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module2_id, '2.1 Describing a CPU', 'Learn to describe computer processors in English', 'video', 1, 25)
      RETURNING id INTO v_lesson_id;
    
    -- Add vocabulary for CPU lesson
    INSERT INTO vocabulary (lesson_id, term, definition, example_sentence)
    VALUES 
      (v_lesson_id, 'Core', 'A processing unit within the CPU that can execute instructions independently', 'Modern CPUs often have multiple cores to handle several tasks simultaneously.'),
      (v_lesson_id, 'Clock Speed', 'The speed at which a CPU can execute instructions, measured in gigahertz (GHz)', 'A higher clock speed generally means faster processing performance.'),
      (v_lesson_id, 'Cache', 'Small, fast memory located close to the CPU cores for quick data access', 'The CPU cache stores frequently used data to improve processing speed.');
    
    INSERT INTO lessons (module_id, title, content, lesson_type, order_index, duration_minutes)
    VALUES 
      (v_module2_id, '2.2 Memory and Storage', 'Understanding RAM, ROM, and storage devices', 'reading', 2, 20),
      (v_module2_id, '2.3 Hardware Quiz', 'Test your knowledge of hardware terminology', 'quiz', 3, 15);
  END IF;
END $$;