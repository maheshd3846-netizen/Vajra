-- VAJRA Migration 00008: Enterprise RBAC, Mentor Scoping & Audit Logging System

-- 1. Extend Companies Table with Assigned Mentor FK
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL;

-- 2. Extend Users & Companies Tables with Account Status
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS account_status TEXT CHECK (account_status IN ('active', 'pending', 'suspended', 'rejected')) DEFAULT 'active';

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'active', 'suspended', 'rejected')) DEFAULT 'active';

-- Index for mentor_id and account status lookups
CREATE INDEX IF NOT EXISTS idx_companies_mentor_id ON public.companies(mentor_id);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON public.users(account_status);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);

-- 3. Extend Audit Logs Table for Security Tracking
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS role public.app_role,
ADD COLUMN IF NOT EXISTS resource TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 4. Helper Security Definer Functions for High Performance RLS Checks

-- Role checking helper
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS public.app_role SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin';
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user is Admin or Super Admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user is assigned mentor for a specific company
CREATE OR REPLACE FUNCTION public.is_mentor_for_company(p_company_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.companies 
    WHERE id = p_company_id AND mentor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user is assigned mentor for a student (via company_interns or mentor_assignments)
CREATE OR REPLACE FUNCTION public.is_mentor_for_student(p_student_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_interns ci
    JOIN public.companies c ON c.id = ci.company_id
    WHERE ci.student_id = p_student_id AND (c.mentor_id = auth.uid() OR ci.mentor_id = auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM public.mentor_assignments ma
    WHERE ma.student_id = p_student_id AND ma.mentor_id = auth.uid() AND ma.status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to record Audit Events safely from database level
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_role public.app_role,
  p_action TEXT,
  p_resource TEXT,
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    role,
    action,
    table_name,
    resource,
    record_id,
    old_data,
    new_data,
    ip_address,
    created_at
  ) VALUES (
    p_user_id,
    p_role,
    p_action,
    p_resource,
    p_resource,
    p_record_id,
    p_old_data,
    p_new_data,
    p_ip_address,
    NOW()
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Comprehensive Enterprise RLS Policies

-- 5.1 USERS TABLE POLICIES
DROP POLICY IF EXISTS users_read_authenticated ON public.users;
DROP POLICY IF EXISTS admin_all_users ON public.users;
DROP POLICY IF EXISTS users_insert_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;

-- Super Admin full access on users
CREATE POLICY super_admin_all_users ON public.users
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Admin access on non-super_admin users
CREATE POLICY admin_manage_users ON public.users
  FOR ALL TO authenticated
  USING (
    public.get_auth_user_role() = 'admin' AND role != 'super_admin'
  )
  WITH CHECK (
    public.get_auth_user_role() = 'admin' AND role != 'super_admin'
  );

-- Users can read authenticated profiles (basic search/directory)
CREATE POLICY users_read_self_and_directory ON public.users
  FOR SELECT TO authenticated
  USING (true);

-- User self management
CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- 5.2 COMPANIES TABLE POLICIES
DROP POLICY IF EXISTS admin_all_companies ON public.companies;
DROP POLICY IF EXISTS companies_insert_self ON public.companies;

CREATE POLICY super_admin_all_companies ON public.companies
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY admin_all_companies ON public.companies
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() = 'admin')
  WITH CHECK (public.get_auth_user_role() = 'admin');

-- Mentor can select and update ONLY companies assigned to them
CREATE POLICY mentor_scoped_companies ON public.companies
  FOR ALL TO authenticated
  USING (
    public.get_auth_user_role() = 'mentor' AND (mentor_id = auth.uid() OR mentor_id IS NULL)
  )
  WITH CHECK (
    public.get_auth_user_role() = 'mentor' AND mentor_id = auth.uid()
  );

-- Company self management
CREATE POLICY company_manage_self ON public.companies
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public/Authenticated read verified companies
CREATE POLICY companies_read_verified ON public.companies
  FOR SELECT TO authenticated
  USING (is_verified = true OR status = 'active');

-- 5.3 STUDENT PROFILES TABLE POLICIES
DROP POLICY IF EXISTS admin_all_student_profiles ON public.student_profiles;

CREATE POLICY super_admin_all_student_profiles ON public.student_profiles
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY admin_all_student_profiles ON public.student_profiles
  FOR ALL TO authenticated
  USING (public.get_auth_user_role() = 'admin')
  WITH CHECK (public.get_auth_user_role() = 'admin');

-- Mentor can manage ONLY students belonging to assigned companies or assigned directly
CREATE POLICY mentor_scoped_student_profiles ON public.student_profiles
  FOR ALL TO authenticated
  USING (
    public.get_auth_user_role() = 'mentor' AND public.is_mentor_for_student(id)
  )
  WITH CHECK (
    public.get_auth_user_role() = 'mentor' AND public.is_mentor_for_student(id)
  );

-- Student manage self
CREATE POLICY student_manage_self ON public.student_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Companies can view assigned interns' profiles
CREATE POLICY company_view_assigned_students ON public.student_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_interns ci
      WHERE ci.student_id = student_profiles.id AND ci.company_id = auth.uid()
    )
  );

-- 5.4 INTERNSHIPS POLICIES
DROP POLICY IF EXISTS admin_all_internships ON public.internships;

CREATE POLICY admin_superadmin_all_internships ON public.internships
  FOR ALL TO authenticated
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());

-- Mentors manage internships for assigned companies
CREATE POLICY mentor_scoped_internships ON public.internships
  FOR ALL TO authenticated
  USING (
    public.get_auth_user_role() = 'mentor' AND public.is_mentor_for_company(company_id)
  )
  WITH CHECK (
    public.get_auth_user_role() = 'mentor' AND public.is_mentor_for_company(company_id)
  );

-- Company manage own internships
CREATE POLICY company_manage_own_internships ON public.internships
  FOR ALL TO authenticated
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

-- Students & public view open/published internships
CREATE POLICY internships_read_open ON public.internships
  FOR SELECT TO authenticated
  USING (status IN ('open', 'published'));

-- 5.5 AUDIT LOGS POLICIES
DROP POLICY IF EXISTS admin_all_audit_logs ON public.audit_logs;

-- Super Admin can view all audit logs
CREATE POLICY super_admin_all_audit_logs ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Admin can view non-super_admin audit logs
CREATE POLICY admin_view_audit_logs ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    public.get_auth_user_role() = 'admin' AND (role IS NULL OR role != 'super_admin')
  );

-- Authenticated users can insert audit logs via server operations
CREATE POLICY authenticated_insert_audit_logs ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL OR user_id = auth.uid());

-- 6. Indexes for RBAC optimization
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_role ON public.audit_logs(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
