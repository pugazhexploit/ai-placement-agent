-- ====================================================================
-- CampusHire: Remaining Tables, Policies & Seeds
-- Run this in your Supabase SQL Editor
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    year TEXT,
    register_number TEXT UNIQUE,
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PLACEMENT DRIVES TABLE
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    job_role TEXT NOT NULL,
    description TEXT,
    package TEXT NOT NULL,
    location TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    drive_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    drive_id UUID NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected')) DEFAULT 'Applied',
    applied_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (student_id, drive_id)
);

-- 5. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. QUIZ ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL
);

-- 7. MOCK INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_role TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- RLS POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies
CREATE POLICY "Companies read all" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Companies staff manage" ON public.companies FOR ALL USING (public.is_staff());

-- Placement Drives
CREATE POLICY "Drives read all" ON public.placement_drives FOR SELECT USING (true);
CREATE POLICY "Drives staff manage" ON public.placement_drives FOR ALL USING (public.is_staff());

-- Applications
CREATE POLICY "Applications read own or staff" ON public.applications FOR SELECT USING (student_id = auth.uid() OR public.is_staff());
CREATE POLICY "Applications insert own" ON public.applications FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Applications staff update" ON public.applications FOR UPDATE USING (public.is_staff());

-- Quiz Attempts & Answers
CREATE POLICY "Quiz attempts read" ON public.quiz_attempts FOR SELECT USING (student_id = auth.uid() OR public.is_staff());
CREATE POLICY "Quiz attempts insert" ON public.quiz_attempts FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Quiz answers read" ON public.quiz_answers FOR SELECT USING (true);
CREATE POLICY "Quiz answers insert" ON public.quiz_answers FOR INSERT WITH CHECK (true);

-- Mock Interviews
CREATE POLICY "Mock interviews read" ON public.mock_interviews FOR SELECT USING (student_id = auth.uid() OR public.is_staff());
CREATE POLICY "Mock interviews insert" ON public.mock_interviews FOR INSERT WITH CHECK (student_id = auth.uid());

-- ====================================================================
-- SEED DATA FOR COMPANIES & PLACEMENT DRIVES
-- ====================================================================

INSERT INTO public.companies (id, name, logo_url, description, website) VALUES
('c1111111-1111-1111-1111-111111111111', 'Google', 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop', 'Global technology leader in cloud computing, software, and search.', 'https://google.com'),
('c2222222-2222-2222-2222-222222222222', 'Microsoft', 'https://images.unsplash.com/photo-1642132652075-2bfa3f80c611?w=100&h=100&fit=crop', 'Empowering every person and organization on the planet to achieve more.', 'https://microsoft.com'),
('c3333333-3333-3333-3333-333333333333', 'Amazon', 'https://images.unsplash.com/photo-1523474253246-6ef765507727?w=100&h=100&fit=crop', 'Customer-obsessed cloud infrastructure, e-commerce, and logistics platform.', 'https://amazon.com'),
('c4444444-4444-4444-4444-444444444444', 'TCS Digital', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop', 'Next-generation IT solutions and digital transformation partner.', 'https://tcs.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.placement_drives (id, company_id, job_role, description, package, location, eligibility, deadline, drive_date) VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Software Engineer - Campus', 'Design and implement scalable distributed systems and backend microservices.', '24 LPA', 'Bengaluru / Hyderabad', 'Min 8.0 CGPA, CSE/IT/ECE, No Active Backlogs', NOW() + INTERVAL '10 days', NOW() + INTERVAL '18 days'),
('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Associate Cloud Solution Architect', 'Collaborate with engineering teams to deploy Azure cloud infrastructures.', '18.5 LPA', 'Hyderabad', 'Min 7.5 CGPA, All Engineering Branches, Max 1 Backlog cleared', NOW() + INTERVAL '14 days', NOW() + INTERVAL '24 days'),
('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Graduate SDE - AWS', 'Develop customer-facing web services and robust real-time cloud APIs.', '22 LPA', 'Bengaluru', 'Min 8.0 CGPA, CSE/IT, No Backlogs', NOW() + INTERVAL '5 days', NOW() + INTERVAL '12 days'),
('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Systems Engineer (Digital)', 'Develop enterprise digital apps using modern full-stack web and mobile stacks.', '7.5 LPA', 'Pan-India', 'Min 6.5 CGPA, All Engineering Branches', NOW() + INTERVAL '20 days', NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;
