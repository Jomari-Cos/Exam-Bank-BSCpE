/**
 * Phase 3 of the theme migration: collapse the per-file status/difficulty
 * ternaries onto the centralized helpers in src/lib/navigation.ts.
 * Idempotent: re-running reports 0 replacements.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');

/**
 * Builds a regex matching `className={`<prefix>${ <ternary chain> }`}`.
 *
 * The chain is bounded to non-greedy content that still contains the closing
 * backtick + `}`, so it can never span past the badge it is meant to replace.
 */
function badgeTernary(condition) {
  // The template literal closes as:  ... }`}   (brace, backtick, brace)
  return new RegExp(
    'className=\\{`[^`]*\\$\\{\\s*' + condition + '[\\s\\S]*?\\}`\\}',
    'g',
  );
}

// q.difficulty === 'Easy' ? ... : q.difficulty === 'Medium' ? ... : ...
const DIFFICULTY_BLOCK = badgeTernary("q\\.difficulty === 'Easy'\\s*\\?");
const STATUS_BLOCK = badgeTernary("q\\.status === 'Approved'\\s*\\?");
const ACTION_BLOCK = badgeTernary("\\w+\\.action === 'Approved'\\s*\\?");

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (extname(full) === '.tsx') files.push(full);
  }
})(SRC);

let total = 0;
const touched = [];

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let n = 0;
  let after = before
    .replace(DIFFICULTY_BLOCK, () => {
      n += 1;
      return 'className={difficultyBadgeClass(q.difficulty)}';
    })
    .replace(STATUS_BLOCK, () => {
      n += 1;
      return 'className={statusBadgeClass(q.status)}';
    })
    .replace(ACTION_BLOCK, () => {
      n += 1;
      return 'className={reviewActionBadgeClass(entry.action)}';
    });

  if (after !== before) {
    total += n;
    touched.push(`${file.split(/[\\/]/).pop()} (${n})`);
    writeFileSync(file, after, 'utf8');
  }
}

console.log(`collapsed ${total} badge ternaries`);
if (touched.length) console.log('  ' + touched.join('\n  '));