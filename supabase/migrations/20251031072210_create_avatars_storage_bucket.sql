/*
  # Create Storage Bucket for User Avatars

  1. Storage
    - Create `avatars` bucket for storing user profile pictures
    - Enable public access for avatar images

  2. Important Notes
    - File paths will be structured as: {user_id}/avatar.{extension}
    - Old avatar files will be automatically replaced when new ones are uploaded
    - RLS policies are handled automatically by Supabase for storage buckets
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;