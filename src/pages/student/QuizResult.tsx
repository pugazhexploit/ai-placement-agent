import React from 'react';
import { QuizAnswerDetail } from '../../types';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, BookOpen, Check, X } from 'lucide-react';

interface QuizResultProps {
  result: {
    category: string;
    topic?: string;
    score: number;
    total: number;
    percentage: number;
    answers: QuizAnswerDetail[];
  };
  onRetake: () => void;
  onGoHome: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  result,
  onRetake,
  onGoHome,
}) => {
  const correctCount = result.score;
  const incorrectCount = result.total - result.score;

  // Calculate topic-wise breakdown
  const topicBreakdown = result.answers.reduce((acc, a) => {
    const topic = a.question.topic || 'General';
    if (!acc[topic]) acc[topic] = { total: 0, correct: 0 };
    acc[topic].total += 1;
    if (a.is_correct) acc[topic].correct += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number }>);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Score Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center border border-brand-200 dark:border-brand-800 shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Test Performance Summary
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {result.percentage}%
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {result.category.toUpperCase()} {result.topic ? `• ${result.topic}` : ''}
          </p>
        </div>

        {/* 3 Metric Pills: Score, Correct, Incorrect */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400 block">Total Score</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {result.score}/{result.total}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block">Correct</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {correctCount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-xs text-rose-600 dark:text-rose-400 block">Incorrect</span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
              {incorrectCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={onGoHome}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic-Wise Performance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Topic-Wise Performance</h3>

        <div className="space-y-3">
          {Object.entries(topicBreakdown).map(([topic, data]) => {
            const perc = Math.round((data.correct / data.total) * 100);
            return (
              <div key={topic} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{topic}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data.correct}/{data.total} ({perc}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      perc >= 80 ? 'bg-emerald-500' : perc >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${perc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Detailed Solutions & Explanations</h3>

        {result.answers.map((ans, idx) => (
          <div
            key={ans.question_id || idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
              {ans.is_correct ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>Correct</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                  <X className="w-3.5 h-3.5" />
                  <span>Incorrect</span>
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">{ans.question.question}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${ans.is_correct ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:text-emerald-300' : 'bg-rose-50/50 border-rose-200 text-rose-900 dark:text-rose-300'}`}>
                <span className="font-semibold block text-[11px]">Your Answer:</span>
                <span>{ans.selected_answer || 'None Selected'}</span>
              </div>
              <div className="p-2.5 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:text-emerald-300">
                <span className="font-semibold block text-[11px]">Correct Answer:</span>
                <span>{ans.question.correct_answer}</span>
              </div>
            </div>

            {ans.question.explanation && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation: </span>
                {ans.question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
