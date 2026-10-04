import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { ReviewModal } from './ReviewModal';
import { CheckSquare, Search, Filter, Eye, ShieldCheck, Clock, BookOpen } from 'lucide-react';
import { difficultyBadgeClass } from '../../lib/navigation';

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
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Curriculum Committee Review Queue
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Questions submitted by faculty awaiting accreditation check, syllabus alignment, and key verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-soft text-warning-fg border border-warning-border">
            {pendingQuestions.length} Pending Peer Review
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search pending questions, author, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-medium">Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-line bg-white text-ink-secondary font-mono"
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead className="font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Question ID & Course</th>
                <th className="py-3 px-4">Question Statement</th>
                <th className="py-3 px-4">Type & Difficulty</th>
                <th className="py-3 px-4">Author & Date</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-ink">{q.id}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100 font-semibold">
                        {q.courseCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted truncate max-w-[180px]">{q.topic}</p>
                    <span className="text-[10px] text-ink-muted font-mono">
                      {q.points} {q.points === 1 ? 'pt' : 'pts'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-md">
                    <p className="font-medium text-ink line-clamp-2 leading-relaxed">
                      {q.question}
                    </p>
                    <span className="text-[10px] text-ink-muted font-mono mt-1 block">
                      {q.learningOutcome}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="capitalize text-ink-secondary block font-medium">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span
                      className={difficultyBadgeClass(q.difficulty)}
                    >
                      {q.difficulty}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-ink block">{q.authorName}</span>
                    <span className="text-[10px] text-ink-muted font-mono block mt-0.5">
                      Submitted: {q.dateModified || q.dateCreated}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingQuestionId(q.id)}
                        className="px-2.5 py-1 text-xs font-medium text-ink-secondary bg-white border border-line-strong rounded-lg"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => setReviewingQuestion(q)}
                        className="btn btn-primary"
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
          <div className="p-12 text-center text-ink-muted text-xs">
            <CheckSquare className="w-8 h-8 text-ink-muted mx-auto mb-2" />
            <p className="font-semibold text-ink-secondary">No questions currently in the review queue</p>
            <p className="text-[11px] text-ink-muted mt-0.5">All submitted questions have been reviewed.</p>
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
