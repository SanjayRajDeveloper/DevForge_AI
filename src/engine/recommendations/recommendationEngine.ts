import type { LayoutIssue } from '../../types';

export function applyAutoFix(
  code: string,
  issue: LayoutIssue
): string {
  const fix = issue.recommendedFix;

  if (!fix.originalSnippet || !fix.replacementSnippet) {
    return code;
  }

  const original = fix.originalSnippet.trim();
  const replacement = fix.replacementSnippet.trim();
  const lines = code.split('\n');

  // Replace the snippet on the nearest matching line (window around target line),
  // then across the whole document. Never inserts or deletes lines, so the fixed
  // CSS stays clean and structurally identical to the original.
  const targetIdx = Math.max(0, fix.targetLine - 1);
  const searchStart = Math.max(0, targetIdx - 3);
  const searchEnd = Math.min(lines.length - 1, targetIdx + 10);

  for (let i = searchStart; i <= searchEnd; i++) {
    if (lines[i].includes(original) && !lines[i].includes(replacement)) {
      lines[i] = replaceWithIndent(lines[i], original, replacement);
      return lines.join('\n');
    }
  }

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(original) && !lines[i].includes(replacement)) {
      lines[i] = replaceWithIndent(lines[i], original, replacement);
      return lines.join('\n');
    }
  }

  return code;
}

function replaceWithIndent(
  line: string,
  original: string,
  replacement: string
): string {
  const indent = (line.match(/^\s*/) || [''])[0];
  const parts = replacement.split('\n');
  const indentedReplacement = parts
    .map((part, i) => (i === 0 ? part : indent + part))
    .join('\n');
  return line.replace(original, indentedReplacement);
}
