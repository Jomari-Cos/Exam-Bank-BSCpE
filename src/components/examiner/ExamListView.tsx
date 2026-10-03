import React from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

export const ExamListView: React.FC = () => {
  const { examinations, deleteExamination, setViewingExamId, setCurrentView } = useApp();

  const handleOpenExam = (id: string) => {
    setViewingExamId(id);
    setCurrentView('exam_view');
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Generated Examination Sets & Archives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access previous examination packages, view randomized test versions, and print master answer keys.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('exam_generator')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Exam Set</span>
        </button>
      </div>

      {/* Examinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examinations.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {exam.courseCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {exam.term} Exam
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {exam.versions.length} Versions
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {exam.courseName} · A.Y. {exam.academicYear} · {exam.semester}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Questions</span>
                  <strong className="font-mono text-slate-800 font-bold">{exam.questionCount}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Points</span>
                  <strong className="font-mono text-slate-800 font-bold">{exam.totalPoints}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                  <strong className="font-mono text-slate-800 font-bold">{exam.timeLimitMinutes}m</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Generated: {exam.dateCreated}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenExam(exam.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print & View</span>
                </button>

                <button
                  onClick={() => handleDelete(exam.id, exam.title)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete Exam Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {examinations.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No examination packages generated yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Launch the Examination Generator to assemble your first exam set.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
