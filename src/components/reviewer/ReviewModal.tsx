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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Curriculum Review & Peer Verification: {question.id}
              </h2>
              <p className="text-xs text-slate-500">
                Author: <span className="text-slate-700 font-medium">{question.authorName}</span> ·{' '}
                {question.courseCode} · {question.topic}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Question Type</span>
              <strong className="text-slate-800 font-mono capitalize">
                {question.type.replace('_', ' ')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Difficulty</span>
              <strong className="text-slate-800 font-mono">{question.difficulty}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Points</span>
              <strong className="text-slate-800 font-mono">{question.points} pts</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Learning Outcome</span>
              <strong className="text-slate-800 font-mono text-[11px] truncate block">
                {question.learningOutcome}
              </strong>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Question Statement
            </span>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm whitespace-pre-wrap leading-relaxed font-sans font-medium">
              {question.question}
            </div>
          </div>

          {/* Multiple choice choices */}
          {question.choices && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>
                        {String.fromCharCode(65 + i)}. {c}
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold">
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
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Code Snippet ({question.programmingLanguage || 'Code'})
              </span>
              <CodeViewer code={question.codeSnippet} language={question.programmingLanguage || 'c'} />
            </div>
          )}

          {/* Expected Solution */}
          {question.expectedSolution && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Author Reference Solution
              </span>
              <CodeViewer code={question.expectedSolution} language={question.programmingLanguage || 'c'} />
            </div>
          )}

          {/* Test cases */}
          {question.testCases && question.testCases.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Automated Test Cases ({question.testCases.length})
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-1.5 px-3 text-left">Test #</th>
                      <th className="py-1.5 px-3 text-left">Input</th>
                      <th className="py-1.5 px-3 text-left">Expected Output</th>
                      <th className="py-1.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {question.testCases.map((tc, idx) => (
                      <tr key={tc.id || idx}>
                        <td className="py-1.5 px-3">{idx + 1}</td>
                        <td className="py-1.5 px-3">{tc.input}</td>
                        <td className="py-1.5 px-3 text-emerald-700 font-semibold">{tc.expectedOutput}</td>
                        <td className="py-1.5 px-3 text-right">{tc.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pedagogical Explanation */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Author Solution Derivation & Explanation
            </span>
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs text-indigo-950 whitespace-pre-wrap leading-relaxed">
              {question.explanation}
            </div>
          </div>

          {/* Quality Rubric Verification Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Curriculum Verification Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.syllabusAligned}
                  onChange={(e) => setCriteria({ ...criteria, syllabusAligned: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Aligns with BSCpE Syllabus & CLO specifications</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.clarityVerified}
                  onChange={(e) => setCriteria({ ...criteria, clarityVerified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Unambiguous question statement & instructions</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.answerKeyVerified}
                  onChange={(e) => setCriteria({ ...criteria, answerKeyVerified: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Correct answer mathematically/syntactically verified</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.difficultyAppropriate}
                  onChange={(e) => setCriteria({ ...criteria, difficultyAppropriate: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Points and difficulty level are well-calibrated</span>
              </label>
            </div>
          </div>

          {/* Review Comments Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Reviewer Deliberation Comments & Feedback *
            </label>
            <textarea
              rows={3}
              required
              placeholder="State your review comments, suggestions for revisions, or approval rationale..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Modal Decision Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Reviewing as: <strong>{currentUser.name}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDecision('Returned')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return for Revisions</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('Rejected')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Question</span>
            </button>

            <button
              type="button"
              onClick={() => handleDecision('Approved')}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
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
