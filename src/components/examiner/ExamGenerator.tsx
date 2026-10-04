import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { difficultyBadgeClass } from '../../lib/navigation';
import {
  Question,
  Examination,
  ExamVersion,
  ExamVersionQuestion,
  Difficulty,
  QuestionType,
} from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Shuffle,
  Layers,
  Printer,
  Download,
  Search,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export const ExamGenerator: React.FC = () => {
  const {
    courses,
    questions,
    currentUser,
    systemSettings,
    createExamination,
    isFirebaseConnected,
    setCurrentView,
  } = useApp();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Wizard Step: 1 = Exam Setup, 2 = Question Selection, 3 = Randomization & Versions, 4 = Review & Save
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Exam Basic Info — courses may still be loading from Firestore, so
  // `activeCourse` can momentarily be undefined. Every access below guards it.
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Once courses arrive from Firestore, default the selection so the form is usable.
  React.useEffect(() => {
    if (!selectedCourseId && courses[0]) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const [examTitle, setExamTitle] = useState<string>(
    `${activeCourse?.code ?? 'CPE'}: ${activeCourse?.name ?? 'Course'} Midterm Examination`
  );
  const [term, setTerm] = useState<'Prelim' | 'Midterm' | 'Semi-Final' | 'Final'>('Midterm');
  const [academicYear, setAcademicYear] = useState<string>(systemSettings.academicYear);
  const [semester, setSemester] = useState<string>(systemSettings.currentSemester);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(systemSettings.defaultTimeLimitMinutes);
  const [instructions, setInstructions] = useState<string>(
    'Read each question carefully. Write your final answers clearly on the official answer sheet. Electronic calculators are permitted for design arithmetic. Cheating and unauthorized collaboration will result in an automatic mark of 0.0.'
  );

  // Question Selection Mode: 'manual' or 'rule_based'
  const [selectionMode, setSelectionMode] = useState<'manual' | 'rule_based'>('manual');

  // Manual Selection
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  // Rule-based generator parameters
  const [targetCount, setTargetCount] = useState<number>(10);
  const [easyPercent, setEasyPercent] = useState<number>(30);
  const [mediumPercent, setMediumPercent] = useState<number>(50);
  const [hardPercent, setHardPercent] = useState<number>(20);

  // Randomization & Multi-version settings
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(true);
  const [randomizeChoices, setRandomizeChoices] = useState<boolean>(true);
  const [versionCount, setVersionCount] = useState<number>(2); // 2 sets: Set A and Set B
  const [showPoints, setShowPoints] = useState<boolean>(true);

  // Filter approved questions for the selected course
  const approvedPool = activeCourse
    ? questions.filter(
        (q) =>
          (q.status === 'Approved' || q.status === 'Published') &&
          q.courseId === activeCourse.id
      )
    : [];

  // If there are no approved questions for this course, allow selecting from all approved questions
  const availableQuestions = approvedPool.length > 0
    ? approvedPool
    : questions.filter((q) => q.status === 'Approved' || q.status === 'Published');

  const filteredPool = availableQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(filterSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(filterSearch.toLowerCase()) ||
      q.id.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesType = filterType === 'All' || q.type === filterType;
    const matchesDiff = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDiff;
  });

  // Toggle selection
  const handleToggleQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  // Rule-based auto generator logic
  const handleRunAutoGenerator = () => {
    const easyPool = availableQuestions.filter((q) => q.difficulty === 'Easy');
    const medPool = availableQuestions.filter((q) => q.difficulty === 'Medium');
    const hardPool = availableQuestions.filter((q) => q.difficulty === 'Hard');

    const numEasy = Math.round((targetCount * easyPercent) / 100);
    const numMed = Math.round((targetCount * mediumPercent) / 100);
    const numHard = Math.max(0, targetCount - numEasy - numMed);

    // Shuffle helper
    const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const pickedEasy = shuffleArray(easyPool).slice(0, numEasy);
    const pickedMed = shuffleArray(medPool).slice(0, numMed);
    const pickedHard = shuffleArray(hardPool).slice(0, numHard);

    const combined = [...pickedEasy, ...pickedMed, ...pickedHard];

    // If available questions in specific brackets are fewer, backfill from remaining
    if (combined.length < targetCount) {
      const existingIds = new Set(combined.map((q) => q.id));
      const remaining = availableQuestions.filter((q) => !existingIds.has(q.id));
      combined.push(...shuffleArray(remaining).slice(0, targetCount - combined.length));
    }

    setSelectedQuestionIds(combined.map((q) => q.id));
  };

  // Generate multi-version exam package
  const handleGenerateExam = async () => {
    if (!activeCourse) {
      alert('No course data is available yet. Please wait for courses to load or add a course first.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least one question for the examination.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    const selectedQuestions = questions.filter((q) => selectedQuestionIds.includes(q.id));
    const totalPoints = selectedQuestions.reduce((acc, q) => acc + q.points, 0);

    const versions: ExamVersion[] = [];
    const versionLetters = ['Set A', 'Set B', 'Set C', 'Set D'];

    for (let vIdx = 0; vIdx < versionCount; vIdx++) {
      const letter = versionLetters[vIdx] || `Set ${vIdx + 1}`;

      // Clone questions
      let versionQuestions = [...selectedQuestions];

      // Shuffle question order if enabled (Set A can keep order or shuffle; Set B+ definitely shuffles)
      if (randomizeQuestions && (vIdx > 0 || versionCount > 1)) {
        versionQuestions = [...versionQuestions].sort(() => Math.random() - 0.5);
      }

      const formattedQuestions: ExamVersionQuestion[] = versionQuestions.map((q, qNum) => {
        let choices = q.choices ? [...q.choices] : undefined;
        if (randomizeChoices && choices && choices.length > 0) {
          choices = [...choices].sort(() => Math.random() - 0.5);
        }

        let matchingListB = q.matchingPairs
          ? q.matchingPairs.map((p) => ({ id: p.id, text: p.itemB }))
          : undefined;
        if (randomizeChoices && matchingListB) {
          matchingListB = [...matchingListB].sort(() => Math.random() - 0.5);
        }

        const matchingListA = q.matchingPairs
          ? q.matchingPairs.map((p) => ({ id: p.id, text: p.itemA }))
          : undefined;

        return {
          originalQuestionId: q.id,
          questionNumber: qNum + 1,
          questionText: q.question,
          type: q.type,
          points: q.points,
          difficulty: q.difficulty,
          topic: q.topic,
          choices,
          matchingListA,
          matchingListB,
          codeSnippet: q.codeSnippet,
          programmingLanguage: q.programmingLanguage,
          sampleInput: q.sampleInput,
          sampleOutput: q.sampleOutput,
          constraints: q.constraints,
          flowchartContent: q.flowchartContent,
          subQuestions: q.subQuestions,
          correctAnswerDisplay: (q.correctAnswer || '').toString(),
          explanation: q.explanation,
          testCases: q.testCases,
        };
      });

      versions.push({
        versionLabel: letter,
        questions: formattedQuestions,
        totalPoints,
      });
    }

    const examId = `EXAM-${activeCourse.code.replace(/[^A-Za-z0-9]/g, '')}-${term.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newExam: Examination = {
      id: examId,
      title: examTitle,
      courseId: activeCourse.id,
      courseCode: activeCourse.code,
      courseName: activeCourse.name,
      term,
      academicYear,
      semester,
      instructions,
      timeLimitMinutes,
      totalPoints,
      questionCount: selectedQuestionIds.length,
      selectedQuestionIds,
      versions,
      dateCreated: new Date().toISOString().substring(0, 10),
      authorId: currentUser.id,
      authorName: currentUser.name,
      settings: {
        randomizeQuestions,
        randomizeChoices,
        headerInstitution: systemSettings.institutionName,
        departmentName: systemSettings.departmentName,
        examCode: examId,
        showPointsPerQuestion: showPoints,
      },
    };

    try {
      // Await the Firestore write so the package is really in the shared
      // `examinations` collection before navigating — every other signed-in
      // user then receives it instantly through the onSnapshot listener.
      await createExamination(newExam);
      setCurrentView('exam_view', { viewingExamId: examId });
    } catch (err) {
      console.error('Failed to save examination set:', err);
      setSaveError(
        'Could not save the examination set to the shared database. ' +
          'Your exam is still shown locally — please check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedQuestionsObjects = questions.filter((q) => selectedQuestionIds.includes(q.id));
  const currentTotalPoints = selectedQuestionsObjects.reduce((acc, q) => acc + q.points, 0);

  const versionRangeText =
    versionCount === 1
      ? 'Set A'
      : versionCount === 2
      ? 'Set A through Set B'
      : versionCount === 3
      ? 'Set A through Set C'
      : 'Set A through Set D';

  // While Firestore is loading (or the DB is empty), show a friendly
  // placeholder instead of crashing on `activeCourse.code`.
  if (!activeCourse || courses.length === 0) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="bg-white rounded-xl border border-line p-12 shadow-xs text-center">
          <FileText className="w-10 h-10 text-ink-muted mx-auto mb-3" />
          <h2 className="text-sm font-bold text-ink">Loading examination workspace…</h2>
          <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto leading-relaxed">
            Waiting for course data from the shared database. If this persists, check your
            connection or add a course under Course Management first.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-ink-secondary bg-white border border-line-strong rounded-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">
              Examination Generation Suite
            </h1>
            <p className="text-xs text-ink-muted">
              Select accredited questions, calibrate difficulty, shuffle choices, and generate randomized exam versions.
            </p>
          </div>
        </div>

        {/* Wizard Steps indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div
            className={`px-3 py-1 rounded-full font-semibold ${
              currentStep === 1
                ? 'bg-primary-600 text-white'
                : 'bg-surface-secondary text-ink-secondary'
            }`}
          >
            1. Details
          </div>
          <div
            className={`px-3 py-1 rounded-full font-semibold ${
              currentStep === 2
                ? 'bg-primary-600 text-white'
                : 'bg-surface-secondary text-ink-secondary'
            }`}
          >
            2. Questions ({selectedQuestionIds.length})
          </div>
          <div
            className={`px-3 py-1 rounded-full font-semibold ${
              currentStep === 3
                ? 'bg-primary-600 text-white'
                : 'bg-surface-secondary text-ink-secondary'
            }`}
          >
            3. Versions & Output
          </div>
        </div>
      </div>

      {/* STEP 1: EXAM DETAILS */}
      {currentStep === 1 && (
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider text-ink-muted">
            Step 1: Examination Header & Academic Context
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Course Selection *
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  const c = courses.find((c) => c.id === e.target.value);
                  if (c) {
                    setExamTitle(`${c.code}: ${c.name} ${term} Examination`);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-line font-mono"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Grading Term *
              </label>
              <select
                value={term}
                onChange={(e) => {
                  const newTerm = e.target.value as any;
                  setTerm(newTerm);
                  if (activeCourse) {
                    setExamTitle(`${activeCourse.code}: ${activeCourse.name} ${newTerm} Examination`);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-line"
              >
                <option value="Prelim">Prelim Examination</option>
                <option value="Midterm">Midterm Examination</option>
                <option value="Semi-Final">Semi-Final Examination</option>
                <option value="Final">Final Examination</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              Examination Paper Title *
            </label>
            <input
              type="text"
              required
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-line font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-line font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Semester
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-line"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="300"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 90)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-line font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary mb-1">
              General Examination Instructions (Printed on Top of Student Paper)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-line leading-relaxed font-sans"
            />
          </div>

          <div className="pt-4 border-t border-surface-secondary flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
            >
              Continue to Question Selection →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: QUESTION SELECTION */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Top selection mode switcher & stats */}
          <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-surface-secondary rounded-lg">
              <button
                type="button"
                onClick={() => setSelectionMode('manual')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectionMode === 'manual'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Manual Selection ({selectedQuestionIds.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('rule_based')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  selectionMode === 'rule_based'
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Rule-Based Auto Picker</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="text-right">
                <span className="font-bold text-ink font-mono text-sm">
                  {selectedQuestionIds.length}
                </span>{' '}
                <span className="text-ink-muted">questions selected</span>
                <span className="text-line-strong mx-2">|</span>
                <span className="font-bold text-primary-700 font-mono text-sm">
                  {currentTotalPoints}
                </span>{' '}
                <span className="text-ink-muted">total points</span>
              </div>
            </div>
          </div>

          {/* Rule-Based Generator Panel */}
          {selectionMode === 'rule_based' && (
            <div className="bg-white p-5 rounded-xl border border-primary-200 bg-primary-50/20 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-primary-900 uppercase tracking-wider">
                    Automated Table of Specifications (TOS) Calibrator
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Specify question volume and difficulty bracket distribution.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunAutoGenerator}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Run Auto-Picker</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-ink-secondary font-semibold mb-1">
                    Target Question Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={targetCount}
                    onChange={(e) => setTargetCount(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-1.5 rounded-lg border border-line bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-success-fg font-semibold mb-1">
                    Easy Bracket (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={easyPercent}
                    onChange={(e) => setEasyPercent(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-1.5 rounded-lg border border-success-border bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-info-fg font-semibold mb-1">
                    Medium Bracket (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mediumPercent}
                    onChange={(e) => setMediumPercent(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-1.5 rounded-lg border border-info-border bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-archived-fg font-semibold mb-1">
                    Hard Bracket (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hardPercent}
                    onChange={(e) => setHardPercent(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-1.5 rounded-lg border border-archived-border bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search approved questions..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 bg-background/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-line bg-white"
              >
                <option value="All">All Question Formats</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True or False</option>
                <option value="matching">Matching Type</option>
                <option value="fill_blank">Fill in Blanks</option>
                <option value="coding_problem">Coding Problem</option>
                <option value="code_output">Code Output</option>
                <option value="debugging">Debugging</option>
                <option value="problem_solving">Problem Solving</option>
                <option value="algorithm_tracing">Algorithm Tracing</option>
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-line bg-white"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions Pool Table */}
          <div className="card overflow-hidden">
            <div className="p-3 border-b border-line bg-background flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-secondary">
                Available Approved Questions Pool ({filteredPool.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedQuestionIds.length === filteredPool.length) {
                    setSelectedQuestionIds([]);
                  } else {
                    setSelectedQuestionIds(filteredPool.map((q) => q.id));
                  }
                }}
                className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
              >
                {selectedQuestionIds.length === filteredPool.length
                  ? 'Deselect All'
                  : 'Select All Available'}
              </button>
            </div>

            <div className="divide-y divide-line max-h-[500px] overflow-y-auto">
              {filteredPool.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-xs ${
                      isSelected ? 'bg-primary-50/50' : 'hover:bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by row click
                      className="mt-1 rounded text-primary-600 focus:ring-primary-500"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-ink">{q.id}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-primary-50 text-primary-700 border border-primary-100 font-semibold">
                          {q.courseCode}
                        </span>
                        <span className="text-ink-muted">·</span>
                        <span className="text-ink-secondary font-medium">{q.topic}</span>
                        <span className="text-ink-muted">·</span>
                        <span className="capitalize text-ink-muted">{q.type.replace('_', ' ')}</span>
                      </div>
                      <p className="font-medium text-ink line-clamp-2 leading-relaxed">
                        {q.question}
                      </p>
                      <span className="text-[10px] text-ink-muted font-mono mt-0.5 block">
                        CLO: {q.learningOutcome}
                      </span>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className={difficultyBadgeClass(q.difficulty)}>
                        {q.difficulty}
                      </span>
                      <span className="font-mono font-bold text-ink text-xs">
                        {q.points} {q.points === 1 ? 'pt' : 'pts'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredPool.length === 0 && (
                <div className="p-8 text-center text-ink-muted text-xs">
                  No approved questions found for this filter.
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-white border border-line-strong rounded-lg"
            >
              ← Back to Details
            </button>
            <button
              onClick={() => {
                if (selectedQuestionIds.length === 0) {
                  alert('Please select at least 1 question for the examination.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs"
            >
              Configure Randomization & Sets →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RANDOMIZATION & SET GENERATION */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider text-ink-muted">
              Step 3: Anti-Cheating Randomization & Multi-Version Sets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-line bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Randomize Question Ordering
                  </span>
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  Each examination version (Set A, Set B) will scramble question positions so neighboring students cannot copy.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-line bg-background/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">
                    Randomize Multiple Choice Options
                  </span>
                  <input
                    type="checkbox"
                    checked={randomizeChoices}
                    onChange={(e) => setRandomizeChoices(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  Scramble choices (A, B, C, D) within each multiple choice and matching question, automatically recalculating the key.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Number of Distinct Exam Sets to Generate
                </label>
                <select
                  value={versionCount}
                  onChange={(e) => setVersionCount(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-line font-mono"
                >
                  <option value="1">1 Version (Master Set A Only)</option>
                  <option value="2">2 Versions (Set A & Set B)</option>
                  <option value="3">3 Versions (Set A, Set B & Set C)</option>
                  <option value="4">4 Versions (Set A, Set B, Set C & Set D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Point Values Visibility
                </label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="showPointsCheckbox"
                    checked={showPoints}
                    onChange={(e) => setShowPoints(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="showPointsCheckbox" className="text-xs text-ink-secondary">
                    Display points per question on student test paper
                  </label>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-success-soft/70 border border-success-border rounded-xl text-xs space-y-2">
              <h4 className="font-bold text-success-fg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Ready to Generate Examination Set</span>
              </h4>
              <p className="text-success-fg leading-relaxed">
                Will compile <strong>{selectedQuestionIds.length} questions</strong> into{' '}
                <strong>{versionCount} sets</strong> ({versionRangeText}) with total point capacity of{' '}
                <strong>{currentTotalPoints} points</strong>. Complete matching answer keys and rubric will be generated.
              </p>
              <p className="text-success-fg leading-relaxed">
                Saving stores the package in the shared cloud database &mdash; every other signed-in user sees it in real time.
                {!isFirebaseConnected && (
                  <span className="font-semibold text-warning-fg"> You appear to be offline; the exam will sync automatically when you reconnect.</span>
                )}
              </p>
              {saveError ? (
                <p className="text-danger-fg bg-danger-soft border border-danger-border rounded-lg px-2.5 py-1.5 leading-relaxed">
                  {saveError}
                </p>
              ) : null}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-surface-secondary">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-ink-secondary bg-white border border-line-strong rounded-lg"
              >
                ← Back to Questions
              </button>
              <button
                onClick={handleGenerateExam}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-wait rounded-lg transition-all shadow-xs"
              >
                <Layers className="w-4 h-4" />
                <span>{isSaving ? 'Saving to Shared Database…' : 'Compile & Generate Examination Sets'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
