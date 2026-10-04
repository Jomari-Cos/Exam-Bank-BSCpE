import React from 'react';
import { useApp } from '../../context/AppContext';
import { generateExamPdf } from '../../lib/pdfGenerator';
import {
  FileText,
  Printer,
  Trash2,
  Plus,
  Layers,
  Calendar,
  Clock,
  Download,
  Eye,
  FileDown,
} from 'lucide-react';

export const ExamListView: React.FC = () => {
  const {
    examinations,
    deleteExamination,
    setCurrentView,
    isFirebaseConnected,
    isSyncing,
    lastSyncedAt,
    syncNotice,
    dismissSyncNotice,
  } = useApp();

  const handleOpenExam = (id: string) => {
    setCurrentView('exam_view', { viewingExamId: id });
  };

  const handleDirectDownloadPdf = (exam: typeof examinations[0]) => {
    const version = exam.versions[0];
    if (version) {
      generateExamPdf({
        exam,
        version,
        isAnswerKey: false,
      });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the examination set "${title}"?`)) {
      deleteExamination(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Generated Examination Sets & Archives
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Access previous examination packages, view randomized test versions, and print master answer keys.
            Every package is stored in the shared cloud database and updates live for all users.
          </p>
          <p className="text-[11px] mt-1 font-mono flex items-center gap-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${isFirebaseConnected && !isSyncing ? 'bg-success' : isFirebaseConnected ? 'bg-warning animate-pulse' : 'bg-danger'}`}
            />
            <span className="text-ink-muted">
              {isFirebaseConnected
                ? isSyncing
                  ? 'Syncing with shared database…'
                  : lastSyncedAt
                    ? `Live — synced ${new Date(lastSyncedAt).toLocaleTimeString()}`
                    : 'Live — connected to shared database'
                : 'Offline — showing cached packages, will sync on reconnect'}
            </span>
          </p>
        </div>

        <button
          onClick={() => setCurrentView('exam_generator')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Exam Set</span>
        </button>
      </div>

      {/* Cross-device sync notice */}
      {syncNotice && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs rounded-xl border bg-primary-50/70 border-primary-200 text-primary-900">
          <span className="leading-relaxed">{syncNotice.message}</span>
          <button
            onClick={dismissSyncNotice}
            className="shrink-0 px-2 py-1 text-[11px] font-semibold text-primary-700 hover:text-primary-900 hover:bg-primary-100 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Examinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examinations.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border border-line p-5 shadow-xs hover:border-line-strong transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                    {exam.courseCode}
                  </span>
                  <span className="text-[11px] font-semibold text-ink-secondary">
                    {exam.term} Exam
                  </span>
                </div>
                <span className="text-[10px] text-ink-muted font-mono bg-surface-secondary px-2 py-0.5 rounded">
                  {exam.versions.length} Versions
                </span>
              </div>

              <h3 className="text-sm font-bold text-ink leading-snug">
                {exam.title}
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                {exam.courseName} · A.Y. {exam.academicYear} · {exam.semester}
              </p>

              <div className="mt-4 pt-3 border-t border-surface-secondary grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-background p-2 rounded-lg border border-surface-secondary">
                  <span className="text-[10px] text-ink-muted block uppercase">Questions</span>
                  <strong className="font-mono text-ink font-bold">{exam.questionCount}</strong>
                </div>
                <div className="bg-background p-2 rounded-lg border border-surface-secondary">
                  <span className="text-[10px] text-ink-muted block uppercase">Total Points</span>
                  <strong className="font-mono text-ink font-bold">{exam.totalPoints}</strong>
                </div>
                <div className="bg-background p-2 rounded-lg border border-surface-secondary">
                  <span className="text-[10px] text-ink-muted block uppercase">Duration</span>
                  <strong className="font-mono text-ink font-bold">{exam.timeLimitMinutes}m</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-surface-secondary flex items-center justify-between text-xs">
              <span className="text-[11px] text-ink-muted font-mono">
                Generated: {exam.dateCreated}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDirectDownloadPdf(exam)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Direct download Set A as PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => handleOpenExam(exam.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-ink-secondary bg-background hover:bg-surface-secondary rounded-lg transition-colors border border-line cursor-pointer"
                  title="Open full print and multi-version view"
                >
                  <Printer className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Print / View</span>
                </button>

                <button
                  onClick={() => handleDelete(exam.id, exam.title)}
                  className="p-1.5 text-ink-muted hover:text-danger rounded-lg transition-colors cursor-pointer"
                  title="Delete Exam Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {examinations.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-line text-ink-muted text-xs">
            <FileText className="w-8 h-8 text-line-strong mx-auto mb-2" />
            <p className="font-semibold text-ink-secondary">No examination packages generated yet</p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Launch the Examination Generator to assemble your first exam set.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
