import React, { useState, useEffect } from 'react';
import { QuizAttempt, UserProfile } from '../../types';
import { questionService } from '../../services/questionService';
import { profileService } from '../../services/profileService';
import { LoadingState } from '../../components/common/LoadingState';
import { Badge } from '../../components/common/Badge';
import { Search, Award, CheckCircle2, XCircle, Calendar, Filter, Users, TrendingUp } from 'lucide-react';

export const StaffQuizResults: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [quizData, studentData] = await Promise.all([
          questionService.getQuizAttempts(),
          profileService.getAllStudents(),
        ]);
        setAttempts(quizData || []);
        setStudents(studentData || []);
      } catch (err) {
        console.error('Failed to load quiz monitoring records:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <LoadingState message="Loading candidate test monitoring records..." />;

  const studentMap = new Map((students || []).map(s => [s.id, s]));

  const filtered = (attempts || []).filter(att => {
    const student = studentMap.get(att.student_id);
    const sName = student?.full_name || 'Alex Turner';
    const sReg = student?.register_number || '21CS042';
    const matchCategory = categoryFilter === 'All' || att.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchSearch =
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.topic || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (Number(a.percentage) || 0), 0) / attempts.length)
    : 0;

  const passedCount = attempts.filter(a => (a.percentage || 0) >= 60).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Quiz & Test Performance Monitoring</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor live student test results, written quiz benchmarks, and topic readiness
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, reg no, topic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
        </div>
      </div>

      {/* Top 3 Monitoring Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Tests Attempted</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {attempts.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Average Batch Score</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {avgScore}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Cleared Benchmark (&ge; 60%)</span>
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1 block">
              {passedCount} / {attempts.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'aptitude', 'technical', 'critical', 'daily'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Quiz Attempts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Student Candidate</th>
                <th className="px-6 py-4">Test Domain & Topic</th>
                <th className="px-6 py-4">Questions Score</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No quiz records found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(att => {
                  const student = studentMap.get(att.student_id);
                  const isPassed = (att.percentage || 0) >= 60;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                            alt="Student avatar"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {student?.full_name || 'Alex Turner'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {student?.register_number || '21CS042'} • {student?.department || 'CSE'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">
                          {att.category.toUpperCase()}
                        </Badge>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {att.topic || 'General Assessment'}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {att.score} / {att.total_questions}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {att.percentage}%
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={isPassed ? 'success' : 'danger'} size="sm">
                          {isPassed ? 'Benchmark Met' : 'Needs Practice'}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right text-slate-400 text-[11px]">
                        {new Date(att.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
