import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ListFilter, Plus, Trash2, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const TopicManagement: React.FC = () => {
  const { courses, addTopicToCourse, removeTopicFromCourse, questions, updateCourse } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [newTopic, setNewTopic] = useState('');
  const [newCLO, setNewCLO] = useState('');

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !activeCourse) return;
    addTopicToCourse(activeCourse.id, newTopic.trim());
    setNewTopic('');
  };

  const handleAddCLO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCLO.trim() || !activeCourse) return;
    const updatedCLOs = [...activeCourse.learningOutcomes, newCLO.trim()];
    updateCourse(activeCourse.id, { learningOutcomes: updatedCLOs });
    setNewCLO('');
  };

  const handleRemoveCLO = (cloText: string) => {
    if (!activeCourse) return;
    const updatedCLOs = activeCourse.learningOutcomes.filter((c) => c !== cloText);
    updateCourse(activeCourse.id, { learningOutcomes: updatedCLOs });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Topic & Syllabus Syllabus Mapping
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Organize course modules, chapter topics, and Course Learning Outcomes (CLOs) referenced by question authors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Course Selection List */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 max-h-[75vh] overflow-y-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Select Course ({courses.length})
          </span>
          {courses.map((c) => {
            const isSelected = c.id === activeCourse?.id;
            const topicCount = c.topics.length;
            const courseQuestions = questions.filter((q) => q.courseId === c.id).length;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-medium shadow-xs'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                    {c.category}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold truncate">{c.name}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>{topicCount} topics</span>
                  <span>·</span>
                  <span className="font-mono">{courseQuestions} questions</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 2 cols: Topics & CLOs Management */}
        {activeCourse && (
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {activeCourse.code}
                </span>
                <span className="text-xs text-slate-500">{activeCourse.category}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{activeCourse.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{activeCourse.description}</p>
            </div>

            {/* Topics Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Curriculum Topics</h3>
                  <p className="text-[11px] text-slate-500">
                    Topics used by faculty when authoring and categorizing questions.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {activeCourse.topics.length} Topics
                </span>
              </div>

              {/* Add Topic Input */}
              <form onSubmit={handleAddTopic} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new syllabus topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={!newTopic.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </form>

              {/* Topics Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">#</th>
                      <th className="text-left py-2 px-3 font-semibold">Topic Title</th>
                      <th className="text-right py-2 px-3 font-semibold">Associated Questions</th>
                      <th className="text-right py-2 px-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeCourse.topics.map((t, idx) => {
                      const topicQuestions = questions.filter(
                        (q) => q.courseId === activeCourse.id && q.topic === t
                      ).length;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 text-slate-400 font-mono w-10">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{t}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {topicQuestions}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => removeTopicFromCourse(activeCourse.id, t)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* Course Learning Outcomes (CLOs) Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Course Learning Outcomes (CLOs)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Accreditation-aligned learning outcomes mapped to exam questions for outcome-based education (OBE).
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {activeCourse.learningOutcomes.length} Outcomes
                </span>
              </div>

              {/* Add CLO Input */}
              <form onSubmit={handleAddCLO} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CLO-4: Design synchronous finite state machine controllers"
                  value={newCLO}
                  onChange={(e) => setNewCLO(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={!newCLO.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Outcome</span>
                </button>
              </form>

              <div className="space-y-2">
                {activeCourse.learningOutcomes.map((clo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="font-mono text-slate-800">{clo}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCLO(clo)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete outcome"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
