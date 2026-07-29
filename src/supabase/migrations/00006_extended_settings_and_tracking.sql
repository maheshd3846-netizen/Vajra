-- VAJRA Migration 00006: Extended Settings, Company Intern Tracker, Mentor Onboarding & RLS Policies

-- 1. Extend Student Profiles Table
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
ADD COLUMN IF NOT EXISTS target_role TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Extend Companies Table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS hr_name TEXT;

-- 3. Extend Mentors Table
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 4. Extend Internships Table
ALTER TABLE public.internships 
ADD COLUMN IF NOT EXISTS internship_type TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS stipend TEXT,
ADD COLUMN IF NOT EXISTS eligibility TEXT,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS openings_count INT DEFAULT 1;

-- Drop existing status check constraints to expand allowed status values safely
ALTER TABLE public.internships DROP CONSTRAINT IF EXISTS internships_status_check;
ALTER TABLE public.internships ADD CONSTRAINT internships_status_check 
  CHECK (status IN ('draft', 'published', 'open', 'closed'));

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'interviewing', 'accepted', 'rejected'));

-- 5. Create Company Interns Table (Intern Tracker)
CREATE TABLE IF NOT EXISTS public.company_interns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_pct INT CHECK (progress_pct >= 0 AND progress_pct <= 100) DEFAULT 0,
  attendance_pct INT CHECK (attendance_pct >= 0 AND attendance_pct <= 100) DEFAULT 100,
  status TEXT CHECK (status IN ('active', 'completed', 'terminated')) DEFAULT 'active',
  notes TEXT,
  rating NUMERIC(3,2) CHECK (rating >= 0.00 AND rating <= 5.00),
  weekly_reports JSONB NOT NULL DEFAULT '[]',
  assigned_tasks JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, student_id, internship_id)
);

-- Trigger for updated_at on company_interns
DROP TRIGGER IF EXISTS update_company_interns_updated_at ON public.company_interns;
CREATE TRIGGER update_company_interns_updated_at 
  BEFORE UPDATE ON public.company_interns 
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 6. Trigger to automatically create Intern Tracker record when application status becomes 'accepted'
CREATE OR REPLACE FUNCTION public.handle_application_accepted()
RETURNS trigger SECURITY DEFINER SET search_path = public AS $$
DECLARE
  comp_id UUID;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    SELECT company_id INTO comp_id FROM public.internships WHERE id = NEW.internship_id;
    IF comp_id IS NOT NULL THEN
      INSERT INTO public.company_interns (company_id, student_id, internship_id, joining_date, status)
      VALUES (comp_id, NEW.student_id, NEW.internship_id, CURRENT_DATE, 'active')
      ON CONFLICT (company_id, student_id, internship_id) 
      DO UPDATE SET status = 'active', updated_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_accepted ON public.applications;
CREATE TRIGGER on_application_accepted
  AFTER INSERT OR UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_accepted();

-- 7. RLS Policies for company_interns
ALTER TABLE public.company_interns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_interns_company_manage ON public.company_interns;
CREATE POLICY company_interns_company_manage ON public.company_interns 
  FOR ALL TO authenticated 
  USING (company_id = auth.uid()) 
  WITH CHECK (company_id = auth.uid());

DROP POLICY IF EXISTS company_interns_student_read ON public.company_interns;
CREATE POLICY company_interns_student_read ON public.company_interns 
  FOR SELECT TO authenticated 
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS company_interns_mentor_read ON public.company_interns;
CREATE POLICY company_interns_mentor_read ON public.company_interns 
  FOR SELECT TO authenticated 
  USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS admin_all_company_interns ON public.company_interns;
CREATE POLICY admin_all_company_interns ON public.company_interns 
  TO authenticated 
  USING (public.get_auth_user_role() IN ('admin', 'super_admin')) 
  WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));

-- 8. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_company_interns_company ON public.company_interns(company_id);
CREATE INDEX IF NOT EXISTS idx_company_interns_student ON public.company_interns(student_id);
CREATE INDEX IF NOT EXISTS idx_company_interns_mentor ON public.company_interns(mentor_id);
CREATE INDEX IF NOT EXISTS idx_company_interns_status ON public.company_interns(status);
