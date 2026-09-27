import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Question, QuestionCategory, QuizAnswerDetail } from '../../types';
import { questionService } from '../../services/questionService';
import { LoadingState } from '../../components/common/LoadingState';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Send, AlertTriangle } from 'lucide-react';

interface QuizRunnerProps {
  category: QuestionCategory | 'daily';
  topic?: string;
  onComplete: (resultData: {
    category: string;
    topic?: string;
    score: number;
    total: number;
    percentage: number;
    answers: QuizAnswerDetail[];
  }) => void;
  onCancel: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  category,
  topic,
  onComplete,
  onCancel,
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes timer
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      setIsLoading(true);
      try {
        let loaded: Question[] = [];
        if (category === 'daily') {
          const daily = await questionService.getDailyChallengeQuestions();
          loaded = [...daily.aptitude, ...daily.technical, ...daily.critical];
        } else {
          loaded = await questionService.getQuestions(category, topic);
        }

        if (loaded.length === 0) {
          // Fallback to all questions if specific topic has 0
          loaded = await questionService.getQuestions();
        }
        setQuestions(loaded);
        setSecondsLeft(loaded.length * 60);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuiz();
  }, [category, topic]);

  // Countdown timer
  useEffect(() => {
    if (isLoading || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, secondsLeft]);

  const handleSelectOption = (optionKey: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    const answers: QuizAnswerDetail[] = questions.map((q, idx) => {
      const selected = selectedAnswers[idx] || '';
      const isCorrect = selected.toUpperCase() === q.correct_answer.toUpperCase();
      if (isCorrect) score += 1;
      return {
        question_id: q.id,
        question: q,
        selected_answer: selected,
        is_correct: isCorrect,
      };
    });

    const total = questions.length;
    const percentage = Math.round((score / Math.max(1, total)) * 100);

    if (user) {
      await questionService.saveQuizAttempt({
        student_id: user.id,
        category: category.toString(),
        topic: topic || 'Mixed Assessment',
        score,
        total_questions: total,
        percentage,
        completed_at: new Date().toISOString(),
      });
    }

    onComplete({
      category: category.toString(),
      topic,
      score,
      total,
      percentage,
      answers,
    });
  };

  if (isLoading) return <LoadingState message="Preparing question set..." />;

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No questions available</h3>
        <p className="text-xs text-slate-500 mt-1">Please pick another category or add questions in Question Bank.</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentSelection = selectedAnswers[currentIndex];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const answeredCount = Object.keys(selectedAnswers).length;

  const options = [
    { key: 'A', text: currentQ.option_a },
    { key: 'B', text: currentQ.option_b },
    { key: 'C', text: currentQ.option_c },
    { key: 'D', text: currentQ.option_d },
  ].filter(opt => Boolean(opt.text));

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Bar: Progress & Timer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {category.toUpperCase()} {topic ? `• ${topic}` : ''}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Question {currentIndex + 1} / {questions.length}
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-brand-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400">
            TOPIC: {currentQ.topic}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {options.map((opt) => {
            const isSelected = currentSelection === opt.key;
            return (
              <label
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {opt.key}
                </div>
                <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
              </label>
            );
          })}
        </div>

        {/* Bottom Pagination & Submit Controls */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-medium">
            {answeredCount} of {questions.length} answered
          </span>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
