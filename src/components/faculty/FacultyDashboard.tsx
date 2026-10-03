import React from 'react';
import { useApp } from '../../context/AppContext';
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
    setEditingQuestionId,
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
    setEditingQuestionId(null);
    setCurrentView('create_question');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Faculty Author Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author, organize, and submit accredited examination questions for peer review.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <FilePlus className="w-4 h-4" />
          <span>Author New Question</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">My Questions</span>
            <FileQuestion className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {myQuestions.length}
            </span>
            <button
              onClick={() => setCurrentView('my_questions')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              View All →
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Total authored items in bank</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Drafts in Progress</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {drafts.length}
            </span>
            <span className="text-xs text-slate-500">Unsubmitted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Ready to finalize and submit</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Under Committee Review</span>
            <Send className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {submitted.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">In Queue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Awaiting reviewer feedback</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved for Exams</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {approved.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Available for examination generation</p>
        </div>
      </div>

      {/* Alert Banner if questions returned */}
      {returned.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: {returned.length} Question(s) Returned with Reviewer Comments
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                The curriculum reviewer suggested revisions before approval. Please check feedback and revise.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('my_questions')}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Review Feedback
          </button>
        </div>
      )}

      {/* Two Column Layout: Recent Questions & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">My Authored Questions</h3>
            <button
              onClick={() => setCurrentView('my_questions')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Manage All ({myQuestions.length})
            </button>
          </div>

          <div className="space-y-3">
            {myQuestions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                onClick={() => setViewingQuestionId(q.id)}
                className="p-3 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-slate-800">{q.id}</span>
                    <span className="font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px]">
                      {q.courseCode}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 text-[11px] truncate">{q.topic}</span>
                  </div>
                  <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      q.status === 'Approved'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : q.status === 'Submitted'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-slate-600 bg-slate-50 border-slate-200'
                    }`}
                  >
                    {q.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-2">
                    {q.points} {q.points === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              </div>
            ))}

            {myQuestions.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No authored questions yet. Click "Author New Question" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch & Examination Hub */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Faculty Actions</h3>
            <button
              onClick={handleCreateNew}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800">Create New Question</p>
                <p className="text-[11px] text-slate-500">Supports all 11 question types & test suites</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setCurrentView('question_bank')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800">Search Approved Question Bank</p>
                <p className="text-[11px] text-slate-500">Explore questions across all disciplines</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setCurrentView('exam_generator')}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800">Generate Examination Set</p>
                <p className="text-[11px] text-slate-500">Build randomized exams & answer keys</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>Question Lifecycle Guidelines</span>
            </h4>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
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
