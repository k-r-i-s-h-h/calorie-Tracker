-- Add streak tracking fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_log_date date;

-- Reset all streaks to start fresh
UPDATE profiles SET current_streak = 0, last_log_date = NULL;
