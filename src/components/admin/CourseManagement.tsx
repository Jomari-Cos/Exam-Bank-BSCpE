import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Course, CourseCategory } from '../../types';
import { Plus, Edit2, Trash2, Search, Filter, BookOpen, Layers, X, Check } from 'lucide-react';

const CATEGORIES: CourseCategory[] = [
  'Programming',
  'Computer Engineering',
  'Computing',
  'Advanced Courses',
  'Custom',
];

export const CourseManagement: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, questions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Computer Engineering' as CourseCategory,
    description: '',
    credits: 3,
    yearLevel: 2,
    topics: [] as string[],
    learningOutcomes: [] as string[],
  });
  const [newTopicInput, setNewTopicInput] = useState('');
  const [newCLOInput, setNewCLOInput] = useState('');

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      category: 'Computer Engineering',
      description: '',
      credits: 3,
      yearLevel: 2,
      topics: ['Introduction to Course', 'Fundamental Principles'],
      learningOutcomes: ['CLO-1: Understand fundamental concepts'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      category: course.category,
      description: course.description,
      credits: course.credits,
      yearLevel: course.yearLevel,
      topics: [...course.topics],
      learningOutcomes: [...course.learningOutcomes],
    });
    setIsModalOpen(true);
  };

  const handleAddTopic = () => {
    if (newTopicInput.trim() && !formData.topics.includes(newTopicInput.trim())) {
      setFormData({
        ...formData,
        topics: [...formData.topics, newTopicInput.trim()],
      });
      setNewTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((t) => t !== topicToRemove),
    });
  };

  const handleAddCLO = () => {
    if (newCLOInput.trim() && !formData.learningOutcomes.includes(newCLOInput.trim())) {
      setFormData({
        ...formData,
        learningOutcomes: [...formData.learningOutcomes, newCLOInput.trim()],
      });
      setNewCLOInput('');
    }
  };

  const handleRemoveCLO = (cloToRemove: string) => {
    setFormData({
      ...formData,
      learningOutcomes: formData.learningOutcomes.filter((c) => c !== cloToRemove),
    });
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (courseId: string, courseCode: string) => {
    const questionCount = questions.filter((q) => q.courseId === courseId).length;
    if (questionCount > 0) {
      if (
        !window.confirm(
          `Course ${courseCode} currently has ${questionCount} associated questions in the bank. Are you sure you want to remove it?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete course ${courseCode}?`)) {
        return;
      }
    }
    deleteCourse(courseId);
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">
            Curriculum Course Management
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Add, update, or remove BSCpE courses and topic syllabi dynamically without touching source code.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-line shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, title, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-ink-muted font-medium shrink-0">Category:</span>
          <div className="flex items-center gap-1 p-0.5 bg-surface-secondary rounded-lg shrink-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              All ({courses.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-ink shadow-xs'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const courseQuestions = questions.filter((q) => q.courseId === course.id);
          const approvedCount = courseQuestions.filter(
            (q) => q.status === 'Approved' || q.status === 'Published'
          ).length;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-line p-5 shadow-xs flex flex-col justify-between hover:border-line-strong transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                      {course.code}
                    </span>
                    <span className="text-[11px] text-ink-muted font-medium">
                      Year {course.yearLevel} · {course.credits} Units
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-ink-muted bg-surface-secondary px-2 py-0.5 rounded">
                    {course.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-ink leading-snug">
                  {course.name}
                </h3>
                <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Topics Preview */}
                <div className="mt-3 pt-3 border-t border-surface-secondary">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1.5">
                    <span>Curriculum Topics</span>
                    <span className="font-mono text-ink-secondary">{course.topics.length} topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {course.topics.slice(0, 4).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-ink-secondary bg-background border border-line/60 rounded px-1.5 py-0.5 truncate max-w-[200px]"
                      >
                        {topic}
                      </span>
                    ))}
                    {course.topics.length > 4 && (
                      <span className="text-[11px] text-ink-muted font-mono px-1 py-0.5">
                        +{course.topics.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Stats */}
              <div className="mt-4 pt-3 border-t border-surface-secondary flex items-center justify-between">
                <div className="text-xs text-ink-muted font-mono">
                  <span className="font-bold text-ink">{courseQuestions.length}</span> questions{' '}
                  <span className="text-success">({approvedCount} approved)</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-ink-muted hover:text-primary-600 hover:bg-surface-secondary rounded-lg transition-colors"
                    title="Edit course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.code)}
                    className="p-1.5 text-ink-muted hover:text-danger hover:bg-surface-secondary rounded-lg transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-line">
          <BookOpen className="w-8 h-8 text-line-strong mx-auto mb-2" />
          <p className="text-xs font-semibold text-ink-secondary">No courses match your search criteria</p>
          <p className="text-[11px] text-ink-muted mt-0.5">Try clearing filters or add a new course.</p>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-line w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-line bg-background">
              <h2 className="text-sm font-bold text-ink min-w-0 truncate">
                {editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add New BSCpE Course'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CPE-312"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CourseCategory })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Architecture and Organization"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Credit Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Year Level (1-4)
                  </label>
                  <select
                    value={formData.yearLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, yearLevel: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Course Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of course syllabus and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                />
              </div>

              {/* Topics Management */}
              <div className="pt-2 border-t border-surface-secondary">
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Syllabus Topics ({formData.topics.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Enter topic name..."
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-3 py-1.5 text-xs font-semibold text-ink-secondary bg-surface-secondary hover:bg-line rounded-lg transition-colors"
                  >
                    Add Topic
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-background rounded-lg border border-line">
                  {formData.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs bg-white text-ink border border-line rounded-md px-2 py-0.5"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="text-ink-muted hover:text-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.topics.length === 0 && (
                    <span className="text-[11px] text-ink-muted italic">No topics added yet</span>
                  )}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="pt-2 border-t border-surface-secondary">
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Course Learning Outcomes (CLOs) ({formData.learningOutcomes.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. CLO-1: Analyze synchronous sequential circuits"
                    value={newCLOInput}
                    onChange={(e) => setNewCLOInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCLO();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCLO}
                    className="px-3 py-1.5 text-xs font-semibold text-ink-secondary bg-surface-secondary hover:bg-line rounded-lg transition-colors"
                  >
                    Add CLO
                  </button>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto p-2 bg-background rounded-lg border border-line">
                  {formData.learningOutcomes.map((clo, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-white text-ink border border-line rounded-md px-2.5 py-1"
                    >
                      <span className="font-mono text-[11px]">{clo}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCLO(clo)}
                        className="text-ink-muted hover:text-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form buttons (kept visible while the form scrolls) */}
              <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-white border-t border-line flex flex-wrap items-center justify-end gap-2 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingCourse ? 'Save Course Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
