import React, { useState, useEffect } from 'react';
import { Company, PlacementDrive, Question } from '../../types';
import { placementService } from '../../services/placementService';
import { questionService } from '../../services/questionService';
import { Building2, ExternalLink, Briefcase, BookOpen, ChevronRight, ShieldAlert } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface CompaniesProps {
  onStartCompanyPractice?: (companyName: string, category: string) => void;
}

export const Companies: React.FC<CompaniesProps> = ({ onStartCompanyPractice }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [comps, drvs, qsts] = await Promise.all([
          placementService.getCompanies(),
          placementService.getDrives(),
          questionService.getQuestions(),
        ]);
        setCompanies(comps);
        setDrives(drvs);
        setQuestions(qsts);
        if (comps.length > 0) setSelectedCompany(comps[0]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <LoadingState message="Loading recruiting partners..." />;

  const activeDrives = drives.filter(d => d.company_id === selectedCompany?.id);
  const practiceQuestions = questions.filter(
    q => q.company?.toLowerCase() === selectedCompany?.name.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recruitment Partners & Company Prep</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Targeted preparation guides and active drives for top campus recruitment organizations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Companies List */}
        <div className="space-y-2.5">
          {companies.map(company => {
            const isSelected = selectedCompany?.id === company.id;
            const companyDriveCount = drives.filter(d => d.company_id === company.id).length;
            return (
              <button
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-300 dark:border-brand-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={company.logo_url || 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop'}
                    alt={company.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{company.name}</h4>
                    <p className="text-xs text-slate-500">{companyDriveCount} active {companyDriveCount === 1 ? 'drive' : 'drives'}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right: Company Detail & Preparation Section */}
        {selectedCompany && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCompany.logo_url || 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop'}
                    alt={selectedCompany.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCompany.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedCompany.description}</p>
                  </div>
                </div>
                {selectedCompany.website && (
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Active Drives for this company */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Current Open Roles
                </h4>
                {activeDrives.length === 0 ? (
                  <p className="text-xs text-slate-400">No active placement drives announced yet for {selectedCompany.name}.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeDrives.map(drive => (
                      <div key={drive.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{drive.job_role}</span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{drive.package}</span>
                          <span>•</span>
                          <span>{drive.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preparation Module */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Practice Questions for {selectedCompany.name}
                  </h4>
                  <p className="text-xs text-slate-500">Simulated assessment modules tailored for campus patterns</p>
                </div>
              </div>

              {/* Disclaimer as required by requirements */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Practice modules are curated for skill readiness based on standard placement syllabi and do not claim to be confidential recruitment exams.
                </span>
              </div>

              {/* Modules breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { label: 'Aptitude Prep', cat: 'aptitude', count: 12 },
                  { label: 'Technical Core', cat: 'technical', count: 18 },
                  { label: 'Critical Thinking', cat: 'critical', count: 10 },
                  { label: 'Role Interview', cat: 'interview', count: 8 },
                ].map(module => (
                  <div
                    key={module.label}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center space-y-2 hover:border-brand-500 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 mx-auto text-brand-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {module.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{module.count} questions</span>
                    <button
                      onClick={() => onStartCompanyPractice?.(selectedCompany.name, module.cat)}
                      className="w-full py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 text-xs font-semibold hover:bg-brand-600 hover:text-white transition-colors"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
