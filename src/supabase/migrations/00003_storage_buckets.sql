-- VAJRA Database Migration - Storage Buckets Setup & Security Policies (Idempotent Version)
-- Target Schema: storage / public

-- 1. Initialize Buckets safely
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf']),
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('company-documents', 'company-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('portfolio-assets', 'portfolio-assets', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies on storage.objects

-- ----------------------------------------------------
-- PROFILE PHOTOS BUCKET POLICIES
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Profile Photos are publicly viewable" ON storage.objects;
CREATE POLICY "Profile Photos are publicly viewable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ----------------------------------------------------
-- RESUMES BUCKET POLICIES (Private - Restricted)
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Users can read their own resumes" ON storage.objects;
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.get_auth_user_role() IN ('admin', 'super_admin') OR
    auth.uid()::text IN (
      SELECT mentor_id::text FROM public.mentor_assignments 
      WHERE student_id::text = (storage.foldername(name))[1] AND status = 'active'
    ) OR
    auth.uid()::text IN (
      SELECT company_id::text FROM public.internships 
      WHERE id IN (
        SELECT internship_id FROM public.applications 
        WHERE student_id::text = (storage.foldername(name))[1]
      )
    )
  )
);

DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ----------------------------------------------------
-- CERTIFICATES BUCKET POLICIES (Public readable)
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Certificates are publicly viewable" ON storage.objects;
CREATE POLICY "Certificates are publicly viewable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Users can upload their own certificates" ON storage.objects;
CREATE POLICY "Users can upload their own certificates"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own certificates" ON storage.objects;
CREATE POLICY "Users can update their own certificates"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own certificates" ON storage.objects;
CREATE POLICY "Users can delete their own certificates"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ----------------------------------------------------
-- COMPANY DOCUMENTS BUCKET POLICIES (Private - Restricted)
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Companies can read their own verification documents" ON storage.objects;
CREATE POLICY "Companies can read their own verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'company-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.get_auth_user_role() IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Companies can upload their own verification documents" ON storage.objects;
CREATE POLICY "Companies can upload their own verification documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Companies can update their own verification documents" ON storage.objects;
CREATE POLICY "Companies can update their own verification documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'company-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Companies can delete their own verification documents" ON storage.objects;
CREATE POLICY "Companies can delete their own verification documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'company-documents' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ----------------------------------------------------
-- PORTFOLIO ASSETS BUCKET POLICIES (Public readable)
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Portfolio assets are publicly viewable" ON storage.objects;
CREATE POLICY "Portfolio assets are publicly viewable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'portfolio-assets');

DROP POLICY IF EXISTS "Users can upload their own portfolio assets" ON storage.objects;
CREATE POLICY "Users can upload their own portfolio assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolio-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own portfolio assets" ON storage.objects;
CREATE POLICY "Users can update their own portfolio assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portfolio-assets' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'portfolio-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete their own portfolio assets" ON storage.objects;
CREATE POLICY "Users can delete their own portfolio assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portfolio-assets' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ----------------------------------------------------
-- MASTER ADMINISTRATIVE STORAGE POLICY
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to all storage objects" ON storage.objects;
CREATE POLICY "Admins have full access to all storage objects"
ON storage.objects FOR ALL TO authenticated
USING (public.get_auth_user_role() IN ('admin', 'super_admin'))
WITH CHECK (public.get_auth_user_role() IN ('admin', 'super_admin'));
