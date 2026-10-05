import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Printer, FileQuestion, Plus, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export const ExaminerDashboard: React.FC = () => {
  const { examinations, questions, courses, setCurrentView } = useApp();

  const approvedQuestions = questions.filter(
    (q) => q.status === 'Approved' || q.status === 'Published'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Examiner & Assessment Generation Office
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Construct accredited test papers, randomize multiple exam versions, and print master answer keys.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('exam_generator')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination Set</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved Question Bank</span>
            <FileQuestion className="w-4 h-4 text-success" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {approvedQuestions.length}
            </span>
            <button
              onClick={() => setCurrentView('question_bank')}
              className="text-xs text-primary-600 font-semibold hover:underline"
            >
              Browse Bank →
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Verified by Curriculum Committee</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Generated Exam Sets</span>
            <Layers className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {examinations.length}
            </span>
            <button
              onClick={() => setCurrentView('exam_list')}
              className="text-xs text-primary-600 font-semibold hover:underline"
            >
              View All Sets →
            </button>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">With Set A / Set B randomized versions</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">BSCpE Courses Covered</span>
            <FileText className="w-4 h-4 text-info" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-ink tabular-nums">
              {courses.length}
            </span>
            <span className="text-xs text-ink-muted font-mono">Curriculum Active</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-3">Ready for Table of Specifications (TOS)</p>
        </div>
      </div>

      {/* Recent Examinations List */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-surface-secondary pb-3">
          <h3 className="text-sm font-bold text-ink">
            Active Examination Packages ({examinations.length})
          </h3>
          <button
            onClick={() => setCurrentView('exam_list')}
            className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
          >
            Manage Exam Sets
          </button>
        </div>

        <div className="space-y-3">
          {examinations.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-lg border border-line hover:border-line-strong hover:bg-background/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-ink">{exam.id}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100 font-semibold">
                    {exam.courseCode}
                  </span>
                  <span className="text-ink-muted">·</span>
                  <span className="font-semibold text-ink-secondary">{exam.term} Examination</span>
                  <span className="text-ink-muted">·</span>
                  <span className="text-ink-muted font-mono">{exam.versions.length} Versions</span>
                </div>
                <h4 className="font-bold text-ink text-sm leading-snug">{exam.title}</h4>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {exam.questionCount} Questions · {exam.totalPoints} Total Points · {exam.timeLimitMinutes} mins duration
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setCurrentView('exam_view', { viewingExamId: exam.id });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print & Export</span>
                </button>
              </div>
            </div>
          ))}

          {examinations.length === 0 && (
            <div className="text-center py-10 text-ink-muted text-xs">
              No examination sets created yet. Click "New Examination Set" to generate one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
