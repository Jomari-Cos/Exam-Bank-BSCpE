import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionStatus } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Copy,
  Archive,
  Trash2,
  Send,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const MyQuestions: React.FC = () => {
  const {
    currentUser,
    questions,
    setCurrentView,
    setViewingQuestionId,
    submitQuestionForReview,
    duplicateQuestion,
    archiveQuestion,
    deleteQuestion,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');

  // Filter authored questions
  const myQuestions = questions.filter(
    (q) => q.authorId === currentUser.id || currentUser.role === 'admin'
  );

  const filteredQuestions = myQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesCourse = courseFilter === 'All' || q.courseCode === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Unique course codes authored
  const availableCourses = Array.from(new Set(myQuestions.map((q) => q.courseCode)));

  const handleEdit = (id: string) => {
    setCurrentView('create_question', { editingQuestionId: id });
  };

  const handleSubmit = (id: string) => {
    if (window.confirm('Submit this question to the curriculum committee for peer review?')) {
      submitQuestionForReview(id);
    }
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicateQuestion(id);
    setCurrentView('create_question', { editingQuestionId: duplicated.id });
  };

  const handleArchive = (id: string) => {
    if (window.confirm('Archive this question? It will not be suggested in future exams.')) {
      archiveQuestion(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Permanently delete this question? This action cannot be undone.')) {
      deleteQuestion(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Authored Question Bank
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal draft pool, review committee comments, and submit questions for formal approval.
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentView('create_question', { editingQuestionId: null });
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Author Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search my questions, ID, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg shrink-0">
            {['All', 'Draft', 'Submitted', 'Approved', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-mono shrink-0"
          >
            <option value="All">All Courses</option>
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Question ID & Topic</th>
                <th className="py-3 px-4">Question Summary</th>
                <th className="py-3 px-4">Type & Difficulty</th>
                <th className="py-3 px-4">Status & Reviews</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q) => {
                const latestReview = q.reviews && q.reviews.length > 0 ? q.reviews[q.reviews.length - 1] : null;

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900">{q.id}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                          {q.courseCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{q.topic}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {q.points} {q.points === 1 ? 'pt' : 'pts'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <p
                        onClick={() => setViewingQuestionId(q.id)}
                        className="font-medium text-slate-800 line-clamp-2 hover:text-indigo-600 cursor-pointer leading-relaxed"
                      >
                        {q.question}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        CLO: {q.learningOutcome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="capitalize text-slate-700 block font-medium">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-1 inline-block ${
                          q.difficulty === 'Easy'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : q.difficulty === 'Medium'
                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                            : 'text-purple-700 bg-purple-50 border-purple-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            q.status === 'Approved'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : q.status === 'Submitted'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : q.status === 'Archived'
                              ? 'text-slate-500 bg-slate-100 border-slate-200'
                              : 'text-slate-700 bg-slate-50 border-slate-200'
                          }`}
                        >
                          {q.status}
                        </span>

                        {latestReview && (
                          <button
                            onClick={() => setViewingQuestionId(q.id)}
                            className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{latestReview.action} by {latestReview.reviewerName.split(' ')[1] || 'Reviewer'}</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingQuestionId(q.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Preview Question"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {q.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleEdit(q.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                              title="Edit Question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSubmit(q.id)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                              title="Submit for Review"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDuplicate(q.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Duplicate to new Draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {q.status !== 'Archived' ? (
                          <button
                            onClick={() => handleArchive(q.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Archive Question"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-xs">
            No authored questions found matching filters.
          </div>
        )}
      </div>
    </div>
  );
};
