/*
  # Fix Function Search Path

  1. Purpose
    - Add SECURITY DEFINER and SET search_path to create_user_settings function
    - This prevents search path manipulation attacks
    - Ensures function runs with proper schema context

  2. Changes
    - Drop and recreate create_user_settings function with secure search_path
    - Set search_path to 'public' to prevent schema injection

  3. Security Impact
    - Prevents malicious users from manipulating search_path
    - Ensures function always operates in the correct schema context
*/

-- Drop existing function
DROP FUNCTION IF EXISTS create_user_settings() CASCADE;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_user_settings_trigger ON profiles;

CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_settings();
