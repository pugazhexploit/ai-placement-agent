import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_STUDENTS, INITIAL_STAFF } from '../lib/mockData';
import { profileService } from '../services/profileService';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (data: Partial<UserProfile>, password?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'student',
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  switchRole: () => {},
  updateUser: async () => {},
  isDemoMode: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await profileService.getProfile(session.user.id);
            if (profile) {
              setUser(profile);
              setRole(profile.role);
              setIsLoading(false);
              return;
            }
          }
        }

        // Demo Mode / Fallback: load saved mock user or default student
        const savedUser = localStorage.getItem('campushire_active_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser) as UserProfile;
          setUser(parsed);
          setRole(parsed.role);
        } else {
          setUser(INITIAL_STUDENTS[0]);
          setRole('student');
          localStorage.setItem('campushire_active_user', JSON.stringify(INITIAL_STUDENTS[0]));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(INITIAL_STUDENTS[0]);
        setRole('student');
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          const profile = await profileService.getProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setRole(profile.role);
          }
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password = 'password123'): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const profile = await profileService.getProfile(data.user.id);
          if (profile) {
            setUser(profile);
            setRole(profile.role);
            return {};
          }
        }
      }

      // Demo sign in
      if (email.toLowerCase().includes('staff') || email.toLowerCase().includes('dean')) {
        setUser(INITIAL_STAFF);
        setRole('staff');
        localStorage.setItem('campushire_active_user', JSON.stringify(INITIAL_STAFF));
      } else {
        const found = INITIAL_STUDENTS.find(s => s.email.toLowerCase() === email.toLowerCase()) || INITIAL_STUDENTS[0];
        setUser(found);
        setRole('student');
        localStorage.setItem('campushire_active_user', JSON.stringify(found));
      }
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: Partial<UserProfile>, password = 'password123'): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && data.email) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password,
        });
        if (error) return { error: error.message };
        if (authData.user) {
          const newProfile: UserProfile = {
            id: authData.user.id,
            full_name: data.full_name || 'New Student',
            email: data.email,
            department: data.department || 'Computer Science',
            year: data.year || '4th Year',
            register_number: data.register_number || '21CS999',
            skills: data.skills || [],
            role: data.role || 'student',
            cgpa: data.cgpa || 8.0,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
          };
          await profileService.updateProfile(newProfile.id, newProfile);
          setUser(newProfile);
          setRole(newProfile.role);
          return {};
        }
      }

      // Demo signup
      const newMockUser: UserProfile = {
        id: 's_' + Date.now(),
        full_name: data.full_name || 'New Student',
        email: data.email || 'student@campus.edu',
        department: data.department || 'Computer Science',
        year: data.year || '4th Year',
        register_number: data.register_number || '21CS' + Math.floor(100 + Math.random() * 900),
        skills: data.skills || ['JavaScript', 'Web Development'],
        role: data.role || 'student',
        cgpa: data.cgpa || 8.0,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      };
      setUser(newMockUser);
      setRole(newMockUser.role);
      localStorage.setItem('campushire_active_user', JSON.stringify(newMockUser));
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('campushire_active_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'staff') {
      setUser(INITIAL_STAFF);
      setRole('staff');
      localStorage.setItem('campushire_active_user', JSON.stringify(INITIAL_STAFF));
    } else {
      setUser(INITIAL_STUDENTS[0]);
      setRole('student');
      localStorage.setItem('campushire_active_user', JSON.stringify(INITIAL_STUDENTS[0]));
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await profileService.updateProfile(user.id, updates);
    setUser(updated);
    localStorage.setItem('campushire_active_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        signIn,
        signUp,
        signOut,
        switchRole,
        updateUser,
        isDemoMode: !isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
