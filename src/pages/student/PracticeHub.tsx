import React, { useState, useEffect } from 'react';
import { QuestionCategory, Question } from '../../types';
import { questionService } from '../../services/questionService';
import { Calculator, Code2, Brain, ArrowRight, BookOpen, Sparkles, Filter, Award } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface PracticeHubProps {
  category: QuestionCategory;
  onStartQuiz: (category: QuestionCategory, topic?: string) => void;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ category, onStartQuiz }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const topicConfig: Record<QuestionCategory, { title: string; subtitle: string; icon: any; topics: string[]; color: string }> = {
    aptitude: {
      title: 'Quantitative Aptitude Practice',
      subtitle: 'Master calculations, numerical reasoning, speed math, and problem solving',
      icon: Calculator,
      color: 'amber',
      topics: [
        'All',
        'Percentages',
        'Profit & Loss',
        'Ratio',
        'Average',
        'Time & Work',
        'Time & Distance',
        'Probability',
        'Number System',
        'Data Interpretation',
      ],
    },
    technical: {
      title: 'Technical Practice Hub',
      subtitle: 'Core computer science fundamentals, coding paradigms, databases, and web frameworks',
      icon: Code2,
      color: 'brand',
      topics: [
        'All',
        'Data Structures',
        'DBMS',
        'OOP',
        'Operating Systems',
        'Computer Networks',
        'React',
        'Python',
        'Java',
        'Programming',
      ],
    },
    critical: {
      title: 'Critical Thinking & Logical Reasoning',
      subtitle: 'Analytical deduction, pattern recognition, syllogisms, and puzzle solving',
      icon: Brain,
      color: 'emerald',
      topics: [
        'All',
        'Logical Reasoning',
        'Analytical Reasoning',
        'Puzzles',
        'Pattern Recognition',
        'Data Sufficiency',
        'Statement & Assumption',
        'Syllogisms',
      ],
    },
    interview: {
      title: 'Interview Preparation',
      subtitle: 'HR, Behavioral, and System Design questions',
      icon: Award,
      color: 'purple',
      topics: ['All', 'HR Questions', 'Behavioral Questions', 'Technical Questions', 'Role-Based Questions'],
    },
  };

  const config = topicConfig[category];

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await questionService.getQuestions(category);
        setQuestions(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [category]);

  const filteredQuestions = selectedTopic === 'All'
    ? questions
    : questions.filter(q => q.topic.toLowerCase().includes(selectedTopic.toLowerCase()));

  if (isLoading) return <LoadingState message="Loading practice questions..." />;

  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{config.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => onStartQuiz(category, selectedTopic === 'All' ? undefined : selectedTopic)}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Full Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Topic Filter Pills */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Select Topic Syllabus</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {config.topics.map(topic => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions Preview Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Available Practice Items ({filteredQuestions.length})</span>
          <span>Click "Test Now" to start timed practice</span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No questions listed yet for topic: {selectedTopic}</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                    {q.topic}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Difficulty: {q.difficulty}
                  </span>
                  {q.company && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Target: {q.company}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {idx + 1}. {q.question}
                </p>
              </div>

              <button
                onClick={() => onStartQuiz(category, q.topic)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-brand-600 hover:text-white transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Practice Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
