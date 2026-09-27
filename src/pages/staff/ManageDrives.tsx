import React, { useState, useEffect } from 'react';
import { Company, PlacementDrive } from '../../types';
import { placementService } from '../../services/placementService';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { Plus, Briefcase, Building2, MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react';

export const ManageDrives: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [companyId, setCompanyId] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [description, setDescription] = useState('');
  const [pack, setPack] = useState('');
  const [location, setLocation] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [deadline, setDeadline] = useState('');
  const [driveDate, setDriveDate] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [drvs, comps] = await Promise.all([
          placementService.getDrives(),
          placementService.getCompanies(),
        ]);
        setDrives(drvs);
        setCompanies(comps);
        if (comps.length > 0) setCompanyId(comps[0].id);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !jobRole) return;

    const newDrive = await placementService.addDrive({
      company_id: companyId,
      job_role: jobRole,
      description: description || 'Campus placement drive for engineering graduates.',
      package: pack || '10.0 LPA',
      location: location || 'Bengaluru',
      eligibility: eligibility || 'Min 7.5 CGPA, CSE/IT/ECE',
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 86400000 * 14).toISOString(),
      drive_date: driveDate ? new Date(driveDate).toISOString() : new Date(Date.now() + 86400000 * 21).toISOString(),
    });

    setDrives(prev => [newDrive, ...prev]);
    setIsModalOpen(false);
    setJobRole('');
    setDescription('');
    setPack('');
    setLocation('');
    setEligibility('');
  };

  if (isLoading) return <LoadingState message="Loading placement drives configuration..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Placement Drive Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish recruitment schedules, set minimum eligibility rules, and configure applicant cutoffs
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Placement Drive</span>
        </button>
      </div>

      {/* Drives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {drives.map(drive => (
          <div
            key={drive.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={drive.company?.logo_url || 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop'}
                  alt={drive.company?.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{drive.company?.name}</h4>
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{drive.job_role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{drive.package}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{drive.location}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Criteria: </span>
                {drive.eligibility}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Drive Date: {new Date(drive.drive_date).toLocaleDateString()}</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Drive Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Campus Placement Drive" maxWidth="lg">
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Recruiting Company
            </label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
              required
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Role / Designation
            </label>
            <input
              type="text"
              placeholder="e.g. Associate Software Engineer, Cloud Analyst"
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CTC / Package
              </label>
              <input
                type="text"
                placeholder="e.g. 14.5 LPA"
                value={pack}
                onChange={e => setPack(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru / Hyderabad"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Eligibility Criteria
            </label>
            <input
              type="text"
              placeholder="e.g. Min 7.5 CGPA | CSE, IT | 0 Backlogs"
              value={eligibility}
              onChange={e => setEligibility(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role Summary & Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of responsibilities and technical expectations..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
            >
              Publish Drive
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
