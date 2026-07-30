-- VAJRA Migration 00010: Registered Companies Sync & RLS Policy Update

-- 1. Ensure any existing users with role = 'company' have a corresponding record in public.companies
INSERT INTO public.companies (id, name, official_email, contact_email, verification_status, status, created_at, updated_at)
SELECT 
  u.id, 
  COALESCE(u.full_name, 'Registered Company'), 
  u.email, 
  u.email, 
  'pending', 
  'active', 
  u.created_at, 
  u.updated_at
FROM public.users u
WHERE u.role = 'company'
ON CONFLICT (id) DO UPDATE SET
  official_email = COALESCE(public.companies.official_email, EXCLUDED.official_email),
  contact_email = COALESCE(public.companies.contact_email, EXCLUDED.contact_email);

-- 2. Update existing company records to sync official_email from users if NULL
UPDATE public.companies c
SET official_email = u.email, contact_email = u.email
FROM public.users u
WHERE c.id = u.id AND c.official_email IS NULL;

-- 3. Enhance handle_new_user trigger function to populate official_email & status on company registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger SECURITY DEFINER SET search_path = public AS $$
DECLARE
  default_role public.app_role;
BEGIN
  BEGIN
    default_role := COALESCE((new.raw_user_meta_data ->> 'role')::public.app_role, 'student'::public.app_role);
  EXCEPTION WHEN OTHERS THEN
    default_role := 'student'::public.app_role;
  END;

  INSERT INTO public.users (id, email, role, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    default_role,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  
  IF default_role = 'student' THEN
    INSERT INTO public.student_profiles (id) VALUES (new.id) ON CONFLICT (id) DO NOTHING;
  ELSIF default_role = 'company' THEN
    INSERT INTO public.companies (
      id, 
      name, 
      official_email, 
      contact_email, 
      verification_status, 
      status
    ) VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'company_name', new.raw_user_meta_data ->> 'full_name', 'Registered Company'),
      new.email,
      new.email,
      'pending',
      'active'
    ) ON CONFLICT (id) DO UPDATE SET
      official_email = COALESCE(public.companies.official_email, EXCLUDED.official_email),
      contact_email = COALESCE(public.companies.contact_email, EXCLUDED.contact_email);
  ELSIF default_role = 'mentor' THEN
    INSERT INTO public.mentors (id) VALUES (new.id) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 4. Update RLS Policy so Mentors and Admins can SELECT ALL companies
DROP POLICY IF EXISTS mentor_read_all_companies ON public.companies;
CREATE POLICY mentor_read_all_companies ON public.companies
  FOR SELECT TO authenticated
  USING (
    public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin')
  );
