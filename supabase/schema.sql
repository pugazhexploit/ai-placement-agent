-- ====================================================================
-- CampusHire Database Schema & Row Level Security (RLS)
-- Platform: Supabase (PostgreSQL)
-- ====================================================================

-- Enable UUID extension if not already enabled
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PLACEMENT DRIVES TABLE
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    drive_id UUID NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected')) DEFAULT 'Applied',
    applied_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (student_id, drive_id)
);

-- 5. QUESTIONS TABLE (Aptitude, Technical, Critical Thinking, Interview)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('aptitude', 'technical', 'critical', 'interview')),
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    company TEXT,
    job_role TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. QUIZ ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL
);

-- 8. MOCK INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.mock_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_role TEXT NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is staff/admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles:
CREATE POLICY "Users can view their own profile or staff can view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles can be inserted upon registration"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Companies:
CREATE POLICY "Everyone can view companies"
    ON public.companies FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage companies"
    ON public.companies FOR ALL
    USING (public.is_staff());

-- Placement Drives:
CREATE POLICY "Everyone can view placement drives"
    ON public.placement_drives FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage placement drives"
    ON public.placement_drives FOR ALL
    USING (public.is_staff());

-- Applications:
CREATE POLICY "Students can view their own applications, staff can view all"
    ON public.applications FOR SELECT
    USING (student_id = auth.uid() OR public.is_staff());

CREATE POLICY "Students can insert their own application"
    ON public.applications FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can update application status"
    ON public.applications FOR UPDATE
    USING (public.is_staff());

-- Questions:
CREATE POLICY "Everyone authenticated can view questions for practice"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can insert, update, delete questions"
    ON public.questions FOR ALL
    USING (public.is_staff());

-- Quiz Attempts & Answers:
CREATE POLICY "Students can view their own quiz attempts, staff can view all"
    ON public.quiz_attempts FOR SELECT
    USING (student_id = auth.uid() OR public.is_staff());

CREATE POLICY "Students can insert quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own quiz answers, staff can view all"
    ON public.quiz_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts
            WHERE id = quiz_answers.attempt_id AND (student_id = auth.uid() OR public.is_staff())
        )
    );

CREATE POLICY "Students can insert quiz answers"
    ON public.quiz_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts
            WHERE id = quiz_answers.attempt_id AND student_id = auth.uid()
        )
    );

-- Mock Interviews:
CREATE POLICY "Students can view their own mock interviews, staff can view all"
    ON public.mock_interviews FOR SELECT
    USING (student_id = auth.uid() OR public.is_staff());

CREATE POLICY "Students can insert their own mock interview record"
    ON public.mock_interviews FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- Sample Companies
