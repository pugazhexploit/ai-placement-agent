import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { signIn, switchRole, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setErrorMsg('');
    const res = await signIn(email, password);
    if (res.error) {
      setErrorMsg(res.error);
    }
    setIsSubmitting(false);
  };

  const handleQuickLogin = (role: 'student' | 'staff') => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus<span className="text-brand-500">Hire</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          College Placement & Student Career-Readiness Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Quick Demo Switchers for Viva / Evaluation */}
          <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 dark:text-brand-300">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>One-Click Evaluation Login (Demo Mode)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-700 text-xs font-bold text-slate-800 dark:text-white hover:border-brand-500 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Student Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-700 text-xs font-bold text-slate-800 dark:text-white hover:border-brand-500 flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>Staff/Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
            <span className="shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="alex.turner@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onSwitchToRegister}
              className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 transition-colors"
            >
              New student candidate? <span className="font-bold underline">Create an Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
