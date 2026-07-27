-- Force confirm all users in Supabase Auth to unblock development
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
