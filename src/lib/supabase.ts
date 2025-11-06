import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  professional_field: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  field: string;
  icon: string | null;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  total_points: number;
  hours_studied: number;
  current_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  points_earned: number;
  earned_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  points: number;
  created_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  progress_reminders: boolean;
  new_content_alerts: boolean;
  interface_language: string;
  created_at: string;
  updated_at: string;
};
