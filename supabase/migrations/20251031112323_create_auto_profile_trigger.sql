/*
  # Create Automatic Profile on User Signup

  1. Purpose
    - Automatically create a profile when a new user signs up
    - This ensures every user in auth.users has a corresponding profile
    - Eliminates manual profile creation errors in signup flow

  2. Implementation
    - Create a trigger function that fires when a new user is created
    - Function creates a profile with the user's ID
    - Uses SECURITY DEFINER to bypass RLS during creation

  3. Benefits
    - Guarantees data consistency between auth.users and profiles
    - Simplifies client-side signup logic
    - Prevents orphaned auth users without profiles
*/

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, professional_field, created_at, updated_at)
  VALUES (NEW.id, '', '', '', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
