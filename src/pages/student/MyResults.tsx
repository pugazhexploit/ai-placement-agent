import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuizAttempt, MockInterviewRecord } from '../../types';
import { questionService } from '../../services/questionService';
import { aiService } from '../../services/aiService';
import { Award, Bot, Calendar, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

export const MyResults: React.FC = () => {
  const { user } = useAuth();
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [mockRecords, setMockRecords] = useState<MockInterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [quizzes, mocks] = await Promise.all([
          questionService.getQuizAttempts(user.id),
          aiService.getMockInterviews(user.id),
        ]);
        setQuizAttempts(quizzes);
        setMockRecords(mocks);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  if (isLoading) return <LoadingState message="Loading your placement preparation history..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Assessment & Interview Records</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Historical log of all completed practice quizzes, category drills, and AI mock evaluations
        </p>
      </div>

      {/* Quiz Attempts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Written Quiz Attempts</h3>
          </div>
          <span className="text-xs text-slate-400">{quizAttempts.length} completed</span>
        </div>

        {quizAttempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No quiz attempts logged yet. Head to Practice Hub to begin!</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {quizAttempts.map((attempt) => (
              <div key={attempt.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      {attempt.category}
                    </span>
                    {attempt.topic && (
                      <span className="text-[11px] text-slate-400">({attempt.topic})</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400 block">
                      {attempt.percentage}%
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {attempt.score}/{attempt.total_questions} correct
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mock Interviews */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Mock Interview Sessions</h3>
          </div>
          <span className="text-xs text-slate-400">{mockRecords.length} completed</span>
        </div>

        {mockRecords.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No mock interviews recorded yet. Launch simulator to practice!</p>
        ) : (
          <div className="space-y-3">
            {mockRecords.map((mock) => (
              <div
                key={mock.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{mock.job_role}</h4>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                    {mock.score} / 100
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{mock.feedback}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(mock.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
