import React from 'react';
import { Modal } from '../common/Modal';
import { Target, Calculator, Code2, Brain, Flame, ArrowRight } from 'lucide-react';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onStart,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Today's Placement Challenge" maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <div className="p-3 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily Streak Active!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Complete today's 15-question mixed assessment to boost your overall placement readiness rank.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Quantitative Aptitude</p>
                <p className="text-[11px] text-slate-500">Percentages, Ratio, Time & Work</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              5 Questions
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Technical Practice</p>
                <p className="text-[11px] text-slate-500">DSA, DBMS, Networks, OOP</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              5 Questions
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Critical Thinking</p>
                <p className="text-[11px] text-slate-500">Logical Reasoning, Syllogisms, Puzzles</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              5 Questions
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onStart();
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all"
          >
            <span>Start Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
