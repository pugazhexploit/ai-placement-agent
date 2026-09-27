import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Building2,
  Calculator,
  Code2,
  Brain,
  MessageSquare,
  Bot,
  Award,
  Bell,
  Settings,
  Users,
  FileSpreadsheet,
  HelpCircle,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { role } = useAuth();

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-profile', label: 'My Profile', icon: User },
    { id: 'placement-drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'aptitude-practice', label: 'Aptitude Practice', icon: Calculator },
    { id: 'technical-practice', label: 'Technical Practice', icon: Code2 },
    { id: 'critical-thinking', label: 'Critical Thinking', icon: Brain },
    { id: 'interview-prep', label: 'Interview Preparation', icon: MessageSquare },
    { id: 'mock-interview', label: 'Mock Interview', icon: Bot },
    { id: 'my-results', label: 'My Results', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const staffNavItems = [
    { id: 'staff-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staff-students', label: 'Students', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'manage-drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'staff-applications', label: 'Applications', icon: FileSpreadsheet },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
    { id: 'quiz-results', label: 'Quiz Results', icon: CheckCircle2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = role === 'staff' ? staffNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {role === 'staff' ? 'Placement Cell Menu' : 'Student Career Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info pill */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="font-medium">CampusHire v1.0</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Ready" />
          </div>
        </div>
      </aside>
    </>
  );
};
