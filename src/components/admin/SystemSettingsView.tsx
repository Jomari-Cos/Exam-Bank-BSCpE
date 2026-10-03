import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, Download, Upload, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    exportDatabaseJson,
    importDatabaseJson,
    resetDatabaseToDefaults,
  } = useApp();

  const [formData, setFormData] = useState({ ...systemSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `bscpe_data_bank_backup_${new Date().toISOString().substring(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importDatabaseJson(content);
      if (success) {
        setImportStatus('Database successfully restored from JSON package!');
      } else {
        setImportStatus('Error: Invalid JSON backup file format.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'WARNING: This will reset all questions, courses, users, and examinations back to default factory seed state. Do you want to proceed?'
      )
    ) {
      resetDatabaseToDefaults();
      setImportStatus('System reset to initial BSCpE default state.');
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Configuration & Data Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure academic terms, exam header templates, quality assurance policies, and full database backups.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration successfully updated.</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic Terms */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Academic Calendar & Terms
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                placeholder="2025-2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Semester
              </label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="Midyear / Summer">Midyear / Summer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Institution & Examination Templates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Institutional Exam Header Templates
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name (Appears on Printed Exam Papers)
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                value={formData.departmentName}
                onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Examination Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={formData.defaultTimeLimitMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultTimeLimitMinutes: parseInt(e.target.value) || 90,
                  })
                }
                className="w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quality Assurance Policy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Question Bank Quality & Security Rules
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="requireReviewCheckbox"
                checked={formData.requireReviewBeforeExam}
                onChange={(e) =>
                  setFormData({ ...formData, requireReviewBeforeExam: e.target.checked })
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="requireReviewCheckbox" className="text-xs font-semibold text-slate-800 block">
                  Enforce Committee Review Before Exam Generation
                </label>
                <p className="text-[11px] text-slate-500">
                  When enabled, only questions marked as <strong>Approved</strong> or <strong>Published</strong> can be selected by examiners for exams. Draft and Submitted questions remain blocked.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>

      {/* Backup, Restore, and Reset */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Data Preservation & Backups
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Export Full Backup</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Download all questions, courses, audit logs, and exams as an offline JSON package.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Restore from JSON</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload a previous BSCpE Data Bank JSON archive to restore state.
              </p>
            </div>
            <label className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/30 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Reset to Defaults</h4>
              <p className="text-[11px] text-rose-700 mt-1">
                Re-seed all 20+ realistic questions, courses, and accounts to default state.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset All Tables</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
