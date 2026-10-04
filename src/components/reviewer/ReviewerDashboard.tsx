import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckSquare, CheckCircle2, Clock, History, ArrowRight, ShieldCheck } from 'lucide-react';

export const ReviewerDashboard: React.FC = () => {
  const { questions, setCurrentView, setViewingQuestionId } = useApp();

  const pendingQuestions = questions.filter(
    (q) => q.status === 'Submitted' || q.status === 'Under Review'
  );

  const approvedQuestions = questions.filter(
    (q) => q.status === 'Approved' || q.status === 'Published'
  );

  const allReviews = questions.flatMap((q) => q.reviews || []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Curriculum Committee Review Console
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Ensure examination question rigor, correctness, Bloom's taxonomy balance, and accreditation compliance.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('review_queue')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Open Review Queue ({pendingQuestions.length})</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Awaiting Evaluation</span>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {pendingQuestions.length}
            </span>
            <button
              onClick={() => setCurrentView('review_queue')}
              className="text-xs text-warning-fg font-semibold hover:underline"
            >
              Evaluate Now →
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Submitted by faculty members</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved for Bank</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {approvedQuestions.length}
            </span>
            <span className="text-xs text-success font-medium">Accredited</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Ready for examination sets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Committee Reviews</span>
            <ShieldCheck className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {allReviews.length}
            </span>
            <button
              onClick={() => setCurrentView('review_history')}
              className="text-xs text-primary-600 font-semibold hover:underline"
            >
              History →
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Deliberations on file</p>
        </div>
      </div>

      {/* Main Review Queue Section */}
      <div className="bg-white rounded-xl border border-line p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-surface-secondary pb-3">
          <h3 className="text-sm font-bold text-ink">
            Pending Submitted Questions ({pendingQuestions.length})
          </h3>
          <button
            onClick={() => setCurrentView('review_queue')}
            className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
          >
            Full Queue View
          </button>
        </div>

        <div className="space-y-3">
          {pendingQuestions.slice(0, 5).map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-lg border border-line/80 hover:border-line-strong hover:bg-background/50 transition-colors flex items-start justify-between gap-4 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-ink">{q.id}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100 font-semibold">
                    {q.courseCode}
                  </span>
                  <span className="text-ink-muted">·</span>
                  <span className="text-ink-secondary font-medium">{q.topic}</span>
                  <span className="text-ink-muted">·</span>
                  <span className="text-ink-muted">By {q.authorName}</span>
                </div>
                <p className="font-medium text-ink line-clamp-2 leading-relaxed">
                  {q.question}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setViewingQuestionId(q.id)}
                  className="px-2.5 py-1 text-xs font-medium text-ink-secondary bg-white border border-line-strong rounded-lg hover:bg-background transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={() => setCurrentView('review_queue')}
                  className="px-3 py-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
                >
                  Review
                </button>
              </div>
            </div>
          ))}

          {pendingQuestions.length === 0 && (
            <div className="p-8 text-center text-ink-muted text-xs">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-1" />
              All submitted questions have been reviewed! Good work.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
