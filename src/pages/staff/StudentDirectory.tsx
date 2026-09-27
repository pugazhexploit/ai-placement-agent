import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { profileService } from '../../services/profileService';
import { Search, GraduationCap, Mail, Phone, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

export const StudentDirectory: React.FC = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await profileService.getAllStudents();
        setStudents(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <LoadingState message="Loading registered candidates..." />;

  const departments = ['All', 'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'];

  const filtered = students.filter(s => {
    const name = s.full_name || '';
    const reg = s.register_number || '';
    const dept = s.department || '';

    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'All' || s.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Students Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor candidate eligibility, registered details, and academic benchmarks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, reg no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {departments.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDept(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDept === d
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Department & Year</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Verified Skills</th>
                <th className="px-6 py-4">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(student => {
                const isEligible = (student.cgpa || 8.0) >= 7.5;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                          alt={student.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{student.register_number}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{student.department}</p>
                      <p className="text-[11px] text-slate-400">{student.year}</p>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                      {student.cgpa || 8.0}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(student.skills || []).slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                        {(student.skills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{(student.skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible (Tier 1 & 2)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Standard Track</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
