import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WelcomeCard } from '../../components/student/WelcomeCard';
import { ProgressOverview } from '../../components/student/ProgressOverview';
import { DriveCard } from '../../components/student/DriveCard';
import { DailyChallengeModal } from '../../components/student/DailyChallengeModal';
import { StatCard } from '../../components/common/StatCard';
import { placementService } from '../../services/placementService';
import { questionService } from '../../services/questionService';
import { aiService } from '../../services/aiService';
import { Application, PlacementDrive } from '../../types';
import { Briefcase, CheckCircle2, Award, Bot, Flame, ArrowRight, Sparkles } from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tabId: string, params?: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [avgQuizScore, setAvgQuizScore] = useState<number>(85);
  const [mockScore, setMockScore] = useState<number>(85);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [drivesData, appsData, quizData, mockData] = await Promise.all([
          placementService.getDrives(),
          placementService.getApplications(user.id),
          questionService.getQuizAttempts(user.id),
          aiService.getMockInterviews(user.id),
        ]);

        setDrives(drivesData);
        setApplications(appsData);

        if (quizData.length > 0) {
          const totalPerc = quizData.reduce((acc, q) => acc + Number(q.percentage), 0);
          setAvgQuizScore(Math.round(totalPerc / quizData.length));
        }

        if (mockData.length > 0) {
          setMockScore(mockData[0].score);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleApply = async (driveId: string) => {
    if (!user) return;
    try {
      const newApp = await placementService.applyToDrive(user.id, driveId);
      setApplications(prev => [newApp, ...prev.filter(a => a.drive_id !== driveId)]);
    } catch (err) {
      console.error('Failed to apply:', err);
    }
  };

  const appliedDriveIds = new Set(applications.map(a => a.drive_id));
  const eligibleDrivesCount = drives.filter(d => (user?.cgpa || 8.0) >= (d.min_cgpa || 0)).length;

  if (!user) return null;

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Welcome Card */}
      <WelcomeCard user={user} totalApplications={applications.length} />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Applications"
          value={applications.length}
          subtitle="Submitted for campus recruitment"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Eligible Drives"
          value={eligibleDrivesCount}
          subtitle="Matching your CGPA & branch"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg Quiz Score"
          value={`${avgQuizScore}%`}
          subtitle="Across aptitude & technical tests"
          icon={Award}
          color="amber"
          trend={{ value: '+4% this week', isPositive: true }}
        />
        <StatCard
          title="Mock Interview Score"
          value={`${mockScore}/100`}
          subtitle="Latest AI role evaluation"
          icon={Bot}
          color="purple"
        />
      </div>

      {/* Preparation Progress Bars */}
      <ProgressOverview />

      {/* Daily Challenge Promo Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-emerald-500/10 border border-amber-300/40 dark:border-amber-700/40 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Placement Challenge</h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md">
                15 Mins
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              15 high-frequency questions: <strong>5 Aptitude</strong> + <strong>5 Technical</strong> + <strong>5 Critical Thinking</strong>. Boost your daily campus rank!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDailyChallengeOpen(true)}
          className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition-all active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Start Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Upcoming Drives Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Placement Drives</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Companies actively hiring on campus</p>
          </div>
          <button
            onClick={() => onNavigate('placement-drives')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.slice(0, 3).map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              hasApplied={appliedDriveIds.has(drive.id)}
              onApply={handleApply}
              onViewDetails={() => onNavigate('placement-drives')}
              isEligible={(user?.cgpa || 8.0) >= (drive.min_cgpa || 0)}
            />
          ))}
        </div>
      </div>

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        onStart={() => onNavigate('quiz-runner', { category: 'daily', title: "Today's Placement Challenge" })}
      />
    </div>
  );
};
