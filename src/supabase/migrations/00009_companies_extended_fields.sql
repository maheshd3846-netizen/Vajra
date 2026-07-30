-- VAJRA Migration 00009: Companies Extended Fields, Standalone Entry & Mentor RLS Scoping

-- 1. Ensure id in public.companies has DEFAULT gen_random_uuid()
ALTER TABLE public.companies ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Drop foreign key constraint on id referencing users(id) if it exists, so standalone partner companies can be created
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_id_fkey;

-- 3. Extend public.companies with all requested metadata fields
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 4. Expand verification_status & status check constraints
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_verification_status_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_verification_status_check 
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended', 'blacklisted'));

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE public.companies ADD CONSTRAINT companies_status_check 
  CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'rejected'));

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON public.companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);

-- 6. Update RLS Policies for Mentors to CRUD companies
DROP POLICY IF EXISTS mentor_scoped_companies ON public.companies;
CREATE POLICY mentor_scoped_companies ON public.companies
  FOR ALL TO authenticated
  USING (
    public.get_auth_user_role() = 'mentor'
  )
  WITH CHECK (
    public.get_auth_user_role() = 'mentor'
  );
