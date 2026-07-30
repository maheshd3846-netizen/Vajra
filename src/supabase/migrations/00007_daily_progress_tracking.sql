-- VAJRA Migration 00007: Daily Internship Progress Tracking System

-- 1. Create Daily Progress Reports Table
CREATE TABLE IF NOT EXISTS public.daily_progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  todays_tasks TEXT NOT NULL,
  tasks_completed TEXT NOT NULL,
  hours_worked NUMERIC(4,1) NOT NULL CHECK (hours_worked >= 0.0 AND hours_worked <= 24.0),
  skills_used TEXT[] DEFAULT '{}',
  technologies_used TEXT[] DEFAULT '{}',
  challenges_faced TEXT,
  solutions_implemented TEXT,
  learning_outcome TEXT,
  tomorrows_plan TEXT,
  mood TEXT CHECK (mood IN ('great', 'neutral', 'bad')) DEFAULT 'great',
  productivity_rating INT CHECK (productivity_rating >= 1 AND productivity_rating <= 5) DEFAULT 4,
  work_status TEXT CHECK (work_status IN ('not_started', 'in_progress', 'completed', 'blocked')) DEFAULT 'completed',
  attachments JSONB NOT NULL DEFAULT '[]',
  ai_feedback JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, internship_id, report_date)
);

-- Trigger for updated_at on daily_progress_reports
DROP TRIGGER IF EXISTS update_daily_progress_reports_updated_at ON public.daily_progress_reports;
CREATE TRIGGER update_daily_progress_reports_updated_at 
  BEFORE UPDATE ON public.daily_progress_reports 
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 2. Create Progress Mentor Reviews Table
CREATE TABLE IF NOT EXISTS public.progress_mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.daily_progress_reports(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'needs_revision')) DEFAULT 'approved',
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  comments TEXT,
  achievements_marked TEXT[] DEFAULT '{}',
  suggested_improvements TEXT,
  assigned_next_tasks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, mentor_id)
);

-- Trigger for updated_at on progress_mentor_reviews
DROP TRIGGER IF EXISTS update_progress_mentor_reviews_updated_at ON public.progress_mentor_reviews;
CREATE TRIGGER update_progress_mentor_reviews_updated_at 
  BEFORE UPDATE ON public.progress_mentor_reviews 
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. Create Progress Notifications Table
CREATE TABLE IF NOT EXISTS public.progress_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.daily_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_progress_reports
DROP POLICY IF EXISTS progress_reports_student_manage ON public.daily_progress_reports;
CREATE POLICY progress_reports_student_manage ON public.daily_progress_reports
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS progress_reports_company_read ON public.daily_progress_reports;
CREATE POLICY progress_reports_company_read ON public.daily_progress_reports
  FOR SELECT TO authenticated
  USING (company_id = auth.uid());

DROP POLICY IF EXISTS progress_reports_mentor_read ON public.daily_progress_reports;
CREATE POLICY progress_reports_mentor_read ON public.daily_progress_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_interns ci
      WHERE ci.student_id = daily_progress_reports.student_id
        AND ci.mentor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS progress_reports_admin_all ON public.daily_progress_reports;
CREATE POLICY progress_reports_admin_all ON public.daily_progress_reports
  TO authenticated
  USING (public.get_auth_user_role() IN ('admin', 'super_admin'))
  WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));

-- RLS Policies for progress_mentor_reviews
DROP POLICY IF EXISTS mentor_reviews_mentor_manage ON public.progress_mentor_reviews;
CREATE POLICY mentor_reviews_mentor_manage ON public.progress_mentor_reviews
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

DROP POLICY IF EXISTS mentor_reviews_student_read ON public.progress_mentor_reviews;
CREATE POLICY mentor_reviews_student_read ON public.progress_mentor_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_progress_reports dpr
      WHERE dpr.id = progress_mentor_reviews.report_id
        AND dpr.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS mentor_reviews_company_read ON public.progress_mentor_reviews;
CREATE POLICY mentor_reviews_company_read ON public.progress_mentor_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_progress_reports dpr
      WHERE dpr.id = progress_mentor_reviews.report_id
        AND dpr.company_id = auth.uid()
    )
  );

-- RLS Policies for progress_notifications
DROP POLICY IF EXISTS progress_notifications_user_manage ON public.progress_notifications;
CREATE POLICY progress_notifications_user_manage ON public.progress_notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_progress_reports_student ON public.daily_progress_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_company ON public.daily_progress_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_date ON public.daily_progress_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_report ON public.progress_mentor_reviews(report_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor ON public.progress_mentor_reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_progress_notifications_user ON public.progress_notifications(user_id);
