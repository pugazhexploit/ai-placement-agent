import React from 'react';
import { PlacementDrive } from '../../types';
import { MapPin, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DriveCardProps {
  drive: PlacementDrive;
  hasApplied: boolean;
  onApply: (driveId: string) => void;
  onViewDetails?: (drive: PlacementDrive) => void;
  isEligible?: boolean;
}

export const DriveCard: React.FC<DriveCardProps> = ({
  drive,
  hasApplied,
  onApply,
  onViewDetails,
  isEligible = true,
}) => {
  const deadlineDate = new Date(drive.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const driveDate = new Date(drive.drive_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top: Logo & Company Name & Eligibility Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {drive.company?.logo_url ? (
              <img
                src={drive.company.logo_url}
                alt={drive.company.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                {drive.company?.name || 'Company'}
              </h4>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {drive.job_role}
              </p>
            </div>
          </div>

          <Badge variant={isEligible ? 'success' : 'warning'} size="sm">
            {isEligible ? 'Eligible' : 'Check Criteria'}
          </Badge>
        </div>

        {/* Package & Location & Eligibility Info */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>{drive.package}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{drive.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Drive: {driveDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Due: {deadlineDate}</span>
          </div>
        </div>

        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Eligibility: </span>
          {drive.eligibility}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(drive)}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Details
          </button>
        )}

        <button
          onClick={() => onApply(drive.id)}
          disabled={hasApplied}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            hasApplied
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-brand-500/25 active:scale-98'
          }`}
        >
          {hasApplied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Applied</span>
            </>
          ) : (
            <span>Apply Now</span>
          )}
        </button>
      </div>
    </div>
  );
};
