-- 1. Create a function to automatically delete the Prisma User when Supabase Auth User is deleted
CREATE OR REPLACE FUNCTION public.handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public."User" WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the Supabase auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_user();

-- 3. Clean up the ghost user that is blocking the current registration
DELETE FROM public."User" WHERE email = 'kouseikou13@gmail.com';
