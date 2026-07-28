-- VAJRA Database Migration - Initial Schema Setup
-- Target Schema: public

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create App Role Enum
CREATE TYPE public.app_role AS ENUM (
  'student',
  'company',
  'mentor',
  'admin',
  'super_admin'
);

-- 2. Create timestamp trigger helper
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Users table (Syncs with auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Student Profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  university TEXT,
  major TEXT,
  graduation_year INT CHECK (graduation_year >= 1900 AND graduation_year <= 2100),
  gpa NUMERIC(3,2) CHECK (gpa >= 0.00 AND gpa <= 4.00),
  github_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  logo_url TEXT,
  description TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Mentors
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  company_name TEXT,
  job_title TEXT,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  linkedin_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Internships
CREATE TABLE public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  type TEXT NOT NULL CHECK (type IN ('remote', 'hybrid', 'on-site')),
  requirements TEXT[] NOT NULL DEFAULT '{}',
  skills_needed TEXT[] NOT NULL DEFAULT '{}',
  salary_range TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL CHECK (status IN ('applied', 'reviewing', 'interviewing', 'accepted', 'rejected')) DEFAULT 'applied',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(internship_id, student_id)
);

-- 9. Create Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  github_url TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Create Student Skills
CREATE TABLE public.student_skills (
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('beginner', 'intermediate', 'advanced')),
  PRIMARY KEY (student_id, skill_name)
);

-- 11. Create Resumes
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Create Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Create Mentor Assignments
CREATE TABLE public.mentor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'terminated')) DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(mentor_id, student_id, status)
);

-- 14. Create Mentor Feedback
CREATE TABLE public.mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.mentor_assignments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Create Portfolios
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  asset_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Create AI Reports
CREATE TABLE public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('resume_review', 'interview_prep', 'career_path', 'skills_gap')),
  content JSONB NOT NULL,
  score NUMERIC(5,2) CHECK (score >= 0.00 AND score <= 100.00),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Create Career Timeline
CREATE TABLE public.career_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('education', 'project', 'internship', 'skill_acquired', 'certificate')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Create Activity Feed
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Create Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_mentors_updated_at ON public.mentors;
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_internships_updated_at ON public.internships;
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 21. Automatic replication trigger from auth.users to public.users
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
  );
  
  -- Create profile sub-entries based on the user's role to keep profiles structured
  IF default_role = 'student' THEN
    INSERT INTO public.student_profiles (id) VALUES (new.id);
  ELSIF default_role = 'company' THEN
    INSERT INTO public.companies (id, name) VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'company_name', 'My Company'));
  ELSIF default_role = 'mentor' THEN
    INSERT INTO public.mentors (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 22. Indexes for search and key relationships
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_student_profiles_university ON public.student_profiles(university);
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_internships_company_id ON public.internships(company_id);
CREATE INDEX idx_internships_status ON public.internships(status);
CREATE INDEX idx_applications_internship_id ON public.applications(internship_id);
CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_projects_student_id ON public.projects(student_id);
CREATE INDEX idx_student_skills_student_id ON public.student_skills(student_id);
CREATE INDEX idx_resumes_student_id ON public.resumes(student_id);
CREATE INDEX idx_certificates_student_id ON public.certificates(student_id);
CREATE INDEX idx_mentor_assignments_mentor_id ON public.mentor_assignments(mentor_id);
CREATE INDEX idx_mentor_assignments_student_id ON public.mentor_assignments(student_id);
CREATE INDEX idx_mentor_assignments_status ON public.mentor_assignments(status);
CREATE INDEX idx_mentor_feedback_assignment_id ON public.mentor_feedback(assignment_id);
CREATE INDEX idx_portfolios_student_id ON public.portfolios(student_id);
CREATE INDEX idx_ai_reports_student_id ON public.ai_reports(student_id);
CREATE INDEX idx_career_timeline_student_id ON public.career_timeline(student_id);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(table_name, record_id);
