import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionType, Difficulty } from '../../types';
import {
  Search,
  Filter,
  Eye,
  Plus,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  FileQuestion,
  FileText,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

const QUESTION_TYPES: { type: QuestionType | 'All'; label: string }[] = [
  { type: 'All', label: 'All Question Types' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'true_false', label: 'True or False' },
  { type: 'matching', label: 'Matching Type' },
  { type: 'fill_blank', label: 'Fill in the Blanks' },
  { type: 'coding_problem', label: 'Coding Problem' },
  { type: 'code_output', label: 'Code Output' },
  { type: 'debugging', label: 'Debugging' },
  { type: 'problem_solving', label: 'Problem Solving' },
  { type: 'algorithm_tracing', label: 'Algorithm Tracing' },
  { type: 'pseudocode', label: 'Pseudocode' },
  { type: 'flowchart', label: 'Flowchart' },
];

export const QuestionBankView: React.FC = () => {
  const {
    questions,
    courses,
    currentUser,
    setViewingQuestionId,
    setCurrentView,
    duplicateQuestion,
    createQuestion,
    systemSettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('ApprovedOnly'); // default shows approved
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'difficulty'>('date');

  // Filter questions
  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.learningOutcome.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === 'All' || q.courseCode === selectedCourse;
    const matchesType = selectedType === 'All' || q.type === selectedType;
    const matchesDifficulty =
      selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'ApprovedOnly'
        ? q.status === 'Approved' || q.status === 'Published'
        : q.status === statusFilter;

    return matchesSearch && matchesCourse && matchesType && matchesDifficulty && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'difficulty') {
      const order = { Hard: 3, Medium: 2, Easy: 1 };
      return order[b.difficulty] - order[a.difficulty];
    }
    return (b.dateModified || b.dateCreated).localeCompare(a.dateModified || a.dateCreated);
  });

  const handleDuplicate = async (id: string) => {
    const cloned = await duplicateQuestion(id);
    setCurrentView('create_question', { editingQuestionId: cloned.id });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(sorted, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bscpe_question_bank_export_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const headers = [
      'Question ID',
      'Course',
      'Topic',
      'Type',
      'Difficulty',
      'Points',
      'Question',
      'Answer',
      'Author',
      'Status',
    ];
    const rows = sorted.map((q) => [
      `"${q.id}"`,
      `"${q.courseCode}"`,
      `"${q.topic}"`,
      `"${q.type}"`,
      `"${q.difficulty}"`,
      `"${q.points}"`,
      `"${q.question.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(q.correctAnswer || '').toString().replace(/"/g, '""')}"`,
      `"${q.authorName}"`,
      `"${q.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bscpe_questions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          let count = 0;
          imported.forEach((item) => {
            if (item.question && item.type) {
              createQuestion({
                ...item,
                status: 'Draft',
                authorId: currentUser.id,
                authorName: currentUser.name,
              });
              count++;
            }
          });
          alert(`Successfully imported ${count} questions into your draft repository!`);
        } else {
          alert('Invalid JSON file format. Expected an array of questions.');
        }
      } catch (err) {
        alert('Failed to parse question JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Centralized BSCpE Examination Question Bank
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, inspect, and reuse certified examination questions across Computer Engineering curricula.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(currentUser.role === 'examiner' || currentUser.role === 'admin' || currentUser.role === 'faculty') && (
            <button
              onClick={() => setCurrentView('exam_generator')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Launch Exam Generator</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Export filtered questions as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions by keyword, topic, question ID, CLO, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-mono"
            >
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Question Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.type} value={qt.type}>
                  {qt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Pool</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="ApprovedOnly">Approved & Published Only</option>
              <option value="All">All Question Statuses</option>
              <option value="Draft">Drafts Only</option>
              <option value="Submitted">Under Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="date">Most Recent</option>
              <option value="points">Highest Points</option>
              <option value="difficulty">Difficulty (Hard → Easy)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200 bg-slate-50 text-xs">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-slate-900 font-mono">{sorted.length}</strong> questions in Question Bank
          </span>

          <span className="text-[11px] text-slate-500 font-mono">
            {sorted.reduce((acc, q) => acc + q.points, 0)} total cumulative points
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Question ID & Course</th>
                <th className="py-3 px-4">Question Statement</th>
                <th className="py-3 px-4">Type & Difficulty</th>
                <th className="py-3 px-4">CLO & Author</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900">{q.id}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                        {q.courseCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{q.topic}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.points} {q.points === 1 ? 'pt' : 'pts'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-md">
                    <p
                      onClick={() => setViewingQuestionId(q.id)}
                      className="font-medium text-slate-800 line-clamp-2 hover:text-indigo-600 cursor-pointer leading-relaxed"
                    >
                      {q.question}
                    </p>
                    {q.correctAnswer && (
                      <span className="text-[11px] text-emerald-800 truncate block mt-1 font-mono font-medium">
                        Key: {String(q.correctAnswer).substring(0, 70)}
                        {String(q.correctAnswer).length > 70 ? '...' : ''}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="capitalize text-slate-700 block font-medium">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold mt-1 inline-block ${
                        q.difficulty === 'Easy'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : q.difficulty === 'Medium'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-purple-700 bg-purple-50 border-purple-200'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-[10px] text-slate-600 block truncate max-w-[160px]">
                      {q.learningOutcome}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{q.authorName}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingQuestionId(q.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        title="View Full Details"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleDuplicate(q.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Clone to Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No questions match the current filter matrix</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try widening your search or reset filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
