import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Eye, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Peer Review History & Deliberation Archive
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of examination review outcomes, comments, and quality feedback.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search review comments, question ID, reviewer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Verdict:</span>
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="All">All Verdicts ({historyEntries.length})</option>
            <option value="Approved">Approved</option>
            <option value="Returned">Returned</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Question & Course</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Evaluation Comments</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {entry.date}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 block">{entry.questionId}</span>
                    <span className="text-[11px] text-slate-500">{entry.courseCode} · {entry.topic}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {entry.reviewer}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        entry.action === 'Approved'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : entry.action === 'Returned'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-rose-700 bg-rose-50 border-rose-200'
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                    {entry.comments}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setViewingQuestionId(entry.questionId)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
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
          <div className="p-10 text-center text-slate-400 text-xs">
            No review history matching the filter.
          </div>
        )}
      </div>
    </div>
  );
};
