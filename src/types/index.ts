export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  year?: string;
  register_number?: string;
  skills: string[];
  resume_url?: string;
  avatar_url?: string;
  role: UserRole;
  cgpa?: number;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description: string;
  website?: string;
  created_at?: string;
}

export interface PlacementDrive {
  id: string;
  company_id: string;
  company?: Company;
  job_role: string;
  description: string;
  package: string;
  location: string;
  eligibility: string;
  min_cgpa?: number;
  deadline: string;
  drive_date: string;
  created_at?: string;
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

export interface Application {
  id: string;
  student_id: string;
  drive_id: string;
  status: ApplicationStatus;
  applied_at: string;
  student?: UserProfile;
  drive?: PlacementDrive;
}

export type QuestionCategory = 'aptitude' | 'technical' | 'critical' | 'interview';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: QuestionCategory;
  topic: string;
  question: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string; // 'A' | 'B' | 'C' | 'D' or key points for interview
  explanation?: string;
  difficulty: Difficulty;
  company?: string;
  job_role?: string;
  created_at?: string;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  category: string;
  topic?: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  answers?: QuizAnswerDetail[];
}

export interface QuizAnswerDetail {
  question_id: string;
  question: Question;
  selected_answer: string;
  is_correct: boolean;
}

export interface MockInterviewRecord {
  id: string;
  student_id: string;
  job_role: string;
  score: number;
  feedback: string;
  completed_at: string;
  details?: {
    question: string;
    answer: string;
    feedback: string;
  }[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  aptitude_questions: Question[];
  technical_questions: Question[];
  critical_questions: Question[];
  is_completed?: boolean;
}
