-- Remove FK constraint from food_logs to allow demo users
ALTER TABLE food_logs DROP CONSTRAINT food_logs_user_id_fkey;

-- Add UserID to Profiles manually if needed, or just allow it to exist without auth link for now
-- For now, just dropping the constraint is enough to unblock the demo.
