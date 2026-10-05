import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Examination, ExamVersion } from '../../types';
import { CodeViewer } from '../common/CodeViewer';
import { generateExamPdf } from '../../lib/pdfGenerator';
import {
  Printer,
  Download,
  ArrowLeft,
  Key,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  FileDown,
  Info,
} from 'lucide-react';

export const ExamPrintView: React.FC = () => {
  const { viewingExamId, examinations, setCurrentView } = useApp();
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'student' | 'answer_key'>('student');
  const [copiedText, setCopiedText] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const exam = viewingExamId ? examinations.find((e) => e.id === viewingExamId) : undefined;

  if (!exam) {
    return (
      <div className="p-8 text-center text-ink-muted text-xs">
        Examination package not found.{' '}
        <button
          onClick={() => setCurrentView('exam_list')}
          className="text-primary-600 underline"
        >
          Return to Exam List
        </button>
      </div>
    );
  }

  const activeVersion: ExamVersion | undefined =
    exam.versions[selectedSetIndex] || exam.versions[0];

  if (!activeVersion) {
    return (
      <div className="p-8 text-center text-ink-muted text-xs">
        This examination package has no generated versions yet.{' '}
        <button
          onClick={() => setCurrentView('exam_list')}
          className="text-primary-600 underline"
        >
          Return to Exam List
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      await generateExamPdf({
        exam,
        version: activeVersion,
        isAnswerKey: viewMode === 'answer_key',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadAllSetsPdf = async () => {
    try {
      setIsPdfGenerating(true);
      for (const ver of exam.versions) {
        await generateExamPdf({
          exam,
          version: ver,
          isAnswerKey: viewMode === 'answer_key',
        });
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadHTML = async () => {
    const isAnswerKey = viewMode === 'answer_key';
    let logoImgTag = '';
    try {
      const { loadBrandLogoDataUrl } = await import('../../lib/pdfGenerator');
      const logoDataUrl = await loadBrandLogoDataUrl();
      if (logoDataUrl) {
        logoImgTag = `<img src="${logoDataUrl}" alt="Computer Engineering logo" style="width: 80px; height: 80px; object-fit: contain;" />`;
      }
    } catch {
      logoImgTag = '';
    }
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${exam.title} - ${activeVersion.versionLabel} ${isAnswerKey ? '(Answer Key)' : ''}</title>
  <style>
    /* Standalone print document: literal hex values below intentionally mirror
       the app design tokens (primary-900 #0f172a, border-dark #cbd5e1,
       primary-50 #eff6ff, primary-600 #2563eb, surface-secondary #f1f5f9)
       so the printed exam matches the on-screen palette without external CSS. */
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 16pt; font-weight: bold; margin: 4px 0; }
    .student-fields { display: flex; justify-content: space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; font-size: 10pt; }
    .question { margin-bottom: 24px; page-break-inside: avoid; }
    .q-num { font-weight: bold; }
    .choices { margin-left: 20px; list-style-type: upper-alpha; }
    .key-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 8px 12px; margin-top: 8px; font-size: 9pt; }
    pre { background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="header">
    ${logoImgTag}
    <div style="font-size: 11pt; font-weight: bold;">${exam.settings.headerInstitution}</div>
    <div style="font-size: 10pt;">${exam.settings.departmentName}</div>
    <div class="title">${exam.title} (${activeVersion.versionLabel}) ${isAnswerKey ? '· MASTER ANSWER KEY' : ''}</div>
    <div style="font-size: 9pt;">A.Y. ${exam.academicYear} · ${exam.semester} · Time Limit: ${exam.timeLimitMinutes} minutes</div>
  </div>

  ${!isAnswerKey ? `
  <div class="student-fields">
    <div>NAME: ____________________________________</div>
    <div>SECTION: ___________</div>
    <div>DATE: ___________</div>
    <div>SCORE: _____ / ${activeVersion.totalPoints}</div>
  </div>
  <div style="font-style: italic; font-size: 9pt; margin-bottom: 20px;">
    <strong>Instructions:</strong> ${exam.instructions}
  </div>
  ` : ''}

  <div class="questions">
    ${activeVersion.questions.map((q) => `
      <div class="question">
        <div>
          <span class="q-num">${q.questionNumber}.</span>
          ${exam.settings.showPointsPerQuestion ? `(${q.points} pt${q.points === 1 ? '' : 's'})` : ''}
          ${q.questionText}
        </div>
        ${q.choices ? `
          <ol class="choices">
            ${q.choices.map((c) => `<li>${c}</li>`).join('')}
          </ol>
        ` : ''}
        ${q.codeSnippet ? `<pre>${q.codeSnippet.replace(/</g, '&lt;')}</pre>` : ''}
        ${isAnswerKey ? `
          <div class="key-box">
            <strong>CORRECT ANSWER:</strong> ${q.correctAnswerDisplay}<br>
            <strong>EXPLANATION:</strong> ${q.explanation || 'N/A'}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${exam.courseCode}_${exam.term}_${activeVersion.versionLabel.replace(' ', '')}_${viewMode}.html`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Control Bar (Hidden on Print) */}
      <div className="no-print card p-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-16 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setCurrentView('exam_list')}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors shrink-0"
            title="Back to Exam Sets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                {exam.courseCode}
              </span>
              <h2 className="text-sm font-bold text-ink truncate max-w-xs">{exam.title}</h2>
            </div>
            <p className="text-[11px] text-ink-muted">
              {exam.versions.length} versions generated · Total Points: {activeVersion.totalPoints}
            </p>
          </div>
        </div>

        {/* Set Selector & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-0.5 bg-surface-secondary rounded-lg">
            {exam.versions.map((ver, idx) => (
              <button
                key={ver.versionLabel}
                onClick={() => setSelectedSetIndex(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedSetIndex === idx
                    ? 'bg-white text-ink shadow-xs'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {ver.versionLabel}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 bg-surface-secondary rounded-lg">
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'student'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Student Paper</span>
            </button>
            <button
              onClick={() => setViewMode('answer_key')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'answer_key'
                  ? 'bg-success text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Master Key</span>
            </button>
          </div>

          {/* Primary Action: Direct Download as PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title={`Download ${activeVersion.versionLabel} as a PDF file`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isPdfGenerating ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>

          {/* Download All Sets if multiple exist */}
          {exam.versions.length > 1 && (
            <button
              onClick={handleDownloadAllSetsPdf}
              disabled={isPdfGenerating}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors cursor-pointer"
              title="Download all sets as separate PDF files"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Download All Sets ({exam.versions.length})</span>
            </button>
          )}

          {/* Secondary Action: Print or Browser Save As PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink hover:text-ink bg-white hover:bg-background border border-line-strong rounded-lg transition-colors shadow-xs cursor-pointer"
            title="Open browser print dialog (select 'Save as PDF' to save)"
          >
            <Printer className="w-3.5 h-3.5 text-ink-secondary" />
            <span>Print / Browser PDF</span>
          </button>

          <button
            onClick={handleDownloadHTML}
            className="p-1.5 text-ink-secondary hover:text-ink hover:bg-surface-secondary rounded-lg transition-colors border border-line cursor-pointer"
            title="Download formatted HTML / Word document"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Export Tip Banner */}
      <div className="no-print bg-primary-50/80 border border-primary-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-primary-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-600 shrink-0" />
          <span>
            <strong>PDF Export:</strong> Click <strong>Download as PDF</strong> to generate and download the file immediately, or use <strong>Print / Browser PDF</strong> and choose <em>"Save as PDF"</em> in your browser printer destination.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-primary-600 uppercase font-semibold bg-white/80 px-2 py-0.5 rounded border border-primary-200/60 shrink-0">
          A4 Formatted
        </span>
      </div>

      {/* Printable Exam Paper Canvas (fluid on small screens, padded on desktop) */}
      <div className="bg-white rounded-xl border border-line-strong p-4 sm:p-8 lg:p-12 shadow-sm font-sans text-ink print:border-0 print:p-0 print:shadow-none">
        {/* University Header */}
        <div className="text-center border-b-2 border-ink pb-4 mb-6">
          <div className="flex justify-center mb-2 print:mb-1">
            <img
              src="/Computer_Engineer_Logo.png"
              alt="Computer Engineering logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <p className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
            {exam.settings.headerInstitution || 'COLLEGE OF ENGINEERING AND ARCHITECTURE'}
          </p>
          <p className="text-xs font-semibold text-ink-secondary mt-0.5">
            {exam.settings.departmentName || 'Department of Computer Engineering'}
          </p>
          <h1 className="text-base sm:text-lg font-bold uppercase text-ink mt-2">
            {exam.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-ink-secondary mt-1">
            <span>{exam.academicYear} · {exam.semester}</span>
            <span>·</span>
            <span className="font-bold text-primary-900">
              {activeVersion.versionLabel} {viewMode === 'answer_key' ? '· MASTER ANSWER KEY' : ''}
            </span>
            <span>·</span>
            <span>Time Limit: {exam.timeLimitMinutes} mins</span>
          </div>
        </div>

        {/* Student Identification & Honor Code (Only in Student Mode) */}
        {viewMode === 'student' && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pb-3 border-b border-line">
              <div className="col-span-2">
                <span className="font-bold">NAME: </span>
                <span className="border-b border-ink-muted inline-block w-3/4">&nbsp;</span>
              </div>
              <div>
                <span className="font-bold">SECTION: </span>
                <span className="border-b border-ink-muted inline-block w-1/2">&nbsp;</span>
              </div>
              <div className="text-right">
                <span className="font-bold">SCORE: </span>
                <span className="border-b border-ink-muted inline-block w-12 font-mono font-bold text-center">
                  &nbsp;
                </span>{' '}
                / {activeVersion.totalPoints}
              </div>
            </div>

            <div className="p-3 bg-background border border-line rounded text-xs space-y-1">
              <strong className="text-ink">General Instructions: </strong>
              <span className="text-ink-secondary leading-relaxed">{exam.instructions}</span>
            </div>

            <div className="text-[10px] text-ink-muted italic border-l-2 border-line-strong pl-3">
              Honor Pledge: "I affirm upon my honor that I have neither given nor received unauthorized aid on this examination."
            </div>
          </div>
        )}

        {/* Examination Questions Section */}
        <div className="space-y-6 pt-2">
          {activeVersion.questions.map((q) => {
            return (
              <div key={q.questionNumber} className="print-break-inside-avoid space-y-2 text-xs">
                {/* Question line */}
                <div className="flex items-start gap-2 leading-relaxed">
                  <span className="font-bold font-mono text-sm shrink-0 w-6">
                    {q.questionNumber}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-ink leading-relaxed whitespace-pre-wrap">
                      {q.questionText}
                      {exam.settings.showPointsPerQuestion && (
                        <span className="font-mono text-ink-muted text-[11px] ml-2 select-none">
                          [{q.points} {q.points === 1 ? 'pt' : 'pts'}]
                        </span>
                      )}
                    </p>

                    {/* Multiple choice options */}
                    {q.choices && q.choices.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1">
                        {q.choices.map((choice, cIdx) => {
                          const letter = String.fromCharCode(65 + cIdx);
                          const isKey = viewMode === 'answer_key' && choice === q.correctAnswerDisplay;
                          return (
                            <div
                              key={cIdx}
                              className={`flex items-start gap-2 p-1.5 rounded ${
                                isKey ? 'bg-success-soft/70 font-bold text-success-fg' : ''
                              }`}
                            >
                              <span className="font-bold font-mono shrink-0">{letter}.</span>
                              <span>{choice}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Matching Type lists */}
                    {q.matchingListA && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 pt-2">
                        <div className="space-y-1">
                          <span className="font-bold text-[11px] text-ink-secondary block mb-1">
                            Column A
                          </span>
                          {q.matchingListA.map((item, idx) => (
                            <div key={item.id} className="flex items-start gap-1.5">
                              <span className="font-bold font-mono">({idx + 1})</span>
                              <span>{item.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <span className="font-bold text-[11px] text-ink-secondary block mb-1">
                            Column B
                          </span>
                          {q.matchingListB?.map((item, idx) => (
                            <div key={item.id} className="flex items-start gap-1.5">
                              <span className="font-bold font-mono">
                                ({String.fromCharCode(65 + idx)})
                              </span>
                              <span>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {q.codeSnippet && (
                      <div className="pt-1">
                        <CodeViewer code={q.codeSnippet} language={q.programmingLanguage || 'c'} />
                      </div>
                    )}

                    {/* Flowchart content */}
                    {q.flowchartContent && (
                      <div className="p-3 bg-ink text-success-accent font-mono text-[11px] rounded overflow-x-auto whitespace-pre leading-snug">
                        {q.flowchartContent}
                      </div>
                    )}

                    {/* Sub-questions if algorithm tracing / pseudocode */}
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="pl-3 space-y-1.5 pt-1">
                        {q.subQuestions.map((sq, sIdx) => (
                          <div key={sq.id || sIdx} className="space-y-0.5">
                            <p className="text-ink">
                              <span className="font-semibold">Part ({String.fromCharCode(97 + sIdx)}): </span>
                              {sq.prompt}{' '}
                              <span className="font-mono text-ink-muted text-[10px]">[{sq.points} pts]</span>
                            </p>
                            {viewMode === 'student' ? (
                              <div className="border-b border-dotted border-ink-muted h-6 w-3/4" />
                            ) : (
                              <p className="text-success-fg font-mono font-bold pl-3">
                                Answer: {sq.answer}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Coding Problem Test Case Sample */}
                    {q.sampleInput && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 bg-background border border-line rounded">
                        <div>
                          <strong className="block text-ink-muted font-sans text-[10px]">SAMPLE INPUT:</strong>
                          <pre className="whitespace-pre-wrap">{q.sampleInput}</pre>
                        </div>
                        <div>
                          <strong className="block text-ink-muted font-sans text-[10px]">SAMPLE OUTPUT:</strong>
                          <pre className="whitespace-pre-wrap">{q.sampleOutput}</pre>
                        </div>
                      </div>
                    )}

                    {/* Instructor Answer Key Box (Only visible in Answer Key Mode) */}
                    {viewMode === 'answer_key' && (
                      <div className="p-3 bg-success-soft/90 border border-success-border rounded-lg text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between text-success-fg">
                          <strong className="font-mono">
                            OFFICIAL ANSWER KEY: {q.correctAnswerDisplay}
                          </strong>
                          <span className="font-mono text-[11px]">{q.points} pts</span>
                        </div>
                        {q.explanation && (
                          <p className="text-success-fg text-[11px] whitespace-pre-wrap leading-relaxed pt-1 border-t border-success-border">
                            <strong>Pedagogical Solution:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paper Footer */}
        <div className="mt-12 pt-4 border-t border-line-strong flex items-center justify-between text-[10px] text-ink-muted font-mono">
          <span>End of Examination · BSCpE Accredited</span>
          <span>
            {exam.settings.examCode} · {activeVersion.versionLabel} · Page 1 of 1
          </span>
        </div>
      </div>
    </div>
  );
};
