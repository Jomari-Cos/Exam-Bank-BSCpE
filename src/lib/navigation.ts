import type { Role } from '../types';

export const DEFAULT_VIEW = 'dashboard';

/**
 * Views rendered before role-specific routing in `App.tsx`.
 * These intentionally preserve the app's existing cross-role behavior.
 * NOTE: `exam_list` must stay here — it is rendered as a shared route in
 * `App.tsx`, so omitting it makes a reload from Examination Sets normalize
 * back to the dashboard (looks like a redirect to ADMIN).
 */
const SHARED_VIEWS = new Set([
  'question_bank',
  'exam_generator',
  'exam_list',
  'exam_view',
  'create_question',
]);

const ROLE_VIEWS: Record<Role, Set<string>> = {
  admin: new Set([
    'dashboard',
    'users',
    'courses',
    'topics',
    'review_queue',
    'review_history',
    'my_questions',
    'audit_logs',
    'settings',
  ]),
  faculty: new Set(['dashboard', 'my_questions']),
  reviewer: new Set(['dashboard', 'review_queue', 'review_history']),
  examiner: new Set(['dashboard']),
};

/**
 * Centralized status / difficulty → class mappings.
 *
 * Previously each view carried its own copy-pasted ternary (status colors were
 * duplicated across seven files). Every badge in the app now resolves through
 * here so a status always looks the same everywhere.
 *
 * All classes reference the design tokens declared in `src/index.css`.
 */

/** Question lifecycle status (Draft → Submitted → Approved → Archived). */
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'archived';

const QUESTION_STATUS_MAP: Record<string, StatusTone> = {
  Approved: 'success',
  Published: 'success',
  Submitted: 'warning',
  'Under Review': 'warning',
  Draft: 'neutral',
  Archived: 'archived',
  Rejected: 'danger',
};

const REVIEW_ACTION_MAP: Record<string, StatusTone> = {
  Approved: 'success',
  Published: 'success',
  Submitted: 'warning',
  'Under Review': 'warning',
  Returned: 'warning',
  Draft: 'neutral',
  Archived: 'archived',
  Rejected: 'danger',
};

/**
 * Badge class for a question status. Always paired with the status text so the
 * color is never the only signal.
 */
export function statusBadgeClass(status: string): string {
  const tone = QUESTION_STATUS_MAP[status] ?? 'neutral';
  return `status-badge status-${tone}`;
}

/** Badge class for a reviewer decision recorded in the history/audit trail. */
export function reviewActionBadgeClass(action: string): string {
  const tone = REVIEW_ACTION_MAP[action] ?? 'warning';
  return `status-badge status-${tone}`;
}

/**
 * Difficulty badge. Uses the same restrained light-background/dark-text system;
 * purple is intentionally excluded from the palette.
 */
export function difficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'status-badge status-success';
    case 'Medium':
      return 'status-badge status-info';
    default:
      return 'status-badge status-archived';
  }
}

export interface ParsedRoute {
  view: string;
  editingQuestionId: string | null;
  viewingExamId: string | null;
}

export interface RouteSelection {
  editingQuestionId?: string | null;
  viewingExamId?: string | null;
}

export function isViewAllowedForRole(view: string, role: Role): boolean {
  return SHARED_VIEWS.has(view) || ROLE_VIEWS[role]?.has(view) === true;
}

export function normalizeView(view: string): string {
  const candidate = view.trim();
  if (
    candidate &&
    (SHARED_VIEWS.has(candidate) ||
      Object.values(ROLE_VIEWS).some((views) => views.has(candidate)))
  ) {
    return candidate;
  }
  return DEFAULT_VIEW;
}

function splitHash(hash: string): string[] {
  return hash
    .replace(/^#\/?/, '')
    .split('?')[0]
    .split('/')
    .map((segment) => decodeURIComponent(segment.trim()))
    .filter((segment) => segment.length > 0);
}

export function parseHashRoute(hash: string): ParsedRoute {
  const [rawView, rawParameter] = splitHash(hash);
  const view = normalizeView(rawView ?? '');
  const parameter = rawParameter ?? null;

  return {
    view,
    editingQuestionId: view === 'create_question' ? parameter : null,
    viewingExamId: view === 'exam_view' ? parameter : null,
  };
}

export function buildHashRoute(
  view: string,
  selection: RouteSelection = {}
): string {
  const normalizedView = normalizeView(view);
  const parameter =
    normalizedView === 'create_question'
      ? selection.editingQuestionId
      : normalizedView === 'exam_view'
        ? selection.viewingExamId
        : null;

  const encodedView = encodeURIComponent(normalizedView);
  return parameter
    ? `#/${encodedView}/${encodeURIComponent(parameter)}`
    : `#/${encodedView}`;
}
