import { Question, QuestionCategory, QuizAttempt } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_QUESTIONS, INITIAL_QUIZ_ATTEMPTS } from '../lib/mockData';

const STORAGE_KEYS = {
  QUESTIONS: 'campushire_questions',
  ATTEMPTS: 'campushire_quiz_attempts',
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

export const questionService = {
  async getQuestions(category?: QuestionCategory, topic?: string): Promise<Question[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('questions').select('*');
      if (category) query = query.eq('category', category);
      if (topic) query = query.eq('topic', topic);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Question[];
    }

    const questions = getLocal<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    return questions.filter(q => {
      if (category && q.category !== category) return false;
      if (topic && q.topic !== topic) return false;
      return true;
    });
  },

  async addQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('questions').insert([question]).select().single();
      if (!error && data) return data as Question;
    }

    const questions = getLocal<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const newQuestion: Question = {
      ...question,
      id: 'q_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    questions.unshift(newQuestion);
    setLocal(STORAGE_KEYS.QUESTIONS, questions);
    return newQuestion;
  },

  async deleteQuestion(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('questions').delete().eq('id', id);
    }
    const questions = getLocal<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    const filtered = questions.filter(q => q.id !== id);
    setLocal(STORAGE_KEYS.QUESTIONS, filtered);
  },

  async saveQuizAttempt(attempt: Omit<QuizAttempt, 'id'>): Promise<QuizAttempt> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quiz_attempts').insert([attempt]).select().single();
      if (!error && data) return data as QuizAttempt;
    }

    const attempts = getLocal<QuizAttempt[]>(STORAGE_KEYS.ATTEMPTS, INITIAL_QUIZ_ATTEMPTS);
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: 'attempt_' + Date.now(),
    };
    attempts.unshift(newAttempt);
    setLocal(STORAGE_KEYS.ATTEMPTS, attempts);
    return newAttempt;
  },

  async getQuizAttempts(studentId?: string): Promise<QuizAttempt[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('quiz_attempts').select('*').order('completed_at', { ascending: false });
      if (studentId) query = query.eq('student_id', studentId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as QuizAttempt[];
    }

    const attempts = getLocal<QuizAttempt[]>(STORAGE_KEYS.ATTEMPTS, INITIAL_QUIZ_ATTEMPTS);
    if (studentId) {
      return attempts.filter(a => a.student_id === studentId);
    }
    return attempts;
  },

  async getDailyChallengeQuestions(): Promise<{ aptitude: Question[]; technical: Question[]; critical: Question[] }> {
    const all = await this.getQuestions();
    const apt = all.filter(q => q.category === 'aptitude').slice(0, 5);
    const tech = all.filter(q => q.category === 'technical').slice(0, 5);
    const crit = all.filter(q => q.category === 'critical').slice(0, 5);
    return { aptitude: apt, technical: tech, critical: crit };
  }
};
