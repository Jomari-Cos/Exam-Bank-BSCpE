import { jsPDF } from 'jspdf';
import { Examination, ExamVersion } from '../types';

export interface GeneratePdfOptions {
  exam: Examination;
  version: ExamVersion;
  isAnswerKey: boolean;
}

export function loadBrandLogoDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = '/Computer_Engineer_Logo.png';
  });
}

export async function generateExamPdf({ exam, version, isAnswerKey }: GeneratePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  let currentY = 16;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 16;
      addHeaderBanner();
    }
  };

  const addHeaderBanner = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${exam.courseCode} · ${exam.title} (${version.versionLabel})${isAnswerKey ? ' [MASTER ANSWER KEY]' : ''}`,
      marginX,
      currentY
    );
    currentY += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 6;
  };

  // 1. First Page Main University Header
  try {
    const logoDataUrl = await loadBrandLogoDataUrl();
    if (logoDataUrl) {
      const logoWidth = 26;
      const logoHeight = 26;
      doc.addImage(logoDataUrl, 'PNG', pageWidth / 2 - logoWidth / 2, currentY, logoWidth, logoHeight);
      currentY += logoHeight + 3;
    }
  } catch {
    // Continue with text-only header when the logo cannot be embedded.
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const institution = (exam.settings?.headerInstitution || 'COLLEGE OF ENGINEERING AND ARCHITECTURE').toUpperCase();
  doc.text(institution, pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const dept = exam.settings?.departmentName || 'Department of Computer Engineering';
  doc.text(dept, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  const titleText = `${exam.title.toUpperCase()} (${version.versionLabel})`;
  doc.text(titleText, pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  if (isAnswerKey) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38);
    doc.text('OFFICIAL MASTER ANSWER KEY & GRADING RUBRIC', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  const metaText = `A.Y. ${exam.academicYear} · ${exam.semester} · Total Points: ${version.totalPoints} · Time Limit: ${exam.timeLimitMinutes} minutes`;
  doc.text(metaText, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // Header separator
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 6;

  // 2. Student Information & Instructions (Student mode only)
  if (!isAnswerKey) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);

    // Row 1
    doc.text('NAME: __________________________________________________', marginX, currentY);
    doc.text('SCORE: ________ / ' + version.totalPoints, pageWidth - marginX - 45, currentY);
    currentY += 6;

    // Row 2
    doc.text('STUDENT ID: ____________________', marginX, currentY);
    doc.text('SECTION: ____________', marginX + 65, currentY);
    doc.text('DATE: ____________', pageWidth - marginX - 45, currentY);
    currentY += 6;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 5;

    // Instructions Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, currentY, contentWidth, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('GENERAL INSTRUCTIONS:', marginX + 3, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const instrLines = doc.splitTextToSize(
      exam.instructions || 'Read each question carefully. Write your answers clearly and show relevant work where applicable.',
      contentWidth - 6
    );
    doc.text(instrLines, marginX + 3, currentY + 8);
    currentY += 18;
  }

  // 3. Questions
  version.questions.forEach((q) => {
    checkPageBreak(25);

    // Question number & points
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);

    const ptsStr = exam.settings?.showPointsPerQuestion ? ` [${q.points} pt${q.points === 1 ? '' : 's'}]` : '';
    const qNumText = `${q.questionNumber}.${ptsStr}`;
    doc.text(qNumText, marginX, currentY);

    const qNumWidth = doc.getTextWidth(qNumText) + 2;

    // Question Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const textX = marginX + Math.max(qNumWidth, 10);
    const textAvailableWidth = contentWidth - Math.max(qNumWidth, 10);
    const qLines = doc.splitTextToSize(q.questionText, textAvailableWidth);
    doc.text(qLines, textX, currentY);
    currentY += qLines.length * 4.2 + 2;

    // Choices for Multiple Choice
    if (q.choices && q.choices.length > 0) {
      checkPageBreak(q.choices.length * 5);
      doc.setFontSize(8.5);

      q.choices.forEach((choice, cIdx) => {
        const letter = String.fromCharCode(65 + cIdx);
        const isChoiceCorrect = isAnswerKey && choice === q.correctAnswerDisplay;

        if (isChoiceCorrect) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 120, 60); // Green
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        const choiceText = `${letter}.  ${choice}${isChoiceCorrect ? '  ✓ [CORRECT]' : ''}`;
        const cLines = doc.splitTextToSize(choiceText, contentWidth - 12);
        doc.text(cLines, marginX + 8, currentY);
        currentY += cLines.length * 4;
      });
      currentY += 2;
    }

    // Matching Lists
    if (q.matchingListA && q.matchingListA.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Column A', marginX + 8, currentY);
      doc.text('Column B', marginX + 90, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      const maxRows = Math.max(q.matchingListA.length, q.matchingListB?.length || 0);

      for (let i = 0; i < maxRows; i++) {
        checkPageBreak(5);
        const itemA = q.matchingListA[i];
        const itemB = q.matchingListB ? q.matchingListB[i] : null;

        if (itemA) {
          doc.text(`(${i + 1})  ${itemA.text}`, marginX + 8, currentY);
        }
        if (itemB) {
          doc.text(`(${String.fromCharCode(65 + i)})  ${itemB.text}`, marginX + 90, currentY);
        }
        currentY += 4.5;
      }
      currentY += 2;
    }

    // Code Snippet Block
    if (q.codeSnippet) {
      checkPageBreak(20);
      const codeLines = q.codeSnippet.split('\n');
      const boxHeight = Math.min(codeLines.length * 3.5 + 4, 60);

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(marginX + 6, currentY, contentWidth - 10, boxHeight, 1, 1, 'FD');

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      let codeY = currentY + 3.5;
      for (let i = 0; i < codeLines.length && i < 15; i++) {
        doc.text(codeLines[i].substring(0, 85), marginX + 8, codeY);
        codeY += 3.5;
      }

      currentY += boxHeight + 3;
    }

    // Master Answer Key Box (Answer Key Mode Only)
    if (isAnswerKey) {
      checkPageBreak(18);
      doc.setFillColor(238, 242, 255); // Indigo tint
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(marginX + 6, currentY, contentWidth - 10, 16, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202);
      doc.text(`CORRECT ANSWER: ${q.correctAnswerDisplay || 'Refer to rubric'}`, marginX + 9, currentY + 4.5);

      if (q.explanation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(55, 65, 81);
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 16);
        doc.text(expLines.slice(0, 2), marginX + 9, currentY + 9);
      }

      currentY += 19;
    }

    // Space between questions
    currentY += 3;
  });

  // 4. Page Numbering & Bottom Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    const footerLeft = `BSCpE Examination Question Data Bank · ${exam.courseCode}`;
    doc.text(footerLeft, marginX, pageHeight - 8);

    const footerRight = `Page ${i} of ${totalPages}`;
    doc.text(footerRight, pageWidth - marginX, pageHeight - 8, { align: 'right' });
  }

  // Sanitize filename
  const cleanCode = (exam.courseCode || 'CPE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanTitle = (exam.title || 'Exam').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const cleanVersion = version.versionLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const keySuffix = isAnswerKey ? '_MASTER_ANSWER_KEY' : '';
  const filename = `${cleanCode}_${cleanTitle}_${cleanVersion}${keySuffix}.pdf`;

  // Trigger browser download of PDF file
  doc.save(filename);
}
