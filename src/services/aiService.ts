import { MockInterviewRecord } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_MOCK_INTERVIEWS } from '../lib/mockData';

const STORAGE_KEYS = {
  MOCKS: 'campushire_mock_interviews',
};

function getLocal<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export interface InterviewEvaluationRequest {
  jobRole: string;
  qaPairs: {
    question: string;
    answer: string;
    suggestedPoints?: string;
  }[];
}

export interface InterviewEvaluationResult {
  score: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  perQuestionFeedback: {
    question: string;
    score: number;
    feedback: string;
  }[];
}

export const aiService = {
  /**
   * Evaluates student answers.
   * Architecture note: When Gemini API is integrated, this method can call your
   * secure backend/Supabase Edge Function: `POST /functions/v1/gemini-mock-eval`
   * keeping your GEMINI_API_KEY safe on the server side.
   */
  async evaluateInterview(request: InterviewEvaluationRequest): Promise<InterviewEvaluationResult> {
    // Check if secure backend proxy endpoint is configured
    const edgeFunctionUrl = import.meta.env.VITE_AI_PROXY_URL;
    if (edgeFunctionUrl) {
      try {
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn('AI proxy unavailable, falling back to local evaluation engine:', err);
      }
    }

    // Heuristic Prototype Engine for career readiness
    await new Promise(r => setTimeout(r, 1200)); // Simulate AI reasoning latency

    let totalScore = 0;
    const perQuestionFeedback = request.qaPairs.map(pair => {
      const words = pair.answer.trim().split(/\s+/).filter(Boolean).length;
      let qScore = 60;
      let feedback = '';

      if (words < 15) {
        qScore = 45;
        feedback = 'Answer is too brief. Try to elaborate on technical reasoning or situational context.';
      } else if (words < 40) {
        qScore = 75;
        feedback = 'Good concise response. Consider including concrete metric outcomes or technical trade-offs.';
      } else {
        qScore = 90;
        feedback = 'Comprehensive answer showing clear structured thinking and relevant terminology.';
      }

      // Keyword check
      const lower = pair.answer.toLowerCase();
      if (lower.includes('project') || lower.includes('team') || lower.includes('scalab') || lower.includes('optimiz')) {
        qScore = Math.min(100, qScore + 8);
      }

      totalScore += qScore;
      return {
        question: pair.question,
        score: qScore,
        feedback,
      };
    });

    const averageScore = Math.round(totalScore / Math.max(1, request.qaPairs.length));

    return {
      score: averageScore,
      overallFeedback: averageScore >= 80
        ? `Outstanding performance for ${request.jobRole}! You communicated structured problem-solving with technical confidence.`
        : `Solid attempt for ${request.jobRole}. Focusing on real-world examples and quantifying your past impact will elevate your profile.`,
      strengths: [
        'Clear and confident articulation of personal background',
        'Demonstrated foundational engineering principles',
        'Structured thought process under interview conditions',
      ],
      improvements: [
        'Apply the STAR framework (Situation, Task, Action, Result) more explicitly on behavioral prompts',
        'Mention specific metrics (e.g., latency reduction, test coverage, team size) when describing past projects',
      ],
      perQuestionFeedback,
    };
  },

  async saveMockInterview(record: Omit<MockInterviewRecord, 'id'>): Promise<MockInterviewRecord> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('mock_interviews').insert([record]).select().single();
      if (!error && data) return data as MockInterviewRecord;
    }

    const mocks = getLocal<MockInterviewRecord[]>(STORAGE_KEYS.MOCKS, INITIAL_MOCK_INTERVIEWS);
    const newMock: MockInterviewRecord = {
      ...record,
      id: 'mock_' + Date.now(),
    };
    mocks.unshift(newMock);
    setLocal(STORAGE_KEYS.MOCKS, mocks);
    return newMock;
  },

  async getMockInterviews(studentId?: string): Promise<MockInterviewRecord[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('mock_interviews').select('*').order('completed_at', { ascending: false });
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as MockInterviewRecord[];
    }

    const mocks = getLocal<MockInterviewRecord[]>(STORAGE_KEYS.MOCKS, INITIAL_MOCK_INTERVIEWS);
    return studentId ? mocks.filter(m => m.student_id === studentId) : mocks;
  }
};
