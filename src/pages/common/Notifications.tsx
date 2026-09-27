import React from 'react';
import { Bell, Briefcase, Award, CheckCircle2, Clock } from 'lucide-react';

export const Notifications: React.FC = () => {
  const alerts = [
    {
      id: 1,
      title: 'Google Drive Shortlist Announced',
      desc: 'You have been shortlisted for Technical Round 1 with Google Cloud Team.',
      time: '1 hour ago',
      icon: Briefcase,
      color: 'brand',
    },
    {
      id: 2,
      title: 'New Drive: Microsoft Azure Solutions',
      desc: 'Microsoft has published the application deadline for Cloud Architect roles.',
      time: '5 hours ago',
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      id: 3,
      title: 'Daily Practice Streak Achieved',
      desc: 'You completed today’s quantitative aptitude challenge with an 85% accuracy rate.',
      time: 'Yesterday',
      icon: Award,
      color: 'amber',
    },
    {
      id: 4,
      title: 'Resume Verification Complete',
      desc: 'Training & Placement cell verified your updated academic CGPA (8.85).',
      time: '2 days ago',
      icon: Clock,
      color: 'purple',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Campus Notifications & Placement Alerts</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official communications from the training & placement department
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
        {alerts.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="p-5 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</h4>
                  <span className="text-[11px] text-slate-400">{a.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
