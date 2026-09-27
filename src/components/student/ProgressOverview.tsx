import React from 'react';
import { Calculator, Code2, Brain, MessageSquare } from 'lucide-react';

interface ProgressOverviewProps {
  progress?: {
    aptitude: number;
    technical: number;
    critical: number;
    interview: number;
  };
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progress = { aptitude: 75, technical: 82, critical: 68, interview: 60 },
}) => {
  const categories = [
    {
      title: 'Quantitative Aptitude',
      score: progress.aptitude,
      icon: Calculator,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Technical Skills',
      score: progress.technical,
      icon: Code2,
      color: 'bg-brand-500',
      bgColor: 'bg-brand-100 dark:bg-brand-950/50',
      textColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      title: 'Critical Thinking',
      score: progress.critical,
      icon: Brain,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/50',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Interview Preparation',
      score: progress.interview,
      icon: MessageSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-950/50',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Preparation Progress</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Based on quiz attempts and practice rounds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${cat.bgColor} ${cat.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">{cat.score}%</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 truncate">{cat.title}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
