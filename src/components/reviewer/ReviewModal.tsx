import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { CodeViewer } from '../common/CodeViewer';
import {
  X,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileCode2,
} from 'lucide-react';

interface ReviewModalProps {
  question: Question | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ question, onClose }) => {
  const { reviewQuestion, currentUser } = useApp();

  const [comments, setComments] = useState('');
  const [criteria, setCriteria] = useState({
    syllabusAligned: true,
    clarityVerified: true,
    answerKeyVerified: true,
    difficultyAppropriate: true,
  });

  if (!question) return null;

  const handleDecision = (action: 'Approved' | 'Rejected' | 'Returned') => {
    if (!comments.trim()) {
      alert('Please provide evaluation feedback or comments for the author.');
      return;
    }
    reviewQuestion(question.id, action, comments.trim(), criteria);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-line w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-line bg-warning-soft/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-warning-soft text-warning-fg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink">
                Curriculum Review & Peer Verification: {question.id}
              </h2>
              <p className="text-xs text-ink-muted">
                Author: <span className="text-ink-secondary font-medium">{question.authorName}</span> ·{' '}
                {question.courseCode} · {question.topic}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="tap-target p-1 text-ink-muted hover:text-ink-secondary rounded-lg transition-colors shrink-0 cursor-pointer"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Question Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-background rounded-lg border border-line text-xs">
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Question Type</span>
              <strong className="text-ink font-mono capitalize">
                {question.type.replace('_', ' ')}
              </strong>
            </div>
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Difficulty</span>
              <strong className="text-ink font-mono">{question.difficulty}</strong>
            </div>
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Points</span>
              <strong className="text-ink font-mono">{question.points} pts</strong>
            </div>
            <div>
              <span className="text-ink-muted text-[10px] uppercase block">Learning Outcome</span>
              <strong className="text-ink font-mono text-[11px] truncate block">
                {question.learningOutcome}
              </strong>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Question Statement
            </span>
            <div className="p-4 rounded-lg bg-background border border-line text-ink text-sm whitespace-pre-wrap leading-relaxed font-sans font-medium">
              {question.question}
            </div>
          </div>

          {/* Multiple choice choices */}
          {question.choices && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Choices & Correct Answer
              </span>
              <div className="space-y-1.5">
                {question.choices.map((c, i) => {
                  const isCorrect = c === question.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'bg-success-soft border-success-accent text-success-fg font-semibold'
                          : 'bg-white border-line text-ink-secondary'
                      }`}
                    >
                      <span>
                        {String.fromCharCode(65 + i)}. {c}
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] bg-success text-white px-2 py-0.5 rounded font-mono font-bold">
                          KEY ANSWER
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Code Snippet */}
          {question.codeSnippet && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Code Snippet ({question.programmingLanguage || 'Code'})
              </span>
              <CodeViewer code={question.codeSnippet} language={question.programmingLanguage || 'c'} />
            </div>
          )}

          {/* Expected Solution */}
          {question.expectedSolution && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Author Reference Solution
              </span>
              <CodeViewer code={question.expectedSolution} language={question.programmingLanguage || 'c'} />
            </div>
          )}

          {/* Test cases */}
          {question.testCases && question.testCases.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Automated Test Cases ({question.testCases.length})
              </span>
              <div className="border border-line rounded-lg overflow-hidden text-xs">
                <div className="overflow-x-auto">
                <table className="data-table min-w-[420px]">
                  <thead className="">
                    <tr>
                      <th className="py-1.5 px-3 text-left">Test #</th>
                      <th className="py-1.5 px-3 text-left">Input</th>
                      <th className="py-1.5 px-3 text-left">Expected Output</th>
                      <th className="py-1.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line font-mono">
                    {question.testCases.map((tc, idx) => (
                      <tr key={tc.id || idx}>
                        <td className="py-1.5 px-3">{idx + 1}</td>
                        <td className="py-1.5 px-3">{tc.input}</td>
                        <td className="py-1.5 px-3 text-success-fg font-semibold">{tc.expectedOutput}</td>
                        <td className="py-1.5 px-3 text-right">{tc.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* Pedagogical Explanation */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
              Author Solution Derivation & Explanation
            </span>
            <div className="p-3 bg-primary-50/70 border border-primary-100 rounded-lg text-xs text-primary-900 whitespace-pre-wrap leading-relaxed">
              {question.explanation}
            </div>
          </div>

          {/* Quality Rubric Verification Checklist */}
          <div className="p-4 bg-background border border-line rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              Curriculum Verification Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 text-ink-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.syllabusAligned}
                  onChange={(e) => setCriteria({ ...criteria, syllabusAligned: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Aligns with BSCpE Syllabus & CLO specifications</span>
              </label>

              <label className="flex items-center gap-2 text-ink-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.clarityVerified}
                  onChange={(e) => setCriteria({ ...criteria, clarityVerified: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Unambiguous question statement & instructions</span>
              </label>

              <label className="flex items-center gap-2 text-ink-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.answerKeyVerified}
                  onChange={(e) => setCriteria({ ...criteria, answerKeyVerified: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Correct answer mathematically/syntactically verified</span>
              </label>

              <label className="flex items-center gap-2 text-ink-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.difficultyAppropriate}
                  onChange={(e) => setCriteria({ ...criteria, difficultyAppropriate: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Points and difficulty level are well-calibrated</span>
              </label>
            </div>
          </div>

          {/* Review Comments Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink-secondary">
              Reviewer Deliberation Comments & Feedback *
            </label>
            <textarea
              rows={3}
              required
              placeholder="State your review comments, suggestions for revisions, or approval rationale..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Modal Decision Footer */}
        <div className="p-4 border-t border-line bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-ink-muted min-w-0">
            Reviewing as: <strong className="break-words">{currentUser.name}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDecision('Returned')}
              className="tap-target flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-warning-fg bg-warning-soft hover:bg-warning-border rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return for Revisions</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('Rejected')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-danger-fg bg-danger-soft hover:bg-danger-border rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Question</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('Approved')}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-success hover:bg-success-fg rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Publish to Bank</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
