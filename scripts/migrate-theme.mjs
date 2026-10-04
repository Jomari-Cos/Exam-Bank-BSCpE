/**
 * One-time codemod: migrate hard-coded Tailwind palette classes to the
 * centralized design tokens declared in `src/index.css`.
 *
 * Usage:  node scripts/migrate-theme.mjs [--dry]
 *
 * It only rewrites *color* utility tokens inside className strings; layout,
 * spacing, radius and typography utilities are untouched.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');
const DRY = process.argv.includes('--dry');

/** color-shade -> design token, per family. */
const PALETTE = {
  // Primary accent: indigo -> primary
  'indigo-50': 'primary-50',
  'indigo-100': 'primary-100',
  'indigo-200': 'primary-200',
  'indigo-300': 'primary-300',
  'indigo-400': 'primary-300',
  'indigo-500': 'primary-500',
  'indigo-600': 'primary-600',
  'indigo-700': 'primary-700',
  'indigo-800': 'primary-800',
  'indigo-900': 'primary-900',
  'indigo-950': 'primary-900',
  // Neutrals: slate -> ink / line / surface tokens
  'slate-50': 'background',
  'slate-100': 'surface-secondary',
  'slate-200': 'line',
  'slate-300': 'line-strong',
  'slate-400': 'ink-muted',
  'slate-500': 'ink-muted',
  'slate-600': 'ink-secondary',
  'slate-700': 'ink-secondary',
  'slate-800': 'ink',
  'slate-900': 'ink',
  'slate-950': 'ink',
  // Status: emerald -> success
  'emerald-50': 'success-soft',
  'emerald-100': 'success-soft',
  'emerald-200': 'success-border',
  'emerald-300': 'success-accent',
  'emerald-400': 'success-accent',
  'emerald-500': 'success',
  'emerald-600': 'success',
  'emerald-700': 'success-fg',
  'emerald-800': 'success-fg',
  // Status: amber -> warning
  'amber-50': 'warning-soft',
  'amber-100': 'warning-soft',
  'amber-200': 'warning-border',
  'amber-300': 'warning-accent',
  'amber-400': 'warning-accent',
  'amber-500': 'warning',
  'amber-600': 'warning',
  'amber-700': 'warning-fg',
  'amber-800': 'warning-fg',
  // Status: rose -> danger
  'rose-50': 'danger-soft',
  'rose-100': 'danger-soft',
  'rose-200': 'danger-border',
  'rose-300': 'danger-accent',
  'rose-400': 'danger-accent',
  'rose-500': 'danger',
  'rose-600': 'danger',
  'rose-700': 'danger-fg',
  'rose-800': 'danger-fg',
  // Info: blue -> info
  'blue-50': 'info-soft',
  'blue-100': 'info-soft',
  'blue-200': 'info-border',
  'blue-300': 'info-accent',
  'blue-400': 'info-accent',
  'blue-500': 'info',
  'blue-600': 'info',
  'blue-700': 'info-fg',
  'blue-800': 'info-fg',
  // Purple is not part of the palette: fold it into the neutral/archived ramp
  'purple-50': 'archived-soft',
  'purple-100': 'archived-soft',
  'purple-200': 'archived-border',
  'purple-300': 'archived-fg',
  'purple-400': 'archived-fg',
  'purple-500': 'archived-fg',
  'purple-600': 'archived-fg',
  'purple-700': 'archived-fg',
  'purple-800': 'archived-fg',
  'purple-900': 'ink',
  // red -> danger (destructive actions)
  'red-500': 'danger',
  'red-600': 'danger',
  'red-700': 'danger-fg',
  'red-50': 'danger-soft',
  'red-100': 'danger-soft',
  'red-200': 'danger-border',
};

const UTIL = '(?:[a-z-]+:)*(?:bg|text|border|ring|shadow|divide|outline|placeholder|fill|stroke|from|via|to|decoration|caret|accent)';

/** Rewrites `<util>-<color>-<shade>` (with optional /opacity) to the token. */
const TOKEN_RE = new RegExp(`\\b(${UTIL}-)(${Object.keys(PALETTE).join('|')})(/\\d{1,3})?\\b`, 'g');

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (['.tsx', '.ts'].includes(extname(full))) files.push(full);
  }
})(SRC);

let changedFiles = 0;
let changedTokens = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let count = 0;
  const after = before.replace(TOKEN_RE, (_m, prefix, color, alpha) => {
    count += 1;
    const token = PALETTE[color];
    return `${prefix}${token}${alpha ?? ''}`;
  });
  if (count > 0 && after !== before) {
    changedFiles += 1;
    changedTokens += count;
    if (!DRY) writeFileSync(file, after, 'utf8');
  }
}

console.log(
  `${DRY ? '[dry] ' : ''}rewrote ${changedTokens} color tokens across ${changedFiles} files`,
);