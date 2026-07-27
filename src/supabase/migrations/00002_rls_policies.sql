-- VAJRA Database Migration - Row Level Security (RLS) Policies
-- Target Schema: public

-- Helper function to get role of current authenticated user safely (Security Definer to bypass recursion)
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS public.app_role SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- GENERAL ADMINISTRATIVE POLICIES (Full access to Admin / Super Admin)
-- ----------------------------------------------------

CREATE POLICY admin_all_users ON public.users TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_student_profiles ON public.student_profiles TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_companies ON public.companies TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_mentors ON public.mentors TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_internships ON public.internships TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_applications ON public.applications TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_projects ON public.projects TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_student_skills ON public.student_skills TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_resumes ON public.resumes TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_certificates ON public.certificates TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_mentor_assignments ON public.mentor_assignments TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_mentor_feedback ON public.mentor_feedback TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_portfolios ON public.portfolios TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_ai_reports ON public.ai_reports TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_career_timeline ON public.career_timeline TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_activity_feed ON public.activity_feed TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
CREATE POLICY admin_all_audit_logs ON public.audit_logs TO authenticated USING (public.get_auth_user_role() IN ('admin', 'super_admin')) WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));

-- ----------------------------------------------------
-- 1. USERS POLICIES
-- ----------------------------------------------------
CREATE POLICY users_read_authenticated ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY users_update_self ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

-- ----------------------------------------------------
-- 2. STUDENT PROFILES POLICIES
-- ----------------------------------------------------
CREATE POLICY student_profiles_read_authenticated ON public.student_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY student_profiles_update_self ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 3. COMPANIES POLICIES
-- ----------------------------------------------------
CREATE POLICY companies_read_authenticated ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY companies_update_self ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 4. MENTORS POLICIES
-- ----------------------------------------------------
CREATE POLICY mentors_read_authenticated ON public.mentors FOR SELECT TO authenticated USING (true);
CREATE POLICY mentors_update_self ON public.mentors FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 5. INTERNSHIPS POLICIES
-- ----------------------------------------------------
CREATE POLICY internships_read_authenticated ON public.internships FOR SELECT TO authenticated USING (status = 'open' OR company_id = auth.uid());
CREATE POLICY internships_manage_company ON public.internships FOR ALL TO authenticated USING (company_id = auth.uid()) WITH CHECK (company_id = auth.uid());

-- ----------------------------------------------------
-- 6. APPLICATIONS POLICIES
-- ----------------------------------------------------
CREATE POLICY applications_read_student ON public.applications FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY applications_read_company ON public.applications FOR SELECT TO authenticated USING (
  internship_id IN (SELECT id FROM public.internships WHERE company_id = auth.uid())
);
CREATE POLICY applications_insert_student ON public.applications FOR INSERT TO authenticated WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.student_profiles WHERE id = auth.uid())
);
CREATE POLICY applications_update_status_company ON public.applications FOR UPDATE TO authenticated USING (
  internship_id IN (SELECT id FROM public.internships WHERE company_id = auth.uid())
) WITH CHECK (
  internship_id IN (SELECT id FROM public.internships WHERE company_id = auth.uid())
);

-- ----------------------------------------------------
-- 7. PROJECTS POLICIES
-- ----------------------------------------------------
CREATE POLICY projects_read_authenticated ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY projects_manage_student ON public.projects FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 8. STUDENT SKILLS POLICIES
-- ----------------------------------------------------
CREATE POLICY student_skills_read_authenticated ON public.student_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY student_skills_manage_student ON public.student_skills FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 9. RESUMES POLICIES
-- ----------------------------------------------------
CREATE POLICY resumes_read_owner ON public.resumes FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY resumes_read_assigned_mentor ON public.resumes FOR SELECT TO authenticated USING (
  student_id IN (SELECT student_id FROM public.mentor_assignments WHERE mentor_id = auth.uid() AND status = 'active')
);
CREATE POLICY resumes_read_applying_company ON public.resumes FOR SELECT TO authenticated USING (
  student_id IN (
    SELECT student_id FROM public.applications 
    WHERE internship_id IN (SELECT id FROM public.internships WHERE company_id = auth.uid())
  )
);
CREATE POLICY resumes_manage_student ON public.resumes FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 10. CERTIFICATES POLICIES
-- ----------------------------------------------------
CREATE POLICY certificates_read_authenticated ON public.certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY certificates_manage_student ON public.certificates FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 11. MENTOR ASSIGNMENTS POLICIES
-- ----------------------------------------------------
CREATE POLICY mentor_assignments_read_involved ON public.mentor_assignments FOR SELECT TO authenticated USING (student_id = auth.uid() OR mentor_id = auth.uid());

-- ----------------------------------------------------
-- 12. MENTOR FEEDBACK POLICIES
-- ----------------------------------------------------
CREATE POLICY mentor_feedback_read_involved ON public.mentor_feedback FOR SELECT TO authenticated USING (
  assignment_id IN (SELECT id FROM public.mentor_assignments WHERE student_id = auth.uid() OR mentor_id = auth.uid())
);
CREATE POLICY mentor_feedback_insert_author ON public.mentor_feedback FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND
  assignment_id IN (SELECT id FROM public.mentor_assignments WHERE (student_id = auth.uid() OR mentor_id = auth.uid()) AND status = 'active')
);

-- ----------------------------------------------------
-- 13. PORTFOLIOS POLICIES
-- ----------------------------------------------------
CREATE POLICY portfolios_read_authenticated ON public.portfolios FOR SELECT TO authenticated USING (true);
CREATE POLICY portfolios_manage_student ON public.portfolios FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 14. AI REPORTS POLICIES
-- ----------------------------------------------------
CREATE POLICY ai_reports_read_owner ON public.ai_reports FOR SELECT TO authenticated USING (student_id = auth.uid());

-- ----------------------------------------------------
-- 15. CAREER TIMELINE POLICIES
-- ----------------------------------------------------
CREATE POLICY career_timeline_read_authenticated ON public.career_timeline FOR SELECT TO authenticated USING (true);
CREATE POLICY career_timeline_manage_student ON public.career_timeline FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- ----------------------------------------------------
-- 16. ACTIVITY FEED POLICIES
-- ----------------------------------------------------
CREATE POLICY activity_feed_read_self ON public.activity_feed FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ----------------------------------------------------
-- 17. AUDIT LOGS POLICIES
-- ----------------------------------------------------
-- Only admins have read policies. Write is automatically executed via backend functions.
