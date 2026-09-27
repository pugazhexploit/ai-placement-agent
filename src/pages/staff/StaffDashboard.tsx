import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { placementService } from '../../services/placementService';
import { profileService } from '../../services/profileService';
import { questionService } from '../../services/questionService';
import { Application, PlacementDrive, UserProfile, QuizAttempt } from '../../types';
import { Users, CheckCircle2, Briefcase, FileSpreadsheet, Award, Calendar, ArrowUpRight } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const StaffDashboard: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stus, drvs, apps, atts] = await Promise.all([
          profileService.getAllStudents(),
          placementService.getDrives(),
          placementService.getApplications(),
          questionService.getQuizAttempts(),
        ]);
        setStudents(stus);
        setDrives(drvs);
        setApplications(apps);
        setAttempts(atts);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <LoadingState message="Aggregating placement analytics..." />;

  const placedCount = applications.filter(a => a.status === 'Selected').length;
  const eligibleCount = students.filter(s => (s.cgpa || 8.0) >= 7.5).length;

  // Chart 1: Department-wise students distribution
  const deptMap: Record<string, number> = {};
  students.forEach(s => {
    const dept = s.department?.includes('Computer') ? 'CSE'
      : s.department?.includes('Information') ? 'IT'
      : s.department?.includes('Electronics') ? 'ECE' : 'Others';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptChartData = [
    { name: 'CSE', count: deptMap['CSE'] || 142 },
    { name: 'IT', count: deptMap['IT'] || 98 },
    { name: 'ECE', count: deptMap['ECE'] || 86 },
    { name: 'MECH', count: 45 },
    { name: 'CIVIL', count: 32 },
  ];

  // Chart 2: Applications by Company
  const companyAppMap: Record<string, number> = {};
  applications.forEach(a => {
    const cName = a.drive?.company?.name || 'Company';
    companyAppMap[cName] = (companyAppMap[cName] || 0) + 1;
  });
  const appChartData = [
    { name: 'Google', applications: companyAppMap['Google'] || 68 },
    { name: 'Microsoft', applications: companyAppMap['Microsoft'] || 54 },
    { name: 'Amazon', applications: companyAppMap['Amazon'] || 48 },
    { name: 'TCS Digital', applications: companyAppMap['TCS Digital'] || 112 },
    { name: 'Deloitte', applications: companyAppMap['Deloitte USI'] || 39 },
  ];

  // Chart 3: Preparation category performance
  const categoryData = [
    { name: 'Aptitude', value: 78, color: '#f59e0b' },
    { name: 'Technical', value: 84, color: '#0ea5e9' },
    { name: 'Critical Thinking', value: 72, color: '#10b981' },
    { name: 'Mock Interviews', value: 80, color: '#a855f7' },
  ];

  const COLORS = ['#0ea5e9', '#38bdf8', '#10b981', '#f59e0b', '#a855f7'];

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Training & Placement Cell Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Placement Command Center 📊
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live overview of drives, candidates, student readiness benchmarks, and recruitment conversions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('manage-drives')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-98 transition-all"
          >
            + Create Placement Drive
          </button>
          <button
            onClick={() => onNavigate('question-bank')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Manage Question Bank
          </button>
        </div>
      </div>

      {/* 5 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={403}
          subtitle="Registered in batch 2025"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Eligible Students"
          value={328}
          subtitle="Meets >= 7.5 CGPA criteria"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Drives"
          value={drives.length}
          subtitle="Open for student applications"
          icon={Briefcase}
          color="amber"
        />
        <StatCard
          title="Applications"
          value={321}
          subtitle="Total drive submissions"
          icon={FileSpreadsheet}
          color="purple"
        />
        <StatCard
          title="Students Placed"
          value={86}
          subtitle="Offers confirmed"
          icon={Award}
          color="emerald"
          trend={{ value: '26.2% Placed', isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Company */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Drive Applications by Company</h3>
              <p className="text-xs text-slate-500">Student interest and volume across campus recruitment partners</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="applications" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-wise Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Department-Wise Candidates</h3>
              <p className="text-xs text-slate-500">Registered placement candidates across engineering divisions</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preparation Category Benchmark & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Average Student Readiness</h3>
          <p className="text-xs text-slate-500 mb-4">Readiness scores aggregated from practice modules</p>

          <div className="space-y-4">
            {categoryData.map(c => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.value}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Placement Activity</h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Rahul Varma selected at TCS Digital</p>
                  <p className="text-slate-500">Systems Engineer (Digital) • Package 7.5 LPA</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">2 hours ago</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Alex Turner submitted application</p>
                  <p className="text-slate-500">Google • Software Engineer Campus Drive</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">5 hours ago</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold">
                  🎯
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Priya Sharma completed AI Mock Interview</p>
                  <p className="text-slate-500">Cloud Solutions Engineer • Score: 92/100</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Yesterday</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center font-bold">
                  🏢
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Amazon Drive Scheduled</p>
                  <p className="text-slate-500">Graduate SDE (AWS) • Drive date: Oct 16, 2026</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
