import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Eye, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { reviewActionBadgeClass } from '../../lib/navigation';

export const ReviewHistory: React.FC = () => {
  const { questions, setViewingQuestionId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('All');

  // Extract all review entries across questions
  const historyEntries: {
    questionId: string;
    courseCode: string;
    topic: string;
    questionText: string;
    reviewer: string;
    date: string;
    action: 'Approved' | 'Rejected' | 'Returned';
    comments: string;
  }[] = [];

  questions.forEach((q) => {
    if (q.reviews) {
      q.reviews.forEach((r) => {
        historyEntries.push({
          questionId: q.id,
          courseCode: q.courseCode,
          topic: q.topic,
          questionText: q.question,
          reviewer: r.reviewerName,
          date: r.date,
          action: r.action,
          comments: r.comments,
        });
      });
    }
  });

  const filtered = historyEntries.filter((entry) => {
    const matchesSearch =
      entry.questionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === 'All' || entry.action === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Peer Review History & Deliberation Archive
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Complete record of examination review outcomes, comments, and quality feedback.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-line shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search review comments, question ID, reviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-medium">Verdict:</span>
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-line bg-white text-ink-secondary"
          >
            <option value="All">All Verdicts ({historyEntries.length})</option>
            <option value="Approved">Approved</option>
            <option value="Returned">Returned</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-line shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs text-left">
            <thead className="bg-background border-b border-line text-ink-secondary font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Question & Course</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Evaluation Comments</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-secondary">
              {filtered.map((entry, idx) => (
                <tr key={idx} className="hover:bg-background/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                    {entry.date}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-ink block">{entry.questionId}</span>
                    <span className="text-[11px] text-ink-muted">{entry.courseCode} · {entry.topic}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-ink whitespace-nowrap">
                    {entry.reviewer}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={reviewActionBadgeClass(entry.action)}
                    >
                      {entry.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-ink-secondary max-w-sm">
                    {entry.comments}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setViewingQuestionId(entry.questionId)}
                      className="p-1 text-ink-muted hover:text-primary-600 rounded transition-colors"
                      title="Inspect question"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-ink-muted text-xs">
            No review history matching the filter.
          </div>
        )}
      </div>
    </div>
  );
};
