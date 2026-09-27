import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { questionService } from '../../services/questionService';
import { MessageSquare, Lightbulb, ChevronDown, ChevronUp, Bot, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface InterviewPrepProps {
  onStartMockInterview: (role: string) => void;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ onStartMockInterview }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const topics = ['All', 'HR Questions', 'Behavioral Questions', 'Technical Questions', 'Role-Based Questions'];

  useEffect(() => {
    async function load() {
      try {
        const data = await questionService.getQuestions('interview');
        setQuestions(data);
        if (data.length > 0) setExpandedId(data[0].id);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) return <LoadingState message="Loading interview questions repository..." />;

  const filtered = selectedTopic === 'All'
    ? questions
    : questions.filter(q => q.topic.toLowerCase().includes(selectedTopic.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Campus Interview Preparation</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              High-frequency interview questions with suggested answer frameworks (STAR technique & architectural design)
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartMockInterview('Associate Software Engineer')}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 active:scale-98 transition-all shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>Launch AI Mock Interview</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {topics.map(t => {
          const isSelected = selectedTopic === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Questions Accordion */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {item.topic}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Difficulty: {item.difficulty}
                    </span>
                    {item.company && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.company}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {item.question}
                  </h4>
                </div>

                <div className="p-1 rounded-lg text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Suggested Preparation Points & Structure</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                      {item.correct_answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
