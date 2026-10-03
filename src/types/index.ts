export type Role = 'admin' | 'faculty' | 'reviewer' | 'examiner';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: Role;
  department: string;
  title: string;
  active: boolean;
  avatarInitials: string;
}

export type CourseCategory = 
  | 'Programming'
  | 'Computer Engineering'
  | 'Computing'
  | 'Advanced Courses'
  | 'Custom';

export interface Course {
  id: string;
  code: string;
  name: string;
  category: CourseCategory;
  description: string;
  credits: number;
  yearLevel: number;
  topics: string[];
  learningOutcomes: string[];
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'coding_problem'
  | 'code_output'
  | 'debugging'
  | 'problem_solving'
  | 'algorithm_tracing'
  | 'pseudocode'
  | 'flowchart';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Archived';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  points: number;
  isHidden?: boolean;
  explanation?: string;
}

export interface MatchingPair {
  id: string;
  itemA: string; // List A
  itemB: string; // List B (correct matching target)
}

export interface TracingStep {
  step: number;
  description: string;
  variableStates: Record<string, string>;
}

export interface SubQuestion {
  id: string;
  prompt: string;
  answer: string;
  points: number;
}

export interface ReviewFeedback {
  id: string;
  reviewerId: string;
  reviewerName: string;
  date: string;
  action: 'Approved' | 'Rejected' | 'Returned';
  comments: string;
  criteriaChecks?: {
    syllabusAligned: boolean;
    clarityVerified: boolean;
    answerKeyVerified: boolean;
    difficultyAppropriate: boolean;
  };
}

export interface QuestionHistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  note?: string;
}

export interface Question {
  id: string; // e.g. Q-CPE-2026-001
  courseId: string;
  courseCode: string;
  courseName: string;
  topic: string;
  type: QuestionType;
  question: string; // Prompt / Instructions / Markdown
  difficulty: Difficulty;
  learningOutcome: string;
  points: number;
  authorId: string;
  authorName: string;
  reviewerId?: string;
  reviewerName?: string;
  academicYear: string;
  semester: string;
  status: QuestionStatus;
  dateCreated: string;
  dateModified: string;
  explanation: string;
  /**
   * Optimistic-concurrency revision counter. Incremented on every successful
   * write so concurrent edits from different devices can be detected and
   * reconciled instead of silently overwriting each other. Defaults to 0.
   */
  revision?: number;
  
  // Multiple Choice
  choices?: string[];
  correctAnswer?: string; // or boolean or string[] depending on type
  randomizeChoices?: boolean;

  // True or False
  trueFalseAnswer?: boolean;

  // Matching Type
  matchingPairs?: MatchingPair[];
  randomizeListB?: boolean;
  matchingInstructions?: string;

  // Fill in the Blanks
  blankCorrectAnswers?: string[]; // primary answers for blanks
  alternativeAnswers?: string[];  // alternative accepted spellings
  isCaseSensitive?: boolean;

  // Coding Problem
  programmingLanguage?: string; // 'C' | 'C++' | 'Python' | 'Java' | 'Verilog/VHDL' | 'x86 Assembly'
  problemDescription?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: TestCase[];
  expectedSolution?: string;

  // Code Output
  codeSnippet?: string;
  expectedOutput?: string;

  // Debugging
  buggyCode?: string;
  expectedCorrection?: string;
  bugExplanation?: string;

  // Problem Solving
  expectedAnswer?: string;

  // Algorithm Tracing
  tracingAlgorithm?: string;
  tracingSteps?: TracingStep[];
  subQuestions?: SubQuestion[];

  // Pseudocode
  pseudocodeContent?: string;

  // Flowchart
  flowchartType?: 'ascii' | 'svg' | 'description';
  flowchartContent?: string;

  // Review & History
  reviews?: ReviewFeedback[];
  history?: QuestionHistoryEntry[];
}

export interface ExamVersionQuestion {
  originalQuestionId: string;
  questionNumber: number;
  questionText: string;
  type: QuestionType;
  points: number;
  difficulty: Difficulty;
  topic: string;
  choices?: string[]; // shuffled if enabled
  matchingListA?: { id: string; text: string }[];
  matchingListB?: { id: string; text: string }[]; // shuffled if enabled
  codeSnippet?: string;
  programmingLanguage?: string;
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  flowchartContent?: string;
  subQuestions?: SubQuestion[];
  // Reference for examiner
  correctAnswerDisplay: string;
  explanation: string;
  testCases?: TestCase[];
}

export interface ExamVersion {
  versionLabel: string; // 'Set A' | 'Set B' | 'Set C'
  questions: ExamVersionQuestion[];
  totalPoints: number;
}

export interface Examination {
  id: string; // EXAM-CPE-2026-01
  title: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  term: 'Prelim' | 'Midterm' | 'Semi-Final' | 'Final';
  academicYear: string;
  semester: string;
  instructions: string;
  timeLimitMinutes: number;
  totalPoints: number;
  questionCount: number;
  selectedQuestionIds: string[];
  versions: ExamVersion[];
  dateCreated: string;
  authorId: string;
  authorName: string;
  settings: {
    randomizeQuestions: boolean;
    randomizeChoices: boolean;
    headerInstitution: string;
    departmentName: string;
    examCode: string;
    showPointsPerQuestion: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  targetType: 'Question' | 'Course' | 'User' | 'Examination' | 'Settings';
  targetId?: string;
  details: string;
}

export interface SystemSettings {
  academicYear: string;
  currentSemester: string;
  gradingTerms: string[];
  institutionName: string;
  departmentName: string;
  defaultTimeLimitMinutes: number;
  requireReviewBeforeExam: boolean;
  minReviewersRequired: number;
}

/**
 * A lightweight real-time presence record written to the `presence` collection.
 * One document per open browser session (tab/device) allows every device to see
 * which personnel are currently online and on what kind of device.
 */
export interface PresenceEntry {
  id: string; // session id (stable per browser tab)
  userId: string;
  userName: string;
  role: Role;
  device: string;
  lastSeen: number; // epoch millis
}
