import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderTree,
  FileQuestion,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { courses, questions, users, auditLogs, examinations, setCurrentView, systemSettings } = useApp();

  const totalQuestions = questions.length;
  const approvedQuestions = questions.filter(
    (q) => q.status === 'Approved' || q.status === 'Published'
  ).length;
  const pendingReviewQuestions = questions.filter(
    (q) => q.status === 'Submitted' || q.status === 'Under Review'
  ).length;
  const draftQuestions = questions.filter((q) => q.status === 'Draft').length;

  // Group questions by course category
  const categoryCounts: Record<string, number> = {};
  courses.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0);
  });
  questions.forEach((q) => {
    const course = courses.find((c) => c.id === q.courseId);
    if (course) {
      categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
    }
  });

  // Group questions by question type
  const typeCounts: Record<string, number> = {};
  questions.forEach((q) => {
    typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Administrator System Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global repository oversight, course curricula management, and faculty access governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('courses')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Manage Courses
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Manage Users & Roles
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Questions</span>
            <FileQuestion className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalQuestions}
            </span>
            <span className="text-xs text-emerald-600 font-medium font-mono">
              {approvedQuestions} Approved
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${totalQuestions > 0 ? (approvedQuestions / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">BSCpE Courses</span>
            <FolderTree className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {courses.length}
            </span>
            <span className="text-xs text-slate-500">
              Across 4 Categories
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 truncate">
            {courses.reduce((acc, c) => acc + c.topics.length, 0)} total curriculum topics
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {pendingReviewQuestions}
            </span>
            <button
              onClick={() => setCurrentView('review_queue')}
              className="text-xs text-amber-700 hover:underline font-medium"
            >
              Open Queue →
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {draftQuestions} currently drafted by authors
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Examinations</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {examinations.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              A.Y. {systemSettings.academicYear}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 truncate">
            Multiple randomized sets generated
          </p>
        </div>
      </div>

      {/* Two Column Layout: Question Distribution & Recent System Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution by Domain & Types */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Curriculum Domain Distribution
              </h3>
              <button
                onClick={() => setCurrentView('courses')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Courses
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="text-slate-500 font-mono tabular-nums">
                        {count} questions ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Types Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Supported Question Types Breakdown
              </h3>
              <span className="text-xs text-slate-500">11 Evaluated Types</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div
                  key={type}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-slate-700 capitalize truncate mr-2">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Audit Activities & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Quick Admin Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Administrative Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('courses')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">Add or Edit Course</p>
                  <p className="text-[11px] text-slate-500">Update codes, units, or descriptions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentView('topics')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">Topic & CLO Syllabus</p>
                  <p className="text-[11px] text-slate-500">Manage course learning outcomes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">Backup & Restore DB</p>
                  <p className="text-[11px] text-slate-500">Export JSON or reset initial data</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent Audit Logs Stream */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Audit Logs</h3>
              <button
                onClick={() => setCurrentView('audit_logs')}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-800 truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {log.timestamp.split(' ')[1] || log.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    By {log.userName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
