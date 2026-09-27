import React, { useState, useEffect } from 'react';
import { Application, ApplicationStatus } from '../../types';
import { placementService } from '../../services/placementService';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { Search, Filter, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';

export const ApplicationReview: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await placementService.getApplications();
        setApplications(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    await placementService.updateApplicationStatus(appId, newStatus);
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  if (isLoading) return <LoadingState message="Loading candidate application pipeline..." />;

  const statuses: (ApplicationStatus | 'All')[] = ['All', 'Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

  const filtered = applications.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchSearch =
      (a.student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.drive?.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.drive?.job_role || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getBadgeVariant = (st: ApplicationStatus) => {
    switch (st) {
      case 'Selected': return 'success';
      case 'Shortlisted': return 'primary';
      case 'Interview': return 'info';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applicant Status Pipeline</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review student submissions, shortlist candidates, and update placement outcomes
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate or company..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Company & Target Role</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Update Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {app.student?.full_name || 'Alex Turner'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {app.student?.department || 'CSE'} • Reg: {app.student?.register_number || '21CS042'}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-brand-600 dark:text-brand-400">
                      {app.drive?.company?.name || 'Google'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {app.drive?.job_role || 'Software Engineer'}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {app.drive?.package || '24 LPA'}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(app.status)} size="sm">
                      {app.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <select
                      value={app.status}
                      onChange={e => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
