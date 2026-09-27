import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiService, InterviewEvaluationResult } from '../../services/aiService';
import { Bot, Send, CheckCircle2, RotateCcw, Award, Sparkles, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

interface MockInterviewProps {
  initialRole?: string;
  onGoHome: () => void;
}

const SAMPLE_INTERVIEW_QUESTIONS: Record<string, string[]> = {
  'Software Engineer': [
    'Tell me about a challenging full-stack or backend project you built and how you structured the architecture.',
    'How do you handle race conditions or concurrent data updates in a web application?',
    'Describe a scenario where you had to debug an intermittent production issue under tight time constraints.',
  ],
  'Cloud Solutions Engineer': [
    'How would you design a highly available, disaster-resilient system for a banking client?',
    'What factors determine whether you choose serverless architecture vs containerized microservices?',
    'Explain how you enforce least privilege access control and data encryption across cloud resources.',
  ],
  'Systems / Full Stack Developer': [
    'Explain the end-to-end flow of an HTTP request from a user browser to a microservices cluster.',
    'How do you manage client-side state efficiently in modern React applications without redundant re-renders?',
    'Tell me about a time you received constructive feedback on a code review and how you adapted.',
  ],
};

type Step = 'role_selection' | 'in_progress' | 'evaluating' | 'report';

export const MockInterview: React.FC<MockInterviewProps> = ({
  initialRole = 'Software Engineer',
  onGoHome,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('role_selection');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [finalReport, setFinalReport] = useState<InterviewEvaluationResult | null>(null);

  const questions = SAMPLE_INTERVIEW_QUESTIONS[selectedRole] || SAMPLE_INTERVIEW_QUESTIONS['Software Engineer'];

  const handleStart = () => {
    setCurrentQIndex(0);
    setHistory([]);
    setStudentAnswer('');
    setStep('in_progress');
  };

  const handleNextQuestion = async () => {
    if (!studentAnswer.trim()) return;

    const newHistory = [
      ...history,
      { question: questions[currentQIndex], answer: studentAnswer },
    ];
    setHistory(newHistory);
    setStudentAnswer('');

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Complete interview and evaluate
      setStep('evaluating');
      const result = await aiService.evaluateInterview({
        jobRole: selectedRole,
        qaPairs: newHistory,
      });

      if (user) {
        await aiService.saveMockInterview({
          student_id: user.id,
          job_role: selectedRole,
          score: result.score,
          feedback: result.overallFeedback,
          completed_at: new Date().toISOString(),
        });
      }

      setFinalReport(result);
      setStep('report');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Step 1: Role Selection */}
      {step === 'role_selection' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Mock Interview Simulator</h2>
              <p className="text-xs text-slate-500 mt-0.5">Practice realistic technical and behavioral rounds with instant AI evaluation</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Choose Job Target Role:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.keys(SAMPLE_INTERVIEW_QUESTIONS).map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-bold block">{role}</span>
                    <span className="text-[11px] text-slate-400 mt-1 block">3 Interview Prompts</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all"
            >
              <span>Begin Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: In-Progress Interview */}
      {step === 'in_progress' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {selectedRole}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Question {currentQIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400">Interviewer AI:</span>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  "{questions[currentQIndex]}"
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Answer (Type clearly or structure via STAR framework):
              </label>
              <textarea
                rows={6}
                value={studentAnswer}
                onChange={e => setStudentAnswer(e.target.value)}
                placeholder="Structure your answer clearly: Context, Actions taken, and Quantitative Results..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-hidden resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                onClick={handleNextQuestion}
                disabled={!studentAnswer.trim()}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>{currentQIndex < questions.length - 1 ? 'Submit & Next Question' : 'Finish & Evaluate'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Evaluating */}
      {step === 'evaluating' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyzing Candidate Responses</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Simulating AI evaluation rubric: technical accuracy, communication structure, and role readiness...
          </p>
        </div>
      )}

      {/* Step 4: Final Report */}
      {step === 'report' && finalReport && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Report • {selectedRole}
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {finalReport.score} / 100
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                {finalReport.overallFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-3">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  Identified Strengths:
                </span>
                <ul className="text-xs text-emerald-900 dark:text-emerald-400 space-y-1 list-disc pl-4">
                  {finalReport.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  Recommended Refinements:
                </span>
                <ul className="text-xs text-amber-900 dark:text-amber-400 space-y-1 list-disc pl-4">
                  {finalReport.improvements.map((im, i) => (
                    <li key={i}>{im}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Per-Question Details */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Question Breakdown
              </h4>
              {finalReport.perQuestionFeedback.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Q{idx + 1}: {item.question}</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{item.score}/100</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">AI Feedback: </span>
                    {item.feedback}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setStep('role_selection')}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Another Role</span>
              </button>
              <button
                onClick={onGoHome}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
