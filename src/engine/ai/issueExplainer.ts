import type { LayoutIssue, ViewportBreakpoint } from '../../types';

const VIEWPORT_PX: Record<string, number> = {
  '320px': 320,
  '375px': 375,
  '425px': 425,
  '768px': 768,
  '1024px': 1024,
  '1440px': 1440,
};

function extractPx(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*px/);
  return m ? parseFloat(m[1]) : null;
}

function worstViewport(issue: LayoutIssue, requested?: string): ViewportBreakpoint {
  if (requested && issue.affectedViewport.includes(requested as ViewportBreakpoint)) {
    return requested as ViewportBreakpoint;
  }
  const failing = [...issue.affectedViewport].sort(
    (a, b) => (VIEWPORT_PX[a] ?? parseInt(a)) - (VIEWPORT_PX[b] ?? parseInt(b))
  );
  return failing[0] || '375px';
}

function sentence(issue: LayoutIssue, vp: string, vpPx: number, widthPx: number | null): string {
  const element = issue.affectedElement;
  const decl = issue.cssProperty;
  const overflow = widthPx != null ? Math.max(0, Math.round(widthPx - vpPx)) : null;
  const fixed = widthPx != null ? `${widthPx}px` : 'a fixed size';

  switch (issue.title) {
    case 'Horizontal Overflow':
    case 'Viewport Overflow':
      return overflow != null && overflow > 0
        ? `At ${vp} the viewport is only ${vpPx}px wide, but \`${element}\` is locked to ${fixed} by "${decl}", exceeding the viewport by ${overflow}px.`
        : `At ${vp} the ${vpPx}px viewport is too narrow for \`${element}\` because "${decl}" sets ${fixed} with no fluid fallback.`;
    case 'Image Overflow':
      return overflow != null && overflow > 0
        ? `At ${vp} the image inside \`${element}\` is ${fixed} wide (${overflow}px beyond the ${vpPx}px viewport) via "${decl}", so it bleeds past the container edge.`
        : `At ${vp} the image in \`${element}\` escapes its container because "${decl}" forces ${fixed} instead of a fluid max-width.`;
    case 'Text Overflow':
      return overflow != null && overflow > 0
        ? `At ${vp} the text inside \`${element}\` needs ${widthPx}px (from "${decl}") but only ${vpPx}px is available — ${overflow}px overflow — so content is clipped or spills.`
        : `At ${vp} the ${vpPx}px viewport cannot fit the text inside \`${element}\` because "${decl}" prevents wrapping.`;
    case 'Button Overflow':
      return overflow != null && overflow > 0
        ? `At ${vp} the button inside \`${element}\` is ${widthPx}px wide (from "${decl}") — ${overflow}px wider than the ${vpPx}px viewport — so it sticks out of the layout.`
        : `At ${vp} the button in \`${element}\` overflows the ${vpPx}px viewport because "${decl}" fixes its width instead of letting it shrink.`;
    case 'Navbar Collapse':
      return overflow != null && overflow > 0
        ? `At ${vp} the nav bar \`${element}\` is ${widthPx}px wide (${overflow}px over the ${vpPx}px viewport) via "${decl}", forcing horizontal scrolling or hiding the CTA.`
        : `At ${vp} the links in \`${element}\` cannot fit the ${vpPx}px viewport because "${decl}" keeps the nav rigid instead of collapsing to a menu.`;
    case 'Hidden Components':
      return `At ${vp} \`${element}\` gets pushed out of the visible ${vpPx}px area because "${decl}" leaves no room for it once sibling content wraps or overflows.`;
    case 'Element Collision':
      return `At ${vp} \`${element}\` collides with adjacent elements because "${decl}" fixes its size while the ${vpPx}px viewport forces everything closer together.`;
    case 'Broken Flexbox':
      return `At ${vp} \`${element}\` cannot be laid out by the flex container because "${decl}" stops it from shrinking below ${widthPx != null ? widthPx : 'its fixed size'}px in the ${vpPx}px viewport — flex-wrap or a shrinkable basis is missing.`;
    case 'Broken Grid':
      return widthPx != null && widthPx > vpPx
        ? `At ${vp} the grid track inside \`${element}\` is ${widthPx}px (${Math.round(widthPx - vpPx)}px wider than the ${vpPx}px viewport) because "${decl}" sets rigid tracks with no minmax()/auto-fit fallback.`
        : `At ${vp} the grid in \`${element}\` overflows because "${decl}" defines fixed tracks that exceed the ${vpPx}px viewport.`;
    case 'Layout Shift':
      return `At ${vp} \`${element}\` shifts the layout because "${decl}" reserves ${widthPx != null ? widthPx + 'px' : 'fixed'} space that the ${vpPx}px viewport cannot honour, causing content to jump when media queries or fonts load.`;
    case 'Absolute Position Conflict':
      return `At ${vp} \`${element}\` is absolutely positioned (via "${decl}") and its fixed offset exceeds the ${vpPx}px viewport, overlapping or leaving the visible area.`;
    case 'Z-index Conflict':
      return `At ${vp} \`${element}\` covers other content because "${decl}" raises its stacking context, and at ${vpPx}px the compressed layout brings the layers together.`;
    case 'Negative Margin Collision':
      return `At ${vp} \`${element}\` uses a negative margin (from "${decl}") that pulls neighbours over it when the ${vpPx}px viewport tightens the available space.`;
    case 'Missing Media Queries':
      return `At ${vp} \`${element}\` has no media-query breakpoint ("${decl}" is the only rule), so the ${vpPx}px viewport receives desktop styling instead of a mobile layout.`;
    case 'Accessibility Issues':
      return `At ${vp} \`${element}\` fails accessibility because "${decl}" (or missing attributes on it) reduce contrast, tap targets or text readability at ${vpPx}px.`;
    default:
      return widthPx != null && widthPx > vpPx
        ? `At ${vp} \`${element}\` needs ${widthPx}px of space (from "${decl}") but only ${vpPx}px is available, so the layout fails.`
        : `At ${vp} \`${element}\` misbehaves in the ${vpPx}px viewport because of "${decl}".`;
  }
}

export function generateIssueExplanation(issue: LayoutIssue, requestedViewport?: string): string {
  const vp = worstViewport(issue, requestedViewport);
  const vpPx = VIEWPORT_PX[vp] ?? parseInt(vp);
  const widthPx =
    extractPx(issue.cssProperty) ??
    extractPx(issue.recommendedFix.originalSnippet);

  const why = sentence(issue, vp, vpPx, widthPx);

  const root = issue.rootCause
    ? issue.rootCause.charAt(0).toLowerCase() + issue.rootCause.slice(1)
    : 'the element uses fixed sizing that does not adapt to narrow screens';

  const fix = issue.recommendedFix.description
    ? `${issue.recommendedFix.description}`
    : 'switching the fixed rule to a fluid value (max-width, % or min())';

  return `${why} The underlying cause: ${root}. Applying the recommended fix — ${fix} — lets ${issue.affectedElement} scale with the viewport instead of overflowing.`;
}
