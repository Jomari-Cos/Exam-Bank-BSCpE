import React from 'react';
import { useApp } from '../../context/AppContext';
import { statusBadgeClass } from '../../lib/navigation';
import {
  FileQuestion,
  FilePlus,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const {
    currentUser,
    questions,
    setCurrentView,
    setViewingQuestionId,
  } = useApp();

  const myQuestions = questions.filter((q) => q.authorId === currentUser.id);
  const drafts = myQuestions.filter((q) => q.status === 'Draft');
  const submitted = myQuestions.filter(
    (q) => q.status === 'Submitted' || q.status === 'Under Review'
  );
  const approved = myQuestions.filter(
    (q) => q.status === 'Approved' || q.status === 'Published'
  );
  const returned = myQuestions.filter((q) =>
    q.reviews && q.reviews.some((r) => r.action === 'Returned') && q.status === 'Draft'
  );

  const handleCreateNew = () => {
    setCurrentView('create_question', { editingQuestionId: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Faculty Author Dashboard
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Author, organize, and submit accredited examination questions for peer review.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
        >
          <FilePlus className="w-4 h-4" />
          <span>Author New Question</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">My Questions</span>
            <FileQuestion className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {myQuestions.length}
            </span>
            <button
              onClick={() => setCurrentView('my_questions')}
              className="text-xs text-primary-600 hover:underline font-medium"
            >
              View All â†’
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Total authored items in bank</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Drafts in Progress</span>
            <Clock className="w-4 h-4 text-ink-secondary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {drafts.length}
            </span>
            <span className="text-xs text-ink-muted">Unsubmitted</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Ready to finalize and submit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Under Committee Review</span>
            <Send className="w-4 h-4 text-warning" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {submitted.length}
            </span>
            <span className="text-xs text-warning font-medium">In Queue</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Awaiting reviewer feedback</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-line shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved for Exams</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {approved.length}
            </span>
            <span className="text-xs text-success font-medium">Ready</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Available for examination generation</p>
        </div>
      </div>

      {/* Alert Banner if questions returned */}
      {returned.length > 0 && (
        <div className="p-4 bg-warning-soft border border-warning-border rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-warning-fg">
                Action Required: {returned.length} Question(s) Returned with Reviewer Comments
              </h4>
              <p className="text-xs text-warning-fg mt-0.5">
                The curriculum reviewer suggested revisions before approval. Please check feedback and revise.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('my_questions')}
            className="px-3 py-1.5 text-xs font-semibold text-warning-fg bg-warning-soft hover:bg-warning-border rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Review Feedback
          </button>
        </div>
      )}

      {/* Two Column Layout: Recent Questions & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-line p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-surface-secondary pb-3">
            <h3 className="text-sm font-bold text-ink">My Authored Questions</h3>
            <button
              onClick={() => setCurrentView('my_questions')}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
            >
              Manage All ({myQuestions.length})
            </button>
          </div>

          <div className="space-y-3">
            {myQuestions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                onClick={() => setViewingQuestionId(q.id)}
                className="p-3 rounded-lg border border-line/80 hover:border-line-strong hover:bg-background/50 transition-colors cursor-pointer flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-ink">{q.id}</span>
                    <span className="font-mono px-1.5 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100 text-[10px]">
                      {q.courseCode}
                    </span>
                    <span className="text-ink-muted">Â·</span>
                    <span className="text-ink-muted text-[11px] truncate">{q.topic}</span>
                  </div>
                  <p className="font-medium text-ink line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  <span
                    className={statusBadgeClass(q.status)}
                  >
                    {q.status}
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono mt-2">
                    {q.points} {q.points === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              </div>
            ))}

            {myQuestions.length === 0 && (
              <div className="text-center py-10 text-ink-muted text-xs">
                No authored questions yet. Click "Author New Question" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch & Examination Hub */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-line p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-ink">Faculty Actions</h3>
            <button
              onClick={handleCreateNew}
              className="w-full text-left p-3 rounded-lg border border-line hover:border-line-strong hover:bg-background transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-ink">Create New Question</p>
                <p className="text-[11px] text-ink-muted">Supports all 11 question types & test suites</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </button>

            <button
              onClick={() => setCurrentView('question_bank')}
              className="w-full text-left p-3 rounded-lg border border-line hover:border-line-strong hover:bg-background transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-ink">Search Approved Question Bank</p>
                <p className="text-[11px] text-ink-muted">Explore questions across all disciplines</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </button>

            <button
              onClick={() => setCurrentView('exam_generator')}
              className="w-full text-left p-3 rounded-lg border border-line hover:border-line-strong hover:bg-background transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-ink">Generate Examination Set</p>
                <p className="text-[11px] text-ink-muted">Build randomized exams & answer keys</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-muted" />
            </button>
          </div>

          <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-5 text-xs text-primary-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>Question Lifecycle Guidelines</span>
            </h4>
            <p className="text-[11px] text-primary-900/80 leading-relaxed">
              1. <strong>Draft</strong>: Author your question, choices, code, or test cases.<br/>
              2. <strong>Submitted</strong>: Send to department reviewer for syllabus verification.<br/>
              3. <strong>Approved</strong>: Automatically indexed in the question bank for exam builders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
