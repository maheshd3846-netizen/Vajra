-- VAJRA Migration 00004: Company Verification, Trust Engine & Saved Internships

-- 1. Extend Companies Table with Verification & Trust Fields
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending', 'blacklisted')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS official_email TEXT,
ADD COLUMN IF NOT EXISTS registration_doc_url TEXT,
ADD COLUMN IF NOT EXISTS trust_score INT CHECK (trust_score >= 0 AND trust_score <= 100) DEFAULT 60;

-- Sync existing is_verified boolean with verification_status if needed
UPDATE public.companies 
SET verification_status = 'verified' 
WHERE is_verified = TRUE AND verification_status = 'pending';

-- 2. Create Saved Internships Table (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_internships (
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, internship_id)
);

-- 3. Enable RLS on saved_internships
ALTER TABLE public.saved_internships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for saved_internships
DROP POLICY IF EXISTS saved_internships_student_select ON public.saved_internships;
CREATE POLICY saved_internships_student_select ON public.saved_internships 
FOR SELECT TO authenticated 
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS saved_internships_student_insert ON public.saved_internships;
CREATE POLICY saved_internships_student_insert ON public.saved_internships 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS saved_internships_student_delete ON public.saved_internships;
CREATE POLICY saved_internships_student_delete ON public.saved_internships 
FOR DELETE TO authenticated 
USING (auth.uid() = student_id);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON public.companies(verification_status);
CREATE INDEX IF NOT EXISTS idx_saved_internships_student ON public.saved_internships(student_id);
