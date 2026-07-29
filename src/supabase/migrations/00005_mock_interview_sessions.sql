-- VAJRA Migration 00005: Mock Interview Sessions & AI Reports Extension

-- 1. Create Mock Interviews Table
CREATE TABLE IF NOT EXISTS public.mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 15,
  score NUMERIC(5,2) CHECK (score >= 0.00 AND score <= 100.00),
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for mock_interviews
DROP POLICY IF EXISTS mock_interviews_student_select ON public.mock_interviews;
CREATE POLICY mock_interviews_student_select ON public.mock_interviews 
FOR SELECT TO authenticated 
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS mock_interviews_student_insert ON public.mock_interviews;
CREATE POLICY mock_interviews_student_insert ON public.mock_interviews 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = student_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_mock_interviews_student ON public.mock_interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_created_at ON public.mock_interviews(created_at DESC);
