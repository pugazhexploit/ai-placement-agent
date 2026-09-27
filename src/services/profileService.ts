import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_STUDENTS, INITIAL_STAFF } from '../lib/mockData';

const STORAGE_KEYS = {
  STUDENTS: 'campushire_students',
  CURRENT_USER: 'campushire_current_user',
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

export const profileService = {
  async getProfile(id: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn('getProfile error, fallback to local:', err);
      }
    }

    if (id === INITIAL_STAFF.id) return INITIAL_STAFF;
    const students = getLocal<UserProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return students.find(s => s.id === id) || students[0] || null;
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
        if (!error && data) return data as UserProfile;
      } catch (err) {
        console.warn('updateProfile error, fallback to local:', err);
      }
    }

    const students = getLocal<UserProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      setLocal(STORAGE_KEYS.STUDENTS, students);
      return students[index];
    }
    const updated = { ...INITIAL_STUDENTS[0], ...updates, id };
    students.push(updated);
    setLocal(STORAGE_KEYS.STUDENTS, students);
    return updated;
  },

  async getAllStudents(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student');
        if (!error && data && data.length > 0) return data as UserProfile[];
      } catch (err) {
        console.warn('getAllStudents error, fallback to local:', err);
      }
    }
    return getLocal<UserProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
};
