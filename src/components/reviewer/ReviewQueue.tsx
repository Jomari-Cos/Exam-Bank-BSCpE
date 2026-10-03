import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { ReviewModal } from './ReviewModal';
import { CheckSquare, Search, Filter, Eye, ShieldCheck, Clock, BookOpen } from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { questions, courses, setViewingQuestionId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [reviewingQuestion, setReviewingQuestion] = useState<Question | null>(null);

  // Submitted questions awaiting review
  const pendingQuestions = questions.filter(
    (q) => q.status === 'Submitted' || q.status === 'Under Review'
  );

  const filteredQuestions = pendingQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'All' || q.courseCode === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const availableCourses = Array.from(new Set(pendingQuestions.map((q) => q.courseCode)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Curriculum Committee Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Questions submitted by faculty awaiting accreditation check, syllabus alignment, and key verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            {pendingQuestions.length} Pending Peer Review
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search pending questions, author, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-mono"
          >
            <option value="All">All Courses ({pendingQuestions.length})</option>
            {availableCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Question ID & Course</th>
                <th className="py-3 px-4">Question Statement</th>
                <th className="py-3 px-4">Type & Difficulty</th>
                <th className="py-3 px-4">Author & Date</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q) => (
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
                    <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                      {q.question}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {q.learningOutcome}
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

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 block">{q.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Submitted: {q.dateModified || q.dateCreated}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingQuestionId(q.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => setReviewingQuestion(q)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No questions currently in the review queue</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All submitted questions have been reviewed.</p>
          </div>
        )}
      </div>

      {/* Deliberation Modal */}
      {reviewingQuestion && (
        <ReviewModal
          question={reviewingQuestion}
          onClose={() => setReviewingQuestion(null)}
        />
      )}
    </div>
  );
};
