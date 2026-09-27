import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlacementDrive, Application } from '../../types';
import { placementService } from '../../services/placementService';
import { DriveCard } from '../../components/student/DriveCard';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { Search, Filter, Briefcase, Building2, MapPin, Calendar, CheckCircle2, DollarSign, ExternalLink } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const PlacementDrives: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [drivesData, appsData] = await Promise.all([
          placementService.getDrives(),
          placementService.getApplications(user.id),
        ]);
        setDrives(drivesData);
        setApplications(appsData);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const handleApply = async (driveId: string) => {
    if (!user) return;
    const newApp = await placementService.applyToDrive(user.id, driveId);
    setApplications(prev => [newApp, ...prev.filter(a => a.drive_id !== driveId)]);
  };

  const appliedMap = new Set(applications.map(a => a.drive_id));

  const filteredDrives = drives.filter(d => {
    const matchSearch =
      d.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  if (isLoading) return <LoadingState message="Loading campus placement drives..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Placement Drives</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse campus recruitment drives, verify eligibility criteria, and submit your applications
          </p>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search company, role or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {filteredDrives.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No placement drives found</h4>
          <p className="text-xs text-slate-400 mt-1">Try modifying your search keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map(drive => (
            <DriveCard
              key={drive.id}
              drive={drive}
              hasApplied={appliedMap.has(drive.id)}
              onApply={handleApply}
              onViewDetails={d => setSelectedDrive(d)}
              isEligible={(user?.cgpa || 8.0) >= (drive.min_cgpa || 0)}
            />
          ))}
        </div>
      )}

      {/* Company Drive Details Modal */}
      {selectedDrive && (
        <Modal
          isOpen={Boolean(selectedDrive)}
          onClose={() => setSelectedDrive(null)}
          title={selectedDrive.company?.name || 'Company Details'}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <img
                src={selectedDrive.company?.logo_url || 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop'}
                alt={selectedDrive.company?.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedDrive.company?.name}
                </h4>
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {selectedDrive.job_role}
                </p>
                {selectedDrive.company?.website && (
                  <a
                    href={selectedDrive.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 mt-1"
                  >
                    <span>Visit Careers Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Annual Compensation</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDrive.package}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Primary Location</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {selectedDrive.location}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Role Description
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedDrive.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                Eligibility & Cutoff Criteria
              </h5>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {selectedDrive.eligibility}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDrive(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApply(selectedDrive.id);
                  setSelectedDrive(null);
                }}
                disabled={appliedMap.has(selectedDrive.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  appliedMap.has(selectedDrive.id)
                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                }`}
              >
                {appliedMap.has(selectedDrive.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Already Applied</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
