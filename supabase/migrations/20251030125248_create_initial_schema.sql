/*
  # Vocational English Platform - Initial Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `professional_field` (text) - User's vocational field (IT, Electronics, etc.)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `courses`
      - `id` (uuid, primary key)
      - `title` (text) - Course title
      - `description` (text) - Course description
      - `field` (text) - Professional field (IT, Elektrik-Elektronik, etc.)
      - `icon` (text) - Icon identifier
      - `created_at` (timestamptz)

    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course_id` (uuid, references courses)
      - `progress_percentage` (integer, 0-100)
      - `total_points` (integer)
      - `hours_studied` (integer)
      - `current_streak` (integer)
      - `last_activity_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - Achievement title
      - `description` (text) - Achievement description
      - `icon` (text) - Icon identifier
      - `points_earned` (integer)
      - `earned_at` (timestamptz)

    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_type` (text) - Type of activity (completed, passed, earned)
      - `title` (text) - Activity title
      - `points` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for courses table
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  professional_field text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  field text NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses ON DELETE CASCADE NOT NULL,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_points integer DEFAULT 0,
  hours_studied integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  points_earned integer DEFAULT 0,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default courses
INSERT INTO courses (title, description, field, icon) VALUES
  ('Yazılım ve Donanım Terminolojisi', 'IT terminology and technical communication', 'IT', 'laptop'),
  ('Devreler ve Sistemler İçin İngilizce', 'Circuits and systems vocabulary', 'Elektrik-Elektronik', 'zap'),
  ('Laboratuvar ve Endüstriyel Kimya', 'Laboratory and industrial chemistry terms', 'Kimya', 'flask-conical'),
  ('Tasarım ve İmalat Terminleri', 'Design and manufacturing terminology', 'Mobilya', 'hammer'),
  ('Tıbbi Cihazlar ve Teknoloji', 'Medical devices and technology', 'Biyomedikal', 'heart-pulse'),
  ('İklimlendirme Sistemleri', 'HVAC systems and climate control', 'HVAC', 'wind'),
  ('Mühendislik Terimler', 'Mechanical engineering terms', 'Mekanik', 'cog')
ON CONFLICT DO NOTHING;