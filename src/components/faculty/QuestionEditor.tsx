import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Question,
  QuestionType,
  Difficulty,
  TestCase,
  MatchingPair,
  SubQuestion,
} from '../../types';
import {
  Save,
  Send,
  ArrowLeft,
  Plus,
  Trash2,
  FileCode2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';

const QUESTION_TYPES: { type: QuestionType; label: string; description: string }[] = [
  { type: 'multiple_choice', label: 'Multiple Choice', description: 'Single or multiple options with randomizable distractors' },
  { type: 'true_false', label: 'True or False', description: 'Binary conceptual verification statement' },
  { type: 'matching', label: 'Matching Type', description: 'List A terms paired against List B descriptions' },
  { type: 'fill_blank', label: 'Fill in the Blanks', description: 'Text statement with bracketed blank tokens' },
  { type: 'coding_problem', label: 'Coding Problem', description: 'Algorithmic or embedded challenge with multi-test suites' },
  { type: 'code_output', label: 'Code Output', description: 'Execution tracing predicting stdout output' },
  { type: 'debugging', label: 'Debugging', description: 'Identify flaw, bug cause, and provided correction' },
  { type: 'problem_solving', label: 'Problem Solving', description: 'Technical calculation or circuit derivation' },
  { type: 'algorithm_tracing', label: 'Algorithm Tracing', description: 'Step-by-step state tracking of graph or datapath' },
  { type: 'pseudocode', label: 'Pseudocode', description: 'Algorithmic logic comprehension questions' },
  { type: 'flowchart', label: 'Flowchart', description: 'Logic decision tree or state machine diagram' },
];

const PROGRAMMING_LANGUAGES = ['C', 'C++', 'Python', 'Java', 'Verilog/VHDL', 'x86 Assembly'];

export const QuestionEditor: React.FC = () => {
  const {
    courses,
    createQuestion,
    updateQuestion,
    editingQuestionId,
    setCurrentView,
    questions,
    currentUser,
    systemSettings,
  } = useApp();

  const existingQuestion = editingQuestionId
    ? questions.find((q) => q.id === editingQuestionId)
    : null;

  // Selected course and topics
  const defaultCourse = courses[0];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    existingQuestion?.courseId || defaultCourse?.id || ''
  );
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || defaultCourse;

  // General fields
  const [topic, setTopic] = useState<string>(
    existingQuestion?.topic || activeCourse?.topics[0] || 'General'
  );
  const [type, setType] = useState<QuestionType>(
    existingQuestion?.type || 'multiple_choice'
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    existingQuestion?.difficulty || 'Medium'
  );
  const [learningOutcome, setLearningOutcome] = useState<string>(
    existingQuestion?.learningOutcome || activeCourse?.learningOutcomes[0] || 'CLO-1: Core Concept Analysis'
  );
  const [points, setPoints] = useState<number>(existingQuestion?.points || 2);
  const [questionText, setQuestionText] = useState<string>(
    existingQuestion?.question || ''
  );
  const [explanation, setExplanation] = useState<string>(
    existingQuestion?.explanation || ''
  );

  // Multiple Choice state
  const [choices, setChoices] = useState<string[]>(
    existingQuestion?.choices || ['Choice A', 'Choice B', 'Choice C', 'Choice D']
  );
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    existingQuestion?.correctAnswer || existingQuestion?.choices?.[0] || 'Choice A'
  );
  const [randomizeChoices, setRandomizeChoices] = useState<boolean>(
    existingQuestion?.randomizeChoices ?? true
  );

  // True/False state
  const [tfAnswer, setTfAnswer] = useState<boolean>(
    existingQuestion?.trueFalseAnswer ?? true
  );

  // Matching state
  const [matchingInstructions, setMatchingInstructions] = useState<string>(
    existingQuestion?.matchingInstructions || 'Match each term in List A with its correct description in List B.'
  );
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    existingQuestion?.matchingPairs || [
      { id: '1', itemA: 'Term 1', itemB: 'Definition 1' },
      { id: '2', itemA: 'Term 2', itemB: 'Definition 2' },
      { id: '3', itemA: 'Term 3', itemB: 'Definition 3' },
    ]
  );
  const [randomizeListB, setRandomizeListB] = useState<boolean>(
    existingQuestion?.randomizeListB ?? true
  );

  // Fill in the blanks
  const [blankAnswers, setBlankAnswers] = useState<string>(
    existingQuestion?.blankCorrectAnswers?.join(', ') || existingQuestion?.correctAnswer || ''
  );
  const [altAnswers, setAltAnswers] = useState<string>(
    existingQuestion?.alternativeAnswers?.join(', ') || ''
  );
  const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(
    existingQuestion?.isCaseSensitive ?? false
  );

  // Programming & Code state
  const [programmingLanguage, setProgrammingLanguage] = useState<string>(
    existingQuestion?.programmingLanguage || 'C'
  );
  const [problemDescription, setProblemDescription] = useState<string>(
    existingQuestion?.problemDescription || ''
  );
  const [inputFormat, setInputFormat] = useState<string>(
    existingQuestion?.inputFormat || ''
  );
  const [outputFormat, setOutputFormat] = useState<string>(
    existingQuestion?.outputFormat || ''
  );
  const [constraints, setConstraints] = useState<string>(
    existingQuestion?.constraints || ''
  );
  const [sampleInput, setSampleInput] = useState<string>(
    existingQuestion?.sampleInput || ''
  );
  const [sampleOutput, setSampleOutput] = useState<string>(
    existingQuestion?.sampleOutput || ''
  );
  const [expectedSolution, setExpectedSolution] = useState<string>(
    existingQuestion?.expectedSolution || ''
  );
  const [testCases, setTestCases] = useState<TestCase[]>(
    existingQuestion?.testCases || [
      { id: 'tc-1', input: '5', expectedOutput: '25', points: 1, isHidden: false },
      { id: 'tc-2', input: '10', expectedOutput: '100', points: 1, isHidden: true },
    ]
  );

  // Code Output
  const [codeSnippet, setCodeSnippet] = useState<string>(
    existingQuestion?.codeSnippet || ''
  );
  const [expectedOutput, setExpectedOutput] = useState<string>(
    existingQuestion?.expectedOutput || ''
  );

  // Debugging
  const [buggyCode, setBuggyCode] = useState<string>(
    existingQuestion?.buggyCode || ''
  );
  const [expectedCorrection, setExpectedCorrection] = useState<string>(
    existingQuestion?.expectedCorrection || ''
  );
  const [bugExplanation, setBugExplanation] = useState<string>(
    existingQuestion?.bugExplanation || ''
  );

  // Problem Solving
  const [psAnswer, setPsAnswer] = useState<string>(
    existingQuestion?.expectedAnswer || ''
  );

  // Flowchart & Tracing
  const [flowchartContent, setFlowchartContent] = useState<string>(
    existingQuestion?.flowchartContent || ''
  );
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>(
    existingQuestion?.subQuestions || [
      { id: 'sq-1', prompt: 'What is the output under input condition X?', answer: 'Y', points: 2 }
    ]
  );

  // When course changes, update topic & CLO options
  useEffect(() => {
    if (activeCourse) {
      if (!activeCourse.topics.includes(topic)) {
        setTopic(activeCourse.topics[0] || 'General');
      }
      if (!activeCourse.learningOutcomes.includes(learningOutcome)) {
        setLearningOutcome(activeCourse.learningOutcomes[0] || 'CLO-1: Core Concept Analysis');
      }
    }
  }, [selectedCourseId]);

  // Handlers for choices
  const handleAddChoice = () => {
    const nextLetter = String.fromCharCode(65 + choices.length);
    setChoices([...choices, `Choice ${nextLetter}`]);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length <= 2) return;
    const removedChoice = choices[index];
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
    if (correctAnswer === removedChoice) {
      setCorrectAnswer(newChoices[0]);
    }
  };

  const handleChoiceChange = (index: number, val: string) => {
    const oldVal = choices[index];
    const newChoices = [...choices];
    newChoices[index] = val;
    setChoices(newChoices);
    if (correctAnswer === oldVal) {
      setCorrectAnswer(val);
    }
  };

  // Handlers for Matching Pairs
  const handleAddMatchingPair = () => {
    setMatchingPairs([
      ...matchingPairs,
      { id: String(Date.now()), itemA: '', itemB: '' },
    ]);
  };

  const handleRemoveMatchingPair = (index: number) => {
    setMatchingPairs(matchingPairs.filter((_, i) => i !== index));
  };

  const handleUpdateMatchingPair = (index: number, field: 'itemA' | 'itemB', val: string) => {
    const newPairs = [...matchingPairs];
    newPairs[index][field] = val;
    setMatchingPairs(newPairs);
  };

  // Handlers for Test Cases
  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        id: `tc-${Date.now()}`,
        input: '',
        expectedOutput: '',
        points: 1,
        isHidden: false,
      },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleUpdateTestCase = (index: number, updates: Partial<TestCase>) => {
    const newCases = [...testCases];
    newCases[index] = { ...newCases[index], ...updates };
    setTestCases(newCases);
  };

  // Handlers for Sub-questions
  const handleAddSubQuestion = () => {
    setSubQuestions([
      ...subQuestions,
      { id: `sq-${Date.now()}`, prompt: '', answer: '', points: 2 },
    ]);
  };

  const handleRemoveSubQuestion = (index: number) => {
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateSubQuestion = (index: number, updates: Partial<SubQuestion>) => {
    const newSQs = [...subQuestions];
    newSQs[index] = { ...newSQs[index], ...updates };
    setSubQuestions(newSQs);
  };

  // Save or Submit
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (statusToSet: 'Draft' | 'Submitted') => {
    if (!activeCourse) {
      alert('No course data is available yet. Please wait for courses to load or add a course first.');
      return;
    }
    if (!questionText.trim()) {
      alert('Please enter the question prompt or instructions.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    const payload: Partial<Question> = {
      courseId: activeCourse.id,
      courseCode: activeCourse.code,
      courseName: activeCourse.name,
      topic,
      type,
      difficulty,
      learningOutcome,
      points: Number(points) || 1,
      question: questionText,
      explanation,
      status: statusToSet,
    };

    // Attach type-specific data
    if (type === 'multiple_choice') {
      payload.choices = choices;
      payload.correctAnswer = correctAnswer;
      payload.randomizeChoices = randomizeChoices;
    } else if (type === 'true_false') {
      payload.trueFalseAnswer = tfAnswer;
      payload.correctAnswer = tfAnswer ? 'True' : 'False';
    } else if (type === 'matching') {
      payload.matchingInstructions = matchingInstructions;
      payload.matchingPairs = matchingPairs;
      payload.randomizeListB = randomizeListB;
      payload.correctAnswer = 'List A matched to List B pairs';
    } else if (type === 'fill_blank') {
      const blanks = blankAnswers.split(',').map((s) => s.trim()).filter(Boolean);
      const alts = altAnswers.split(',').map((s) => s.trim()).filter(Boolean);
      payload.blankCorrectAnswers = blanks;
      payload.alternativeAnswers = alts;
      payload.isCaseSensitive = isCaseSensitive;
      payload.correctAnswer = blanks[0] || '';
    } else if (type === 'coding_problem') {
      payload.programmingLanguage = programmingLanguage;
      payload.problemDescription = problemDescription;
      payload.inputFormat = inputFormat;
      payload.outputFormat = outputFormat;
      payload.constraints = constraints;
      payload.sampleInput = sampleInput;
      payload.sampleOutput = sampleOutput;
      payload.expectedSolution = expectedSolution;
      payload.testCases = testCases;
      payload.correctAnswer = 'Tested against automated test suites';
    } else if (type === 'code_output') {
      payload.programmingLanguage = programmingLanguage;
      payload.codeSnippet = codeSnippet;
      payload.expectedOutput = expectedOutput;
      payload.correctAnswer = expectedOutput;
    } else if (type === 'debugging') {
      payload.programmingLanguage = programmingLanguage;
      payload.buggyCode = buggyCode;
      payload.expectedCorrection = expectedCorrection;
      payload.bugExplanation = bugExplanation;
      payload.correctAnswer = expectedCorrection;
    } else if (type === 'problem_solving') {
      payload.expectedAnswer = psAnswer;
      payload.correctAnswer = psAnswer;
    } else if (type === 'algorithm_tracing' || type === 'pseudocode' || type === 'flowchart') {
      payload.programmingLanguage = programmingLanguage;
      payload.codeSnippet = codeSnippet;
      payload.flowchartContent = flowchartContent;
      payload.subQuestions = subQuestions;
      payload.correctAnswer = subQuestions.map((s) => s.answer).join('; ');
    }

    if (existingQuestion) {
      try {
        // Awaited so the question is really in the shared `questions`
        // collection (and visible to reviewers on other devices) before leaving.
        await updateQuestion(existingQuestion.id, payload);
        setCurrentView('my_questions');
      } catch (err) {
        console.error('Failed to save question:', err);
        setSaveError(
          'Could not save the question to the shared database. ' +
            'It is still shown locally — please check your connection and try again.'
        );
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        await createQuestion(payload);
        setCurrentView('my_questions');
      } catch (err) {
        console.error('Failed to save question:', err);
        setSaveError(
          'Could not save the question to the shared database. ' +
            'It is still shown locally — please check your connection and try again.'
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (courses.length === 0 || !activeCourse) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-xs text-center">
          <h2 className="text-sm font-bold text-slate-900">Loading question workspace…</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Waiting for course data from the shared database. If this persists, check your
            connection or add a course under Course Management first.
          </p>
          <button
            onClick={() => setCurrentView('my_questions')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            ← Back to My Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentView('my_questions');
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {existingQuestion ? `Edit Question: ${existingQuestion.id}` : 'Create Examination Question'}
            </h1>
            <p className="text-xs text-slate-500">
              BSCpE accredited question authoring workspace with multi-type configuration.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-wait"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving…' : 'Save as Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('Submitted')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-wait"
          >
            <Send className="w-4 h-4" />
            <span>{isSaving ? 'Saving…' : 'Submit for Review'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {saveError}
        </div>
      )}

      {/* Warning if editing an already approved question */}
      {existingQuestion && (existingQuestion.status === 'Approved' || existingQuestion.status === 'Published') && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Caution:</strong> This question is already marked as <strong>Approved</strong>. Saving modifications will preserve accreditation history.
          </div>
        </div>
      )}

      {/* Step 1: Course & Metadata Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Curriculum Classification & Rubric Points
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Course *
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Curriculum Topic *
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              {activeCourse?.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cognitive Difficulty *
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="Easy">Easy (Recall & Comprehension)</option>
              <option value="Medium">Medium (Application & Analysis)</option>
              <option value="Hard">Hard (Synthesis, Design & Evaluation)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Learning Outcome (CLO) *
            </label>
            <select
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
            >
              {activeCourse?.learningOutcomes.map((clo) => (
                <option key={clo} value={clo}>
                  {clo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Score Weight (Points) *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Question Type Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Select Question Format (11 Evaluated Types)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {QUESTION_TYPES.map((qt) => {
            const isSelected = type === qt.type;
            return (
              <button
                key={qt.type}
                type="button"
                onClick={() => setType(qt.type)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs truncate">{qt.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {qt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Question Prompt & Specialized Inputs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Question Content & Format-Specific Configuration
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Question Prompt / Problem Instructions *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Type your examination question prompt clearly..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 leading-relaxed font-sans"
          />
        </div>

        {/* 1. Multiple Choice */}
        {type === 'multiple_choice' && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700">
                Multiple Choice Options (Select radio for correct answer)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeChoices}
                    onChange={(e) => setRandomizeChoices(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Randomize Choices during Exam Generation</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Choice
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {choices.map((choice, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = choice === correctAnswer;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(choice)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Set as correct answer"
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(idx, e.target.value)}
                      className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold'
                          : 'border-slate-200'
                      }`}
                      placeholder={`Option ${letter}`}
                    />
                    {choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChoice(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. True or False */}
        {type === 'true_false' && (
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">Correct Answer</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="tf"
                  checked={tfAnswer === true}
                  onChange={() => setTfAnswer(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>TRUE</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="tf"
                  checked={tfAnswer === false}
                  onChange={() => setTfAnswer(false)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>FALSE</span>
              </label>
            </div>
          </div>
        )}

        {/* 3. Matching Type */}
        {type === 'matching' && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700">Matching Pair Configuration</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={randomizeListB}
                    onChange={(e) => setRandomizeListB(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Randomize List B Choices</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMatchingPair}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Pair
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {matchingPairs.map((pair, idx) => (
                <div key={pair.id || idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`List A Item #${idx + 1}`}
                    value={pair.itemA}
                    onChange={(e) => handleUpdateMatchingPair(idx, 'itemA', e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder={`Corresponding List B Match`}
                      value={pair.itemB}
                      onChange={(e) => handleUpdateMatchingPair(idx, 'itemB', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-emerald-50/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMatchingPair(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Fill in the Blanks */}
        {type === 'fill_blank' && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Accepted Answer(s) (comma separated for multiple blanks)
              </label>
              <input
                type="text"
                placeholder="e.g. semaphore, mutex"
                value={blankAnswers}
                onChange={(e) => setBlankAnswers(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alternative Accepted Synonyms / Spellings (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. binary semaphore, counting semaphore"
                value={altAnswers}
                onChange={(e) => setAltAnswers(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isCaseSensitive}
                onChange={(e) => setIsCaseSensitive(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>Enforce Strict Case Matching</span>
            </label>
          </div>
        )}

        {/* 5. Coding Problem */}
        {type === 'coding_problem' && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Programming Language *
                </label>
                <select
                  value={programmingLanguage}
                  onChange={(e) => setProgrammingLanguage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                >
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Constraints & Bounds
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 <= N <= 10^5, Memory <= 64MB"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sample Standard Input
                </label>
                <textarea
                  rows={2}
                  placeholder="5"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sample Standard Output
                </label>
                <textarea
                  rows={2}
                  placeholder="25"
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Test Cases Table */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Automated Test Suites ({testCases.length} Test Cases)
                </label>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Test Case
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-left">Input</th>
                      <th className="py-2 px-3 text-left">Expected Output</th>
                      <th className="py-2 px-3 text-center w-24">Points</th>
                      <th className="py-2 px-3 text-center w-28">Visibility</th>
                      <th className="py-2 px-3 text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {testCases.map((tc, idx) => (
                      <tr key={tc.id || idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Input stdin..."
                            value={tc.input}
                            onChange={(e) => handleUpdateTestCase(idx, { input: e.target.value })}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Expected stdout..."
                            value={tc.expectedOutput}
                            onChange={(e) =>
                              handleUpdateTestCase(idx, { expectedOutput: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-slate-200 font-mono"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={tc.points}
                            onChange={(e) =>
                              handleUpdateTestCase(idx, { points: parseInt(e.target.value) || 1 })
                            }
                            className="w-16 px-1.5 py-1 text-xs rounded border border-slate-200 font-mono text-center mx-auto"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateTestCase(idx, { isHidden: !tc.isHidden })}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              tc.isHidden
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {tc.isHidden ? 'Hidden' : 'Public'}
                          </button>
                        </td>
                        <td className="p-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Reference Solution Code
              </label>
              <textarea
                rows={6}
                placeholder="// Enter working reference solution in selected language..."
                value={expectedSolution}
                onChange={(e) => setExpectedSolution(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono bg-slate-900 text-slate-100"
              />
            </div>
          </div>
        )}

        {/* 6. Code Output */}
        {type === 'code_output' && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Language
                </label>
                <select
                  value={programmingLanguage}
                  onChange={(e) => setProgrammingLanguage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                >
                  {PROGRAMMING_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Console Output *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 20 35 40 50"
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono text-emerald-800 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code Snippet to Evaluate
              </label>
              <textarea
                rows={6}
                placeholder="// Paste code snippet here..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono bg-slate-900 text-slate-100"
              />
            </div>
          </div>
        )}

        {/* 7. Debugging */}
        {type === 'debugging' && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Buggy Code Given to Student
              </label>
              <textarea
                rows={5}
                placeholder="// Buggy code snippet..."
                value={buggyCode}
                onChange={(e) => setBuggyCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-rose-200 font-mono bg-slate-900 text-rose-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Expected Correction
              </label>
              <textarea
                rows={5}
                placeholder="// Fixed corrected code..."
                value={expectedCorrection}
                onChange={(e) => setExpectedCorrection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-200 font-mono bg-slate-900 text-emerald-300"
              />
            </div>
          </div>
        )}

        {/* 8. Problem Solving */}
        {type === 'problem_solving' && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Quantitative / Derivation Answer
              </label>
              <input
                type="text"
                placeholder="e.g. CPI = 1.365; Execution Time = 0.546 ms"
                value={psAnswer}
                onChange={(e) => setPsAnswer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono text-emerald-800 font-semibold"
              />
            </div>
          </div>
        )}

        {/* 9, 10, 11: Algorithm Tracing, Pseudocode, Flowchart */}
        {(type === 'algorithm_tracing' || type === 'pseudocode' || type === 'flowchart') && (
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'flowchart'
                  ? 'Flowchart Diagram / Graph Text / State Diagram'
                  : 'Algorithm / Pseudocode Content'}
              </label>
              <textarea
                rows={6}
                placeholder="Enter structured diagram or pseudocode logic..."
                value={type === 'flowchart' ? flowchartContent : codeSnippet}
                onChange={(e) =>
                  type === 'flowchart'
                    ? setFlowchartContent(e.target.value)
                    : setCodeSnippet(e.target.value)
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono bg-slate-900 text-slate-100"
              />
            </div>

            {/* Sub-questions builder */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Comprehension Sub-Questions & Correct Answers
                </label>
                <button
                  type="button"
                  onClick={handleAddSubQuestion}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Sub-Question
                </button>
              </div>

              {subQuestions.map((sq, idx) => (
                <div key={sq.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-700">Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Sub-question prompt..."
                      value={sq.prompt}
                      onChange={(e) => handleUpdateSubQuestion(idx, { prompt: e.target.value })}
                      className="sm:col-span-2 px-2.5 py-1 text-xs rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={sq.points}
                      onChange={(e) =>
                        handleUpdateSubQuestion(idx, { points: parseInt(e.target.value) || 1 })
                      }
                      className="px-2 py-1 text-xs rounded border border-slate-200 bg-white font-mono"
                      placeholder="Points"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Expected response..."
                    value={sq.answer}
                    onChange={(e) => handleUpdateSubQuestion(idx, { answer: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-emerald-300 bg-emerald-50/20 font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Pedagogical Explanation & Marking Solution */}
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Complete Derivation / Explanation & Scoring Rubric *
          </label>
          <textarea
            rows={4}
            placeholder="Explain the step-by-step logic, relevant formulas, and rationale so reviewers and examiners understand the grading key..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* Bottom Save & Submit Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs text-slate-500 font-mono min-w-0">
          Author: {currentUser.name} · Academic Term: {systemSettings.academicYear}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('Submitted')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
};
