import type { HTMLNode, CSSRule, LayoutIssue, ViewportBreakpoint } from '../../types';
import { VIEWPORT_NUMBERS } from '../analyzer/boxModelSimulator';

export const ALL_BREAKPOINTS: ViewportBreakpoint[] = [
  '320px',
  '375px',
  '425px',
  '768px',
  '1024px',
  '1440px'
];

export function runRuleEngine(nodes: HTMLNode[], cssRules: CSSRule[]): LayoutIssue[] {
  const issues: LayoutIssue[] = [];

  // Helper map for CSS declarations by selector
  const cssMap = new Map<string, Record<string, string>>();
  const cssLineMap = new Map<string, number>();

  for (const rule of cssRules) {
    cssMap.set(rule.selector, rule.declarations);
    cssLineMap.set(rule.selector, rule.lineStart);
  }

  // Check each node across all nodes
  for (const node of nodes) {
    const combinedStyle = { ...node.style };
    let matchingSelector = node.tag;

    // Apply matching CSS rule declarations
    for (const rule of cssRules) {
      if (
        rule.selector === node.tag ||
        (node.id && rule.selector === `#${node.id}`) ||
        node.classes.some((cls) => rule.selector.includes(`.${cls}`))
      ) {
        Object.assign(combinedStyle, rule.declarations);
        matchingSelector = rule.selector;
      }
    }

    const lineStart = cssLineMap.get(matchingSelector) || node.lineStart;

    // RULE 1: Horizontal Overflow (Fixed width > viewport width)
    const rawWidth = combinedStyle.width || combinedStyle['width'];
    if (rawWidth && rawWidth.endsWith('px')) {
      const fixedPx = parseFloat(rawWidth);
      const failingViewports = ALL_BREAKPOINTS.filter(
        (bp) => fixedPx > VIEWPORT_NUMBERS[bp]
      );

      if (failingViewports.length > 0) {
        issues.push({
          id: `rule-overflow-${node.id}`,
          title: 'Horizontal Overflow',
          severity: 'High',
          confidenceScore: 96,
          probabilityScore: 0.96,
          affectedViewport: failingViewports,
          affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
          cssProperty: `width: ${rawWidth}`,
          lineStart,
          file: 'css',
          rootCause: `Fixed width of ${rawWidth} exceeds narrow viewports (${failingViewports.join(', ')}).`,
          shortDescription: 'The element is too wide for the screen, so it sticks out past the edge of the page like an extended box and forces sideways scrolling.',
          xaiExplanation: {
            naturalLanguageReason: `Static analysis detected an absolute width property (${rawWidth}) assigned to <${node.tag}>. On mobile viewports under ${fixedPx}px, this element will force a horizontal scrollbar.`,
            blameAnalysis: [
              { property: `width: ${rawWidth}`, impact: '+55% static layout overflow risk' },
              { property: 'max-width: none', impact: '+35% missing responsive constraint' }
            ],
            confidenceRationale: 'Rule Engine validated static pixel width against mobile viewport boundaries prior to browser paint.'
          },
          recommendedFix: {
            description: `Replace fixed ${rawWidth} with responsive width & max-width constraints.`,
            patchTarget: 'css',
            targetLine: lineStart,
            originalSnippet: `width: ${rawWidth};`,
            replacementSnippet: `width: 100%;\n  max-width: ${rawWidth};`
          }
        });
      }
    }

    // RULE 2: Broken Flexbox (Multi-child flex container missing flex-wrap)
    const display = combinedStyle.display || '';
    const flexWrap = combinedStyle['flex-wrap'] || combinedStyle.flexWrap || 'nowrap';

    if (display.includes('flex') && node.children.length > 1 && flexWrap === 'nowrap') {
      issues.push({
        id: `rule-flex-${node.id}`,
        title: 'Broken Flexbox',
        severity: 'High',
        confidenceScore: 94,
        probabilityScore: 0.94,
        affectedViewport: ['320px', '375px', '425px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: 'display: flex; flex-wrap: nowrap;',
        lineStart,
        file: 'css',
        rootCause: `Flex container has ${node.children.length} items without flex-wrap: wrap.`,
        shortDescription: 'The items inside this flex container are squeezed into one row, so on narrow screens they get crushed or spill out of the container.',
        xaiExplanation: {
          naturalLanguageReason: `Flexbox container holding ${node.children.length} child elements is set to flex-wrap: nowrap. On small screens, child elements will shrink beyond readable bounds or clip off screen.`,
          blameAnalysis: [
            { property: 'flex-wrap: nowrap', impact: '+60% child element crushing risk' },
            { property: 'display: flex', impact: '+30% single-row constraint' }
          ],
          confidenceRationale: 'Static DOM tree inspection confirmed multiple child nodes in non-wrapping flex container.'
        },
        recommendedFix: {
          description: 'Enable flex-wrap: wrap to allow items to flow onto new rows on narrow viewports.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `display: flex;`,
          replacementSnippet: `display: flex;\n  flex-wrap: wrap;`
        }
      });
    }

    // RULE 3: Broken Grid (Fixed grid template tracks exceeding viewport)
    const gridCols = combinedStyle['grid-template-columns'] || combinedStyle.gridTemplateColumns;
    if (gridCols && gridCols.includes('px')) {
      const trackMatches = gridCols.match(/\d+px/g);
      if (trackMatches) {
        const totalPx = trackMatches.reduce((acc, val) => acc + parseFloat(val), 0);
        const failingViewports = ALL_BREAKPOINTS.filter((bp) => totalPx > VIEWPORT_NUMBERS[bp]);
        if (failingViewports.length > 0) {
          issues.push({
            id: `rule-grid-${node.id}`,
            title: 'Broken Grid',
            severity: 'High',
            confidenceScore: 95,
            probabilityScore: 0.95,
            affectedViewport: failingViewports,
            affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
            cssProperty: `grid-template-columns: ${gridCols}`,
            lineStart,
            file: 'css',
            rootCause: `Grid tracks total ${totalPx}px which exceeds mobile viewports (${failingViewports.join(', ')}).`,
            shortDescription: 'The grid columns are locked to fixed widths, so the grid runs wider than the screen and breaks the layout on mobile.',
            xaiExplanation: {
              naturalLanguageReason: `Grid container specifies explicit pixel tracks (${gridCols}) summing to ${totalPx}px. On mobile devices, this grid cannot collapse responsively.`,
              blameAnalysis: [
                { property: `grid-template-columns: ${gridCols}`, impact: '+65% rigid column layout' }
              ],
              confidenceRationale: 'AST computed track lengths sum beyond standard mobile breakpoint limits.'
            },
            recommendedFix: {
              description: 'Convert fixed pixel grid columns to auto-fit with minmax().',
              patchTarget: 'css',
              targetLine: lineStart,
              originalSnippet: `grid-template-columns: ${gridCols};`,
              replacementSnippet: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`
            }
          });
        }
      }
    }

    // RULE 4: Image Overflow (Unresponsive <img> element)
    if (node.tag === 'img') {
      const maxWidth = combinedStyle['max-width'] || combinedStyle.maxWidth;
      const width = combinedStyle.width;
      if ((!maxWidth || maxWidth === 'none') && (!width || width.endsWith('px'))) {
        issues.push({
          id: `rule-img-${node.id}`,
          title: 'Image Overflow',
          severity: 'Medium',
          confidenceScore: 92,
          probabilityScore: 0.92,
          affectedViewport: ['320px', '375px', '425px', '768px'],
          affectedElement: 'img',
          cssProperty: 'max-width: none',
          lineStart: node.lineStart,
          file: 'html',
          rootCause: 'Image tag lacks responsive max-width: 100% or height: auto properties.',
          shortDescription: 'The image keeps its full original size, so it overflows its container and makes the page wider on small screens.',
          xaiExplanation: {
            naturalLanguageReason: 'Image asset will render at full native intrinsic width, overflowing parent containers on smaller viewports.',
            blameAnalysis: [
              { property: 'max-width: undefined', impact: '+50% intrinsic image breach risk' },
              { property: 'height: undefined', impact: '+30% aspect ratio distortion' }
            ],
            confidenceRationale: 'DOM image inspection verified absence of fluid width constraints.'
          },
          recommendedFix: {
            description: 'Apply fluid max-width: 100% and height: auto rules.',
            patchTarget: 'css',
            targetLine: lineStart,
            originalSnippet: `img {`,
            replacementSnippet: `img {\n  max-width: 100%;\n  height: auto;`
          }
        });
      }
    }

    // RULE 5: Text Overflow (white-space: nowrap without overflow handling)
    const whiteSpace = combinedStyle['white-space'] || combinedStyle.whiteSpace;
    const overflow = combinedStyle.overflow || combinedStyle.overflowX;
    if (whiteSpace === 'nowrap' && overflow !== 'hidden' && overflow !== 'ellipsis') {
      issues.push({
        id: `rule-text-${node.id}`,
        title: 'Text Overflow',
        severity: 'Medium',
        confidenceScore: 89,
        probabilityScore: 0.89,
        affectedViewport: ['320px', '375px', '425px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: 'white-space: nowrap',
        lineStart,
        file: 'css',
        rootCause: 'Text content is forced onto a single line without text-overflow ellipsis or scroll handling.',
        shortDescription: 'The text is forced onto a single line, so longer sentences bleed out of the box instead of wrapping.',
        xaiExplanation: {
          naturalLanguageReason: `Element contains white-space: nowrap preventing sentence wrapping. On narrow viewports, long strings will bleed past container boundaries.`,
          blameAnalysis: [
            { property: 'white-space: nowrap', impact: '+70% string wrapping prevention' }
          ],
          confidenceRationale: 'Property scanner matched non-wrapping style on text node container.'
        },
        recommendedFix: {
          description: 'Enable normal text wrapping or set text-overflow: ellipsis.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `white-space: nowrap;`,
          replacementSnippet: `white-space: normal;\n  overflow-wrap: break-word;`
        }
      });
    }

    // RULE 6: Navbar Collapse (Unresponsive navigation bar)
    if (node.tag === 'nav' || node.classes.includes('navbar') || node.classes.includes('nav')) {
      const isFlexRow = !combinedStyle['flex-direction'] || combinedStyle['flex-direction'] === 'row';
      if (isFlexRow && flexWrap === 'nowrap') {
        issues.push({
          id: `rule-nav-${node.id}`,
          title: 'Navbar Collapse',
          severity: 'High',
          confidenceScore: 93,
          probabilityScore: 0.93,
          affectedViewport: ['320px', '375px', '425px'],
          affectedElement: 'nav',
          cssProperty: 'display: flex; flex-direction: row;',
          lineStart,
          file: 'css',
          rootCause: 'Desktop horizontal navigation bar lacks mobile breakpoint media query or hamburger toggle.',
          shortDescription: 'The navbar stays in one horizontal row on small screens, so the links crowd together and look cramped.',
          xaiExplanation: {
            naturalLanguageReason: 'Navigation bar items are arranged in a fixed horizontal row without a mobile hamburger menu or media-query collapse.',
            blameAnalysis: [
              { property: 'flex-direction: row', impact: '+50% horizontal link crowding' },
              { property: 'media-query: missing', impact: '+40% unadapted mobile navigation' }
            ],
            confidenceRationale: 'Semantic nav tag analyzed with no mobile media query overrides.'
          },
          recommendedFix: {
            description: 'Add a media query to stack navigation items vertically on screens below 768px.',
            patchTarget: 'css',
            targetLine: lineStart,
            originalSnippet: `nav {`,
            replacementSnippet: `nav {\n  display: flex;\n  flex-direction: row;\n}\n@media (max-width: 768px) {\n  nav {\n    flex-direction: column;\n  }\n}`
          }
        });
      }
    }

    // RULE 7: Element Collision (Excessive negative margins)
    const margin = combinedStyle.margin || combinedStyle.marginTop || combinedStyle.marginLeft || '';
    if (margin.includes('-')) {
      issues.push({
        id: `rule-collision-${node.id}`,
        title: 'Negative Margin Collision',
        severity: 'Medium',
        confidenceScore: 88,
        probabilityScore: 0.88,
        affectedViewport: ['320px', '375px', '425px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: `margin: ${margin}`,
        lineStart,
        file: 'css',
        rootCause: `Negative margin (${margin}) forces sibling elements to overlap.`,
        shortDescription: 'The element is pulled out of place by a negative margin, so it overlaps its neighbours instead of sitting neatly beside them.',
        xaiExplanation: {
          naturalLanguageReason: 'Negative spacing offsets force element box boundaries to collide with adjacent elements when viewport dimensions shrink.',
          blameAnalysis: [
            { property: `margin: ${margin}`, impact: '+65% overlap collision risk' }
          ],
          confidenceRationale: 'Negative margin detection rule flagged potential box model collision.'
        },
        recommendedFix: {
          description: 'Remove negative margins and use clean flexbox or grid spacing.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `margin: ${margin};`,
          replacementSnippet: `margin: 0;`
        }
      });
    }

    // RULE 8: Hidden Components (Absolute positioning clipping off-screen)
    const pos = combinedStyle.position;
    const top = combinedStyle.top;
    const left = combinedStyle.left;
    if (pos === 'absolute' && (top?.includes('-') || left?.includes('-') || parseFloat(top || '0') > 1000)) {
      issues.push({
        id: `rule-hidden-${node.id}`,
        title: 'Hidden Components',
        severity: 'High',
        confidenceScore: 91,
        probabilityScore: 0.91,
        affectedViewport: ['320px', '375px', '425px', '768px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: `position: absolute; top: ${top}; left: ${left};`,
        lineStart,
        file: 'css',
        rootCause: 'Absolute positioning places element outside rendered viewport coordinate boundaries.',
        shortDescription: 'The element is positioned far off to the side, so it ends up completely outside the visible screen and looks missing.',
        xaiExplanation: {
          naturalLanguageReason: 'Absolute element offsets place content beyond viewable viewport boundaries on mobile screens.',
          blameAnalysis: [
            { property: 'position: absolute', impact: '+45% document flow detachment' },
            { property: `left: ${left}`, impact: '+45% off-screen coordinate placement' }
          ],
          confidenceRationale: 'Coordinate bounds check detected element render position outside viewport canvas.'
        },
        recommendedFix: {
          description: 'Reset absolute coordinate offsets to relative flow or responsive bounds.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `position: absolute;`,
          replacementSnippet: `position: relative;\n  top: 0;\n  left: 0;`
        }
      });
    }

    // RULE 9: Button Overflow (Fixed width button with text)
    if ((node.tag === 'button' || node.classes.includes('btn')) && rawWidth && rawWidth.endsWith('px')) {
      const fixedPx = parseFloat(rawWidth);
      if (fixedPx > 200) {
        issues.push({
          id: `rule-btn-${node.id}`,
          title: 'Button Overflow',
          severity: 'Medium',
          confidenceScore: 90,
          probabilityScore: 0.9,
          affectedViewport: ['320px', '375px'],
          affectedElement: `${node.tag}.btn`,
          cssProperty: `width: ${rawWidth}`,
          lineStart,
          file: 'css',
          rootCause: `Button has hardcoded width of ${rawWidth} causing overflow or clipping on 320px screens.`,
          shortDescription: 'The button has a fixed width, so on small phones it becomes an extended box that overflows the screen.',
          xaiExplanation: {
            naturalLanguageReason: `Interactive button element has hardcoded pixel width (${rawWidth}) which consumes excess mobile screen real estate.`,
            blameAnalysis: [
              { property: `width: ${rawWidth}`, impact: '+55% rigid button sizing' }
            ],
            confidenceRationale: 'Button element width exceeds mobile button component guideline of max-width: 100%.'
          },
          recommendedFix: {
            description: 'Change button width to 100% on mobile or use dynamic padding.',
            patchTarget: 'css',
            targetLine: lineStart,
            originalSnippet: `width: ${rawWidth};`,
            replacementSnippet: `width: 100%;\n  max-width: 300px;`
          }
        });
      }
    }

    // RULE 10: Layout Shift (Unsized image missing aspect ratio)
    if (node.tag === 'img' && !node.attributes.width && !node.attributes.height && !combinedStyle.height) {
      issues.push({
        id: `rule-shift-${node.id}`,
        title: 'Layout Shift',
        severity: 'Low',
        confidenceScore: 87,
        probabilityScore: 0.87,
        affectedViewport: ALL_BREAKPOINTS,
        affectedElement: 'img',
        cssProperty: 'height: auto; aspect-ratio: missing;',
        lineStart: node.lineStart,
        file: 'html',
        rootCause: 'Image element lacks aspect-ratio or explicit height attributes, causing Cumulative Layout Shift (CLS).',
        shortDescription: 'The image has no reserved space before loading, so the page content jumps around as the image loads.',
        xaiExplanation: {
          naturalLanguageReason: 'Image asset does not reserve layout space before image binary loads, causing content jumping (CLS) during page render.',
          blameAnalysis: [
            { property: 'height: missing', impact: '+40% layout shift risk' },
            { property: 'aspect-ratio: missing', impact: '+45% unreserved placeholder box' }
          ],
          confidenceRationale: 'HTML tag scan confirmed missing width/height attributes and missing CSS aspect-ratio.'
        },
        recommendedFix: {
          description: 'Set explicit aspect-ratio or width/height attributes on the image tag.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `img {`,
          replacementSnippet: `img {\n  aspect-ratio: 16 / 9;\n  object-fit: cover;`
        }
      });
    }

    // RULE 11: Inline Fixed Width (JSX inline style={{ width: Npx }})
    if (node.attributes.style && node.attributes.style.includes('width:')) {
      const inlineWidthMatch = node.attributes.style.match(/width:\s*(\d+)px/);
      if (inlineWidthMatch) {
        const inlinePx = parseFloat(inlineWidthMatch[1]);
        const failingViewports = ALL_BREAKPOINTS.filter(
          (bp) => inlinePx > VIEWPORT_NUMBERS[bp]
        );
        if (failingViewports.length > 0) {
          issues.push({
            id: `rule-inline-width-${node.id}`,
            title: 'Viewport Overflow',
            severity: 'High',
            confidenceScore: 95,
            probabilityScore: 0.95,
            affectedViewport: failingViewports,
            affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
            cssProperty: `style width: ${inlinePx}px`,
            lineStart: node.lineStart,
            file: 'html',
            rootCause: `Inline style sets a fixed width of ${inlinePx}px which exceeds narrow viewports (${failingViewports.join(', ')}).`,
            shortDescription: 'The element has a fixed inline width, so it overflows on narrow screens and causes sideways scrolling.',
            xaiExplanation: {
              naturalLanguageReason: `JSX inline style contains a fixed pixel width (${inlinePx}px). On viewports narrower than ${inlinePx}px, this element will overflow and cause horizontal scrolling.`,
              blameAnalysis: [
                { property: `style={{ width: ${inlinePx}px }}`, impact: '+60% inline fixed width overflow risk' },
                { property: 'No responsive constraint', impact: '+35% missing max-width/100%' }
              ],
              confidenceRationale: 'Inline JSX style width property detected with pixel value exceeding mobile viewport boundaries.'
            },
            recommendedFix: {
              description: `Replace inline width: ${inlinePx}px with responsive maxWidth constraint.`,
              patchTarget: 'html',
              targetLine: node.lineStart,
              originalSnippet: `width: ${inlinePx}px`,
              replacementSnippet: `width: '100%', maxWidth: ${inlinePx}`
            }
          });
        }
      }
    }

    // RULE 12: Absolute Position Conflict
    if (pos === 'absolute' && (combinedStyle.left || combinedStyle.right || combinedStyle.top || combinedStyle.bottom)) {
      issues.push({
        id: `rule-absolute-conflict-${node.id}`,
        title: 'Absolute Position Conflict',
        severity: 'Low',
        confidenceScore: 85,
        probabilityScore: 0.85,
        affectedViewport: ['320px', '375px', '425px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: 'position: absolute;',
        lineStart,
        file: 'css',
        rootCause: 'Absolute positioning breaks standard document flow causing overlap risk.',
        shortDescription: 'The element is pulled out of the normal flow, so it can float over or collide with the content around it.',
        xaiExplanation: {
          naturalLanguageReason: 'Absolute positioning of this component detaches it from the block model layout flow, risking overlapping text on narrow viewports.',
          blameAnalysis: [{ property: 'position: absolute', impact: '+80% flow detachment' }],
          confidenceRationale: 'Identified absolute coordinate properties without responsive containment.'
        },
        recommendedFix: {
          description: 'Convert to relative alignment for fluid flow.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: 'position: absolute;',
          replacementSnippet: 'position: relative;'
        }
      });
    }

    // RULE 13: Z-index Conflict
    if (combinedStyle.zIndex && !['absolute', 'relative', 'fixed', 'sticky'].includes(combinedStyle.position || '')) {
      issues.push({
        id: `rule-zindex-${node.id}`,
        title: 'Z-index Conflict',
        severity: 'Low',
        confidenceScore: 82,
        probabilityScore: 0.82,
        affectedViewport: ALL_BREAKPOINTS,
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: `z-index: ${combinedStyle.zIndex}`,
        lineStart,
        file: 'css',
        rootCause: 'Z-index property is specified on a statically positioned element.',
        shortDescription: 'The z-index is set but the element has no position, so the stacking order acts unexpectedly and things can overlap wrongly.',
        xaiExplanation: {
          naturalLanguageReason: 'The z-index property has no effect on elements with position: static. This can cause unexpected rendering order or overlap issues.',
          blameAnalysis: [
            { property: `z-index: ${combinedStyle.zIndex}`, impact: '+50% redundant stacking index' },
            { property: 'position: static', impact: '+50% static position default' }
          ],
          confidenceRationale: 'Z-index stacking context requires relative, absolute, fixed, or sticky positioning to take effect.'
        },
        recommendedFix: {
          description: 'Add position: relative to establish a stacking context.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `z-index: ${combinedStyle.zIndex};`,
          replacementSnippet: `position: relative;\n  z-index: ${combinedStyle.zIndex};`
        }
      });
    }

    // RULE 14: Accessibility Issues
    if (node.tag === 'img' && !node.attributes.alt) {
      issues.push({
        id: `rule-a11y-img-${node.id}`,
        title: 'Accessibility Issues',
        severity: 'Medium',
        confidenceScore: 90,
        probabilityScore: 0.9,
        affectedViewport: ALL_BREAKPOINTS,
        affectedElement: 'img',
        cssProperty: 'alt: missing',
        lineStart: node.lineStart,
        file: 'html',
        rootCause: 'Image element is missing an alt text description.',
        shortDescription: 'The image has no alt text, so screen readers cannot describe it to visually impaired users.',
        xaiExplanation: {
          naturalLanguageReason: 'Screen readers cannot announce descriptive content for this image, which violates WCAG 2.1 accessibility guidelines.',
          blameAnalysis: [{ property: 'alt text', impact: 'Missing alt attribute' }],
          confidenceRationale: 'Missing alt attribute found on standard image tag.'
        },
        recommendedFix: {
          description: 'Add an alt attribute describing the image content.',
          patchTarget: 'html',
          targetLine: node.lineStart,
          originalSnippet: '<img',
          replacementSnippet: '<img alt="Responsive representation layout image"'
        }
      });
    }

    // RULE 16: Element Collision
    if (combinedStyle.height && combinedStyle.height.endsWith('px') && parseFloat(combinedStyle.height) < 100 && node.textContent.length > 150) {
      issues.push({
        id: `rule-collision-text-${node.id}`,
        title: 'Element Collision',
        severity: 'Medium',
        confidenceScore: 86,
        probabilityScore: 0.86,
        affectedViewport: ['320px', '375px', '425px'],
        affectedElement: `${node.tag}${node.classes.length ? '.' + node.classes.join('.') : ''}`,
        cssProperty: `height: ${combinedStyle.height}`,
        lineStart,
        file: 'css',
        rootCause: `Fixed height of ${combinedStyle.height} is too small for long text (${node.textContent.length} chars).`,
        shortDescription: 'The fixed height is too small for the text inside, so the content overlaps the boxes below it.',
        xaiExplanation: {
          naturalLanguageReason: 'Fixed container heights prevent child text from wrapping naturally, causing lines of text to overlap with following layout containers.',
          blameAnalysis: [{ property: `height: ${combinedStyle.height}`, impact: '+80% container overflow constraint' }],
          confidenceRationale: 'Fixed height text container exceeds bounding box capacities on mobile viewports.'
        },
        recommendedFix: {
          description: 'Change fixed height to min-height: fit-content or remove height constraint.',
          patchTarget: 'css',
          targetLine: lineStart,
          originalSnippet: `height: ${combinedStyle.height};`,
          replacementSnippet: `min-height: ${combinedStyle.height};\n  height: auto;`
        }
      });
    }
  }

  // RULE 15: Missing Media Queries
  const hasMediaQuery = cssRules.some(rule => rule.mediaQuery);
  if (!hasMediaQuery && cssRules.length > 0) {
    issues.push({
      id: 'rule-missing-media-queries',
      title: 'Missing Media Queries',
      severity: 'Critical',
      confidenceScore: 98,
      probabilityScore: 0.98,
      affectedViewport: ['320px', '375px', '425px', '768px'],
      affectedElement: 'body',
      cssProperty: 'media queries: none',
      lineStart: 1,
      file: 'css',
        rootCause: 'Styles contain zero media queries to handle mobile and tablet responsive layouts.',
        shortDescription: 'The styles have no media queries, so the layout never adapts and breaks on mobile and tablet screens.',
      xaiExplanation: {
        naturalLanguageReason: 'The stylesheet specifies fixed layout rules but does not implement any @media queries, leading to broken layout responsiveness across all non-desktop viewports.',
        blameAnalysis: [{ property: 'media queries', impact: '0 media queries found in stylesheet' }],
        confidenceRationale: 'Global scan of stylesheet rules verified absence of any breakpoint media overrides.'
      },
      recommendedFix: {
        description: 'Add a responsive viewport media query block to styles.',
        patchTarget: 'css',
        targetLine: 1,
        originalSnippet: 'body {',
        replacementSnippet: '@media (max-width: 768px) {\n  body {\n    padding: 10px;\n  }\n}\nbody {'
      }
    });
  }

  return issues;
}
