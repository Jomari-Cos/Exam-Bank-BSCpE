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