INSERT INTO public.companies (id, name, logo_url, description, website) VALUES
('c1111111-1111-1111-1111-111111111111', 'Google', 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop', 'Global technology leader in cloud computing, software, and search.', 'https://google.com'),
('c2222222-2222-2222-2222-222222222222', 'Microsoft', 'https://images.unsplash.com/photo-1642132652075-2bfa3f80c611?w=100&h=100&fit=crop', 'Empowering every person and organization on the planet to achieve more.', 'https://microsoft.com'),
('c3333333-3333-3333-3333-333333333333', 'Amazon', 'https://images.unsplash.com/photo-1523474253246-6ef765507727?w=100&h=100&fit=crop', 'Customer-obsessed cloud infrastructure, e-commerce, and logistics platform.', 'https://amazon.com'),
('c4444444-4444-4444-4444-444444444444', 'TCS Digital', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop', 'Next-generation IT solutions and digital transformation partner.', 'https://tcs.com')
ON CONFLICT DO NOTHING;

-- Sample Placement Drives
INSERT INTO public.placement_drives (id, company_id, job_role, description, package, location, eligibility, deadline, drive_date) VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Software Engineer - Campus', 'Design and implement scalable distributed systems and backend microservices.', '24 LPA', 'Bengaluru / Hyderabad', 'Min 8.0 CGPA, CSE/IT/ECE, No Active Backlogs', NOW() + INTERVAL '10 days', NOW() + INTERVAL '18 days'),
('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Associate Cloud Solution Architect', 'Collaborate with engineering teams to deploy Azure cloud infrastructures.', '18.5 LPA', 'Hyderabad', 'Min 7.5 CGPA, All Engineering Branches, Max 1 Backlog cleared', NOW() + INTERVAL '14 days', NOW() + INTERVAL '24 days'),
('d3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Graduate SDE - AWS', 'Develop customer-facing web services and robust real-time cloud APIs.', '22 LPA', 'Bengaluru', 'Min 8.0 CGPA, CSE/IT, No Backlogs', NOW() + INTERVAL '5 days', NOW() + INTERVAL '12 days'),
('d4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Systems Engineer (Digital)', 'Develop enterprise digital apps using modern full-stack web and mobile stacks.', '7.5 LPA', 'Pan-India', 'Min 6.5 CGPA, All Engineering Branches', NOW() + INTERVAL '20 days', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Sample Questions (Aptitude, Technical, Critical Thinking, Interview)
INSERT INTO public.questions (category, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, company, job_role) VALUES
('aptitude', 'Percentages', 'A student scored 450 marks out of 600. What is the percentage of marks scored?', '70%', '75%', '80%', '82%', 'B', 'Percentage = (450 / 600) * 100 = 75%.', 'Easy', 'TCS Digital', 'Systems Engineer'),
('aptitude', 'Time & Work', 'A can complete a project in 12 days and B in 24 days. How many days will they take working together?', '6 days', '8 days', '10 days', '12 days', 'B', '1/12 + 1/24 = 3/24 = 1/8. Together they take 8 days.', 'Medium', 'Amazon', 'SDE-1'),
('aptitude', 'Profit & Loss', 'An article bought for Rs. 800 is sold for Rs. 960. Find the profit percentage.', '15%', '20%', '25%', '18%', 'B', 'Profit = 960 - 800 = 160. Profit % = (160 / 800) * 100 = 20%.', 'Easy', 'Google', 'Software Engineer'),
('technical', 'Data Structures', 'What is the worst-case time complexity of searching an element in a Balanced Binary Search Tree (AVL/Red-Black)?', 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)', 'C', 'Balanced BSTs maintain maximum height of O(log n), ensuring searches take O(log n).', 'Medium', 'Google', 'Software Engineer'),
('technical', 'DBMS', 'Which SQL clause is used to filter records based on group aggregate values?', 'WHERE', 'HAVING', 'GROUP BY', 'ORDER BY', 'B', 'The HAVING clause filters groups formed by GROUP BY, while WHERE filters individual rows.', 'Easy', 'Microsoft', 'Cloud Architect'),
('technical', 'Operating Systems', 'Which condition is NOT one of Coffman''s four conditions for Deadlock?', 'Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait', 'C', 'No Preemption is required for deadlock; allowing preemption prevents deadlocks.', 'Medium', 'Amazon', 'Graduate SDE'),
('critical', 'Logical Reasoning', 'Statement: "All laptops are computers. Some computers are calculators." Conclusion I: Some laptops are calculators. Conclusion II: Some calculators are computers.', 'Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows', 'B', 'Since some computers are calculators, conclusion II is immediately true by conversion.', 'Medium', 'TCS Digital', 'Systems Engineer'),
('critical', 'Pattern Recognition', 'Identify the missing number in the sequence: 2, 6, 12, 20, 30, ?', '38', '40', '42', '46', 'C', 'Differences are 4, 6, 8, 10, next is +12 => 30 + 12 = 42 (n*(n+1) pattern).', 'Medium', 'Microsoft', 'Cloud Architect'),
('interview', 'HR Questions', 'Tell me about yourself and why you want to join our engineering division.', NULL, NULL, NULL, NULL, 'Structure your answer with Present (current college/major/focus), Past (projects/internships/accomplishments), and Future (why this company and alignment).', 'Be concise (around 90 seconds) and emphasize relevant technical impact.', 'Easy', 'Google', 'Software Engineer'),
('interview', 'Technical Questions', 'Explain how Virtual Memory and Paging work in modern operating systems.', NULL, NULL, NULL, NULL, 'Discuss physical vs virtual address space, Page Tables, TLB cache, and Page Fault resolution with swap space.', 'Highlight the translation from logical to physical addresses and hardware TLB hits/misses.', 'Hard', 'Microsoft', 'Cloud Architect')
ON CONFLICT DO NOTHING;
