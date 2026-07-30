-- VAJRA Migration 00011: Enterprise Internship Approval & Application Workflow

-- 1. Update Internships Table Status Check Constraint & Metadata Fields
ALTER TABLE public.internships DROP CONSTRAINT IF EXISTS internships_status_check;
ALTER TABLE public.internships DROP CONSTRAINT IF EXISTS internships_type_check;

ALTER TABLE public.internships ADD CONSTRAINT internships_status_check 
  CHECK (status IN ('pending_approval', 'approved', 'changes_requested', 'rejected', 'suspended', 'archived', 'open', 'closed'));

ALTER TABLE public.internships 
  ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stipend TEXT,
  ADD COLUMN IF NOT EXISTS duration TEXT,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS deadline DATE,
  ADD COLUMN IF NOT EXISTS openings_count INT DEFAULT 1;

-- Default new internships to 'pending_approval'
ALTER TABLE public.internships ALTER COLUMN status SET DEFAULT 'pending_approval';

-- 2. Update Applications Table Status Check Constraint & Fields
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected', 'accepted', 'rejected', 'joined', 'completed', 'withdrawn'));

ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interview_notes TEXT,
  ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ;

-- 3. Create Internship Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.internship_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Interview Schedule Table
CREATE TABLE IF NOT EXISTS public.interview_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  interview_date TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  location TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Performance Reviews Table
CREATE TABLE IF NOT EXISTS public.internship_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
  rating NUMERIC(3,2) CHECK (rating >= 0.00 AND rating <= 5.00),
  feedback TEXT NOT NULL,
  reviewer_role public.app_role NOT NULL DEFAULT 'company',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
  serial_number TEXT UNIQUE NOT NULL DEFAULT ('CERT-' || upper(substring(md5(random()::text) from 1 for 10))),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Platform Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_internships_status ON public.internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_company ON public.internships(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON public.applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_interview_schedule_student ON public.interview_schedule(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_schedule_company ON public.interview_schedule(company_id);

-- 9. Comprehensive RLS Policies

-- Enable RLS on all newly created tables
ALTER TABLE public.internship_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9.1 Internships Policies: Students read ONLY approved/open internships
DROP POLICY IF EXISTS internships_read_open ON public.internships;
CREATE POLICY internships_read_open ON public.internships
  FOR SELECT TO authenticated
  USING (
    status IN ('approved', 'open') 
    OR company_id = auth.uid()
    OR public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin')
  );

-- 9.2 Mentors & Admins can manage ALL internships
DROP POLICY IF EXISTS mentor_admin_manage_internships ON public.internships;
CREATE POLICY mentor_admin_manage_internships ON public.internships
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin'));

-- 9.3 Notifications Policies: Users can view and update own notifications
DROP POLICY IF EXISTS notifications_self_manage ON public.notifications;
CREATE POLICY notifications_self_manage ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9.4 Interview Schedule Policies
DROP POLICY IF EXISTS interviews_read_involved ON public.interview_schedule;
CREATE POLICY interviews_read_involved ON public.interview_schedule
  FOR ALL TO authenticated
  USING (
    student_id = auth.uid() 
    OR company_id = auth.uid() 
    OR public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin')
  )
  WITH CHECK (
    company_id = auth.uid() 
    OR public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin')
  );

-- 9.5 Certificates Policies
DROP POLICY IF EXISTS certificates_read_involved ON public.certificates;
CREATE POLICY certificates_read_involved ON public.certificates
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() 
    OR company_id = auth.uid() 
    OR public.get_auth_user_role() IN ('mentor', 'admin', 'super_admin')
  );
