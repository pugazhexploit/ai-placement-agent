import React, { useState, useEffect } from 'react';
import { Question, QuestionCategory, Difficulty } from '../../types';
import { questionService } from '../../services/questionService';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { Plus, Trash2, HelpCircle, Filter, BookOpen, Search } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New question form state
  const [category, setCategory] = useState<QuestionCategory>('aptitude');
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [company, setCompany] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await questionService.getQuestions();
        setQuestions(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !topic) return;

    const created = await questionService.addQuestion({
      category,
      topic,
      question: questionText,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: correctAnswer,
      explanation,
      difficulty,
      company: company || undefined,
    });

    setQuestions(prev => [created, ...prev]);
    setIsModalOpen(false);
    setTopic('');
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
  };

  const handleDelete = async (id: string) => {
    await questionService.deleteQuestion(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  if (isLoading) return <LoadingState message="Loading question bank..." />;

  const filtered = questions.filter(q => {
    const matchCat = categoryFilter === 'All' || q.category === categoryFilter;
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Placement Question Bank</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curate syllabus questions, MCQ options, and answer explanations for student practice
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practice Item</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'aptitude', 'technical', 'critical', 'interview'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                categoryFilter === c
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {c === 'all' ? 'All Questions' : c}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-hidden"
          />
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map(q => (
            <div key={q.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {q.category.toUpperCase()}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {q.topic}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Difficulty: {q.difficulty}
                  </span>
                  {q.company && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Target: {q.company}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {q.question}
                </p>

                {q.category !== 'interview' && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>A: {q.option_a}</span>
                    <span>B: {q.option_b}</span>
                    <span>C: {q.option_c}</span>
                    <span>D: {q.option_d}</span>
                  </div>
                )}

                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Correct Answer: {q.correct_answer}
                </div>
              </div>

              <button
                onClick={() => handleDelete(q.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Practice Question" maxWidth="lg">
        <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as QuestionCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="aptitude">Quantitative Aptitude</option>
                <option value="technical">Technical</option>
                <option value="critical">Critical Thinking</option>
                <option value="interview">Interview Question</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Percentages, DSA, DBMS"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Question Statement
            </label>
            <textarea
              rows={3}
              placeholder="State the problem clearly..."
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {category !== 'interview' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Option A</label>
                <input
                  type="text"
                  value={optA}
                  onChange={e => setOptA(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Option B</label>
                <input
                  type="text"
                  value={optB}
                  onChange={e => setOptB(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Option C</label>
                <input
                  type="text"
                  value={optC}
                  onChange={e => setOptC(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Option D</label>
                <input
                  type="text"
                  value={optD}
                  onChange={e => setOptD(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correct Answer
              </label>
              {category !== 'interview' ? (
                <select
                  value={correctAnswer}
                  onChange={e => setCorrectAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Key talking points..."
                  value={correctAnswer}
                  onChange={e => setCorrectAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Company (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Google, Amazon, TCS"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Explanation & Steps
            </label>
            <input
              type="text"
              placeholder="Why this is the correct answer..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-sm"
            >
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
