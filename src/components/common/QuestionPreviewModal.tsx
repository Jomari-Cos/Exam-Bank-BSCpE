import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, TestCase } from '../../types';
import { CodeViewer } from './CodeViewer';
import {
  statusBadgeClass,
  reviewActionBadgeClass,
  difficultyBadgeClass,
} from '../../lib/navigation';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-line w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-line bg-background/70 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-line text-ink">
                {question.id}
              </span>
              <span className={statusBadgeClass(question.status)}>
                {question.status}
              </span>
              <span className={difficultyBadgeClass(question.difficulty)}>
                {question.difficulty}
              </span>
              <span className="text-xs text-ink-muted font-mono">
                {question.points} {question.points === 1 ? 'pt' : 'pts'}
              </span>
              <span className="text-xs text-ink-muted">Ã‚Â·</span>
              <span className="text-xs text-ink-secondary font-medium">{question.type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <h2 className="text-base font-bold text-ink leading-snug">
              {question.courseCode} Ã‚Â· {question.courseName}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Topic: <span className="text-ink-secondary font-medium">{question.topic}</span>
              {' Ã‚Â· '}
              <span className="font-mono text-[11px] text-ink-secondary">{question.learningOutcome}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="tap-target p-1.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-line transition-colors shrink-0 cursor-pointer"
            aria-label="Close question preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (scrollable horizontally on small screens) */}
        <div className="flex items-center gap-1 px-4 sm:px-5 pt-3 border-b border-line bg-white overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            Question & Solution
          </button>

          {question.testCases && question.testCases.length > 0 && (
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'testcases'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Test Cases ({question.testCases.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reviews ({question.reviews?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Audit History ({question.history?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Question Statement */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                  Question Prompt / Problem Statement
                </span>
                <div className="p-4 rounded-lg bg-background border border-line text-ink text-sm whitespace-pre-wrap leading-relaxed font-sans font-medium">
                  {question.question}
                </div>
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'multiple_choice' && question.choices && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                      Multiple Choice Options
                    </span>
                    {question.randomizeChoices && (
                      <span className="text-[11px] text-ink-muted italic">Randomize choices enabled</span>
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
                              ? 'bg-success-soft border-success-accent text-success-fg font-semibold'
                              : 'bg-white border-line text-ink-secondary'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                              isCorrect ? 'bg-success text-white' : 'bg-surface-secondary text-ink-secondary'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5">{choice}</span>
                          {isCorrect && (
                            <span className="text-[11px] uppercase font-bold text-success-fg px-2 py-0.5 bg-success-soft rounded">
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
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Correct Answer
                  </span>
                  <div className="p-3 bg-success-soft border border-success-border rounded-lg text-success-fg text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>Statement is {question.trueFalseAnswer ? 'TRUE' : 'FALSE'}</span>
                  </div>
                </div>
              )}

              {/* Matching Type */}
              {question.type === 'matching' && question.matchingPairs && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Matching Pairs (List A Ã¢â€ â€ List B)
                  </span>
                  {question.matchingInstructions && (
                    <p className="text-xs text-ink-secondary italic">{question.matchingInstructions}</p>
                  )}
                  <div className="border border-line rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[340px] text-xs">
                      <thead className="bg-background border-b border-line text-ink-secondary">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold w-1/2">List A (Item)</th>
                          <th className="text-left py-2 px-3 font-semibold w-1/2">List B (Correct Match)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-secondary">
                        {question.matchingPairs.map((pair, i) => (
                          <tr key={pair.id || i} className="hover:bg-background">
                            <td className="py-2.5 px-3 font-medium text-ink">{pair.itemA}</td>
                            <td className="py-2.5 px-3 text-success-fg bg-success-soft/50 font-medium">
                              {pair.itemB}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Fill in the Blanks */}
              {question.type === 'fill_blank' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Blank Answer Key & Accepted Alternatives
                  </span>
                  <div className="p-3 bg-background border border-line rounded-lg text-xs space-y-2">
                    <div>
                      <span className="text-ink-muted font-medium">Primary Accepted Answer: </span>
                      <strong className="text-success-fg font-mono text-sm ml-1">
                        {question.blankCorrectAnswers?.join(', ') || question.correctAnswer}
                      </strong>
                    </div>
                    {question.alternativeAnswers && question.alternativeAnswers.length > 0 && (
                      <div>
                        <span className="text-ink-muted font-medium">Accepted Variants / Synonyms: </span>
                        <span className="text-ink-secondary font-mono ml-1">
                          {question.alternativeAnswers.join(' Ã‚Â· ')}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-ink-muted">
                      Case Sensitivity: {question.isCaseSensitive ? 'Strict Case Match' : 'Case Insensitive'}
                    </p>
                  </div>
                </div>
              )}

              {/* Coding Problem / Code Snippets */}
              {question.codeSnippet && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Code Snippet ({question.programmingLanguage || 'Code'})
                  </span>
                  <CodeViewer code={question.codeSnippet} language={question.programmingLanguage || 'c'} />
                </div>
              )}

              {question.expectedSolution && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Expected Reference Solution ({question.programmingLanguage || 'Code'})
                  </span>
                  <CodeViewer code={question.expectedSolution} language={question.programmingLanguage || 'c'} />
                </div>
              )}

              {/* Debugging Buggy vs Corrected */}
              {question.type === 'debugging' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-danger uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Buggy Code Given to Student
                    </span>
                    <CodeViewer code={question.buggyCode || ''} language={question.programmingLanguage || 'c'} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-success uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Expected Correction
                    </span>
                    <CodeViewer code={question.expectedCorrection || ''} language={question.programmingLanguage || 'c'} />
                  </div>
                </div>
              )}

              {/* Flowchart or Diagram Description */}
              {question.type === 'flowchart' && question.flowchartContent && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Flowchart Diagram / Logic Structure
                  </span>
                  <div className="p-4 bg-navy-900 text-success-accent font-mono text-xs rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-navy-700">
                    {question.flowchartContent}
                  </div>
                </div>
              )}

              {/* Sub-questions for Flowchart, Algorithm Tracing, Pseudocode */}
              {question.subQuestions && question.subQuestions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Sub-Questions & Expected Responses
                  </span>
                  <div className="space-y-2">
                    {question.subQuestions.map((sq, i) => (
                      <div key={sq.id || i} className="p-3 bg-background border border-line rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-ink-secondary font-semibold">
                          <span>Q{i + 1}. {sq.prompt}</span>
                          <span className="text-ink-muted font-mono text-[11px]">{sq.points} pts</span>
                        </div>
                        <div className="text-success-fg font-medium pl-2 border-l-2 border-success">
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
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                    Expected Console Output
                  </span>
                  <div className="p-3 bg-navy-900 font-mono text-xs text-warning-accent rounded-lg border border-navy-700">
                    {question.expectedOutput}
                  </div>
                </div>
              )}

              {/* Derivation / Explanation */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                  Detailed Solution & Pedagogical Explanation
                </span>
                <div className="p-4 bg-primary-50/60 border border-primary-100 rounded-lg text-xs text-primary-900 whitespace-pre-wrap leading-relaxed">
                  {question.explanation || 'No explanation provided.'}
                </div>
              </div>

              {/* Metadata details */}
              <div className="pt-4 border-t border-line grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-ink-secondary">
                <div>
                  <span className="text-[11px] text-ink-muted block">Author</span>
                  <strong className="text-ink font-medium">{question.authorName}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block">Reviewer</span>
                  <strong className="text-ink font-medium">{question.reviewerName || 'Unassigned'}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block">Academic Term</span>
                  <strong className="text-ink font-medium">{question.academicYear} Ã‚Â· {question.semester}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block">Last Modified</span>
                  <strong className="text-ink font-medium">{question.dateModified}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testcases' && question.testCases && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-ink">Automated Test Suites</h3>
                  <p className="text-[11px] text-ink-muted">
                    Test cases validated against expected solution during examination scoring.
                  </p>
                </div>
                <button
                  onClick={runAllTestCases}
                  disabled={isRunningTests}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
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
                      className="border border-line rounded-lg p-3 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink">
                            Test Case #{index + 1}
                          </span>
                          {tc.isHidden ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-secondary text-ink-secondary border border-line">
                              Hidden Test Case
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-info-soft text-info-fg border border-info-border">
                              Public Sample
                            </span>
                          )}
                          <span className="text-ink-muted font-mono text-[11px]">
                            {tc.points} {tc.points === 1 ? 'pt' : 'pts'}
                          </span>
                        </div>

                        {passed !== undefined && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-success-fg bg-success-soft px-2 py-0.5 rounded border border-success-border">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                        <div className="p-2 bg-navy-900 text-line rounded">
                          <div className="text-[10px] text-ink-muted mb-1 select-none font-sans uppercase">Input:</div>
                          <pre className="whitespace-pre-wrap">{tc.input}</pre>
                        </div>
                        <div className="p-2 bg-navy-900 text-success-accent rounded">
                          <div className="text-[10px] text-ink-muted mb-1 select-none font-sans uppercase">Expected Output:</div>
                          <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
                        </div>
                      </div>

                      {tc.explanation && (
                        <p className="text-[11px] text-ink-muted italic">
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
              <h3 className="text-xs font-semibold text-ink">Review Committee Deliberation</h3>
              {!question.reviews || question.reviews.length === 0 ? (
                <div className="text-center py-10 bg-background rounded-lg border border-dashed border-line text-ink-muted text-xs">
                  No review feedback submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {question.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border border-line rounded-lg p-4 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-ink-muted" />
                          <strong className="text-ink">{rev.reviewerName}</strong>
                          <span className="text-ink-muted font-mono text-[11px]">{rev.date}</span>
                        </div>
                        <span className={reviewActionBadgeClass(rev.action)}>
                          {rev.action}
                        </span>
                      </div>

                      <p className="text-ink-secondary whitespace-pre-wrap bg-background p-3 rounded border border-surface-secondary">
                        {rev.comments}
                      </p>

                      {rev.criteriaChecks && (
                        <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-ink-secondary">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Syllabus Aligned
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Clarity Verified
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Answer Key Verified
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Difficulty Calibrated
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
              <h3 className="text-xs font-semibold text-ink">Audit Trail & Version History</h3>
              {!question.history || question.history.length === 0 ? (
                <div className="text-center py-10 bg-background rounded-lg border border-dashed border-line text-ink-muted text-xs">
                  No audit entries recorded.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                  {question.history.map((entry) => (
                    <div key={entry.id} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{entry.action}</span>
                        <span className="text-[11px] text-ink-muted font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-ink-secondary mt-0.5">By {entry.userName}</p>
                      {entry.note && (
                        <p className="text-ink-muted text-[11px] italic mt-0.5 bg-background p-1.5 rounded">
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
        <div className="p-4 border-t border-line bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-ink-muted">
            {question.status === 'Approved' ? (
              <span className="text-success-fg font-medium">Ã¢Å“â€œ Ready for examination sets</span>
            ) : (
              <span>Status: {question.status}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(question.id);
                }}
                className="px-3 py-1.5 text-xs font-medium text-ink-secondary bg-white border border-line-strong rounded-lg hover:bg-background transition-colors"
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
                className="px-3 py-1.5 text-xs font-medium text-white bg-warning hover:bg-warning-fg rounded-lg transition-colors"
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
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Review & Deliberate
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-ink-secondary bg-white border border-line-strong rounded-lg hover:bg-background transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
