import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, TestCase } from '../../types';
import { CodeViewer } from './CodeViewer';
import {
  X,
  Clock,
  User as UserIcon,
  CheckCircle2,
  FileCode2,
  ListOrdered,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QuestionPreviewModalProps {
  question: Question | null;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onSubmitForReview?: (id: string) => void;
  onReview?: (id: string) => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  question,
  onClose,
  onEdit,
  onSubmitForReview,
  onReview,
}) => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'content' | 'testcases' | 'reviews' | 'history'>('content');
  const [simulatedTestResults, setSimulatedTestResults] = useState<Record<string, boolean>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  if (!question) return null;

  const runAllTestCases = () => {
    if (!question.testCases || question.testCases.length === 0) return;
    setIsRunningTests(true);
    setTimeout(() => {
      const results: Record<string, boolean> = {};
      question.testCases!.forEach((tc) => {
        // Sample solution passes all test cases in our simulation
        results[tc.id] = true;
      });
      setSimulatedTestResults(results);
      setIsRunningTests(false);
    }, 450);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Published':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Submitted':
      case 'Under Review':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Draft':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'Archived':
        return 'text-slate-400 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Hard':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-600';
    }
  };

  const canEdit =
    (currentUser.role === 'admin' || currentUser.id === question.authorId) &&
    question.status === 'Draft';

  const canSubmit =
    (currentUser.role === 'admin' || currentUser.id === question.authorId) &&
    question.status === 'Draft';

  const canReview =
    (currentUser.role === 'reviewer' || currentUser.role === 'admin') &&
    question.status === 'Submitted';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {question.id}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusColor(question.status)}`}>
                {question.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {question.points} {question.points === 1 ? 'pt' : 'pts'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-medium">{question.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {question.courseCode} · {question.courseName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Topic: <span className="text-slate-700 font-medium">{question.topic}</span>
              {' · '}
              <span className="font-mono text-[11px] text-slate-600">{question.learningOutcome}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Question & Solution
          </button>

          {question.testCases && question.testCases.length > 0 && (
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'testcases'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Test Cases ({question.testCases.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reviews ({question.reviews?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Audit History ({question.history?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Question Statement */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Question Prompt / Problem Statement
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm whitespace-pre-wrap leading-relaxed font-sans font-medium">
                  {question.question}
                </div>
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'multiple_choice' && question.choices && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Multiple Choice Options
                    </span>
                    {question.randomizeChoices && (
                      <span className="text-[11px] text-slate-500 italic">Randomize choices enabled</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {question.choices.map((choice, index) => {
                      const letter = String.fromCharCode(65 + index);
                      const isCorrect = choice === question.correctAnswer;
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5">{choice}</span>
                          {isCorrect && (
                            <span className="text-[11px] uppercase font-bold text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* True or False */}
              {question.type === 'true_false' && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Correct Answer
                  </span>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Statement is {question.trueFalseAnswer ? 'TRUE' : 'FALSE'}</span>
                  </div>
                </div>
              )}

              {/* Matching Type */}
              {question.type === 'matching' && question.matchingPairs && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Matching Pairs (List A ↔ List B)
                  </span>
                  {question.matchingInstructions && (
                    <p className="text-xs text-slate-600 italic">{question.matchingInstructions}</p>
                  )}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold w-1/2">List A (Item)</th>
                          <th className="text-left py-2 px-3 font-semibold w-1/2">List B (Correct Match)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {question.matchingPairs.map((pair, i) => (
                          <tr key={pair.id || i} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium text-slate-800">{pair.itemA}</td>
                            <td className="py-2.5 px-3 text-emerald-800 bg-emerald-50/50 font-medium">
                              {pair.itemB}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Fill in the Blanks */}
              {question.type === 'fill_blank' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Blank Answer Key & Accepted Alternatives
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 font-medium">Primary Accepted Answer: </span>
                      <strong className="text-emerald-700 font-mono text-sm ml-1">
                        {question.blankCorrectAnswers?.join(', ') || question.correctAnswer}
                      </strong>
                    </div>
                    {question.alternativeAnswers && question.alternativeAnswers.length > 0 && (
                      <div>
                        <span className="text-slate-500 font-medium">Accepted Variants / Synonyms: </span>
                        <span className="text-slate-700 font-mono ml-1">
                          {question.alternativeAnswers.join(' · ')}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Case Sensitivity: {question.isCaseSensitive ? 'Strict Case Match' : 'Case Insensitive'}
                    </p>
                  </div>
                </div>
              )}

              {/* Coding Problem / Code Snippets */}
              {question.codeSnippet && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Code Snippet ({question.programmingLanguage || 'Code'})
                  </span>
                  <CodeViewer code={question.codeSnippet} language={question.programmingLanguage || 'c'} />
                </div>
              )}

              {question.expectedSolution && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Expected Reference Solution ({question.programmingLanguage || 'Code'})
                  </span>
                  <CodeViewer code={question.expectedSolution} language={question.programmingLanguage || 'c'} />
                </div>
              )}

              {/* Debugging Buggy vs Corrected */}
              {question.type === 'debugging' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Buggy Code Given to Student
                    </span>
                    <CodeViewer code={question.buggyCode || ''} language={question.programmingLanguage || 'c'} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Expected Correction
                    </span>
                    <CodeViewer code={question.expectedCorrection || ''} language={question.programmingLanguage || 'c'} />
                  </div>
                </div>
              )}

              {/* Flowchart or Diagram Description */}
              {question.type === 'flowchart' && question.flowchartContent && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Flowchart Diagram / Logic Structure
                  </span>
                  <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                    {question.flowchartContent}
                  </div>
                </div>
              )}

              {/* Sub-questions for Flowchart, Algorithm Tracing, Pseudocode */}
              {question.subQuestions && question.subQuestions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sub-Questions & Expected Responses
                  </span>
                  <div className="space-y-2">
                    {question.subQuestions.map((sq, i) => (
                      <div key={sq.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-700 font-semibold">
                          <span>Q{i + 1}. {sq.prompt}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{sq.points} pts</span>
                        </div>
                        <div className="text-emerald-800 font-medium pl-2 border-l-2 border-emerald-500">
                          Answer: {sq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Output for Code Output */}
              {question.expectedOutput && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Expected Console Output
                  </span>
                  <div className="p-3 bg-slate-900 font-mono text-xs text-amber-300 rounded-lg border border-slate-800">
                    {question.expectedOutput}
                  </div>
                </div>
              )}

              {/* Derivation / Explanation */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Detailed Solution & Pedagogical Explanation
                </span>
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-950 whitespace-pre-wrap leading-relaxed">
                  {question.explanation || 'No explanation provided.'}
                </div>
              </div>

              {/* Metadata details */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-[11px] text-slate-400 block">Author</span>
                  <strong className="text-slate-800 font-medium">{question.authorName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Reviewer</span>
                  <strong className="text-slate-800 font-medium">{question.reviewerName || 'Unassigned'}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Academic Term</span>
                  <strong className="text-slate-800 font-medium">{question.academicYear} · {question.semester}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Last Modified</span>
                  <strong className="text-slate-800 font-medium">{question.dateModified}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testcases' && question.testCases && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Automated Test Suites</h3>
                  <p className="text-[11px] text-slate-500">
                    Test cases validated against expected solution during examination scoring.
                  </p>
                </div>
                <button
                  onClick={runAllTestCases}
                  disabled={isRunningTests}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
                >
                  {isRunningTests ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      Running Suites...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Execute Test Simulation
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {question.testCases.map((tc, index) => {
                  const passed = simulatedTestResults[tc.id];
                  return (
                    <div
                      key={tc.id || index}
                      className="border border-slate-200 rounded-lg p-3 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            Test Case #{index + 1}
                          </span>
                          {tc.isHidden ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                              Hidden Test Case
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                              Public Sample
                            </span>
                          )}
                          <span className="text-slate-500 font-mono text-[11px]">
                            {tc.points} {tc.points === 1 ? 'pt' : 'pts'}
                          </span>
                        </div>

                        {passed !== undefined && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                        <div className="p-2 bg-slate-900 text-slate-200 rounded">
                          <div className="text-[10px] text-slate-400 mb-1 select-none font-sans uppercase">Input:</div>
                          <pre className="whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div className="p-2 bg-slate-900 text-emerald-300 rounded">
                          <div className="text-[10px] text-slate-400 mb-1 select-none font-sans uppercase">Expected Output:</div>
                          <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
                        </div>
                      </div>

                      {tc.explanation && (
                        <p className="text-[11px] text-slate-500 italic">
                          Note: {tc.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-900">Review Committee Deliberation</h3>
              {!question.reviews || question.reviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
                  No review feedback submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {question.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border border-slate-200 rounded-lg p-4 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <strong className="text-slate-800">{rev.reviewerName}</strong>
                          <span className="text-slate-400 font-mono text-[11px]">{rev.date}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                            rev.action === 'Approved'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : rev.action === 'Returned'
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          {rev.action}
                        </span>
                      </div>

                      <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">
                        {rev.comments}
                      </p>

                      {rev.criteriaChecks && (
                        <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Syllabus Aligned
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clarity Verified
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Answer Key Verified
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Difficulty Calibrated
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-900">Audit Trail & Version History</h3>
              {!question.history || question.history.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
                  No audit entries recorded.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {question.history.map((entry) => (
                    <div key={entry.id} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{entry.action}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">By {entry.userName}</p>
                      {entry.note && (
                        <p className="text-slate-500 text-[11px] italic mt-0.5 bg-slate-50 p-1.5 rounded">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {question.status === 'Approved' ? (
              <span className="text-emerald-700 font-medium">✓ Ready for examination sets</span>
            ) : (
              <span>Status: {question.status}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(question.id);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Edit Question
              </button>
            )}

            {canSubmit && onSubmitForReview && (
              <button
                onClick={() => {
                  onClose();
                  onSubmitForReview(question.id);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Submit for Review
              </button>
            )}

            {canReview && onReview && (
              <button
                onClick={() => {
                  onClose();
                  onReview(question.id);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Review & Deliberate
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
