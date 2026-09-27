import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Settings as SettingsIcon, Moon, Sun, Database, Shield, Bell, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Settings: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portal & System Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure interface appearance, active role simulation, and database connectivity
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Theme Settings */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visual Theme</h4>
            <p className="text-xs text-slate-500">Toggle between light and dark dashboard modes</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="capitalize">{theme} Mode</span>
          </button>
        </div>

        {/* Assigned Role */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Account Role</h4>
            <p className="text-xs text-slate-500">Security permissions associated with your login account</p>
          </div>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 capitalize">
            {role === 'staff' ? 'Staff / Placement Officer' : 'Student Candidate'}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Backend Connection</h4>
            </div>
            <p className="text-xs text-slate-500">
              {isSupabaseConfigured
                ? 'Connected to live Supabase PostgreSQL backend instance.'
                : 'Running in Local Storage / Prototype Demo Mode. (Add Supabase keys in .env to connect live)'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {isSupabaseConfigured ? 'Supabase Live' : 'Demo Local Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};
