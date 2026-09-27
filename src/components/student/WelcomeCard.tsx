import React from 'react';
import { UserProfile } from '../../types';
import { Badge } from '../common/Badge';
import { Sparkles, CheckCircle, GraduationCap } from 'lucide-react';

interface WelcomeCardProps {
  user: UserProfile;
  totalApplications: number;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, totalApplications }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-sky-600 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/15">
      {/* Background soft ambient circles */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-black/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Placement Season 2025-26</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.full_name} 👋
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-sky-100">
            <span className="flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-white" />
              {user.department || 'Computer Science'}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-sky-200" />
            <span>{user.year || '4th Year'}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-sky-200" />
            <span>Reg: {user.register_number || '21CS042'}</span>
            {user.cgpa && (
              <>
                <span className="inline-block w-1 h-1 rounded-full bg-sky-200" />
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                  CGPA: {user.cgpa}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Placement Status Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[220px]">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-sky-100 font-medium">Placement Status</p>
            <p className="text-base font-bold text-white">Eligible & Active</p>
            <p className="text-xs text-sky-200 mt-0.5">
              {totalApplications} active {totalApplications === 1 ? 'application' : 'applications'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
