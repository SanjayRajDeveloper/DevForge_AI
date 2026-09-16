import type { HTMLNode, CSSRule, ComputedBox, ViewportBreakpoint } from '../../types';

export const VIEWPORT_NUMBERS: Record<ViewportBreakpoint, number> = {
  '320px': 320,
  '375px': 375,
  '425px': 425,
  '768px': 768,
  '1024px': 1024,
  '1440px': 1440
};

export function simulateBoxModel(
  node: HTMLNode,
  cssRules: CSSRule[],
  viewportWidth: number,
  parentWidth: number = viewportWidth
): ComputedBox {
  // Merge matching CSS declarations into node style
  const mergedStyle: Record<string, string> = {};
  for (const [k, v] of Object.entries(node.style)) {
    if (v !== undefined) mergedStyle[k] = v;
  }
  let lineRef = node.lineStart;

  // Match class selectors & element tag selectors
  for (const rule of cssRules) {
    let match = false;
    if (rule.selector === node.tag) match = true;
    if (node.id && rule.selector === `#${node.id}`) match = true;
    for (const cls of node.classes) {
      if (rule.selector.includes(`.${cls}`)) match = true;
    }

    if (match) {
      Object.assign(mergedStyle, rule.declarations);
      lineRef = rule.lineStart;
    }
  }

  const rawWidth = mergedStyle.width || 'auto';
  const flexWrap = mergedStyle['flex-wrap'] || mergedStyle.flexWrap || 'nowrap';
  const position = mergedStyle.position || 'static';
  const zIndex = parseInt(mergedStyle['z-index'] || mergedStyle.zIndex || '0', 10);

  // Compute absolute pixel width
  let computedWidth = parentWidth;
  let hasResponsiveWidth = true;

  if (rawWidth.endsWith('px')) {
    computedWidth = parseFloat(rawWidth);
    if (computedWidth > viewportWidth) {
      hasResponsiveWidth = false;
    }
  } else if (rawWidth.endsWith('%')) {
    const pct = parseFloat(rawWidth) / 100;
    computedWidth = parentWidth * pct;
  } else if (rawWidth.endsWith('vw')) {
    const vw = parseFloat(rawWidth) / 100;
    computedWidth = viewportWidth * vw;
  }

  // Image responsiveness check
  let hasResponsiveImg = true;
  if (node.tag === 'img') {
    const maxWidth = mergedStyle['max-width'] || mergedStyle.maxWidth;
    if (!maxWidth || maxWidth === 'none') {
      hasResponsiveImg = false;
    }
  }

  const isOverflowingX = computedWidth > viewportWidth + 1; // 1px threshold tolerance

  return {
    nodeId: node.id,
    tag: node.tag,
    selector: node.classes.length > 0 ? `.${node.classes[0]}` : node.tag,
    computedWidth,
    computedHeight: 100, // estimated default height
    parentWidth,
    viewportWidth,
    isOverflowingX,
    isOverflowingY: false,
    flexWrap,
    position,
    zIndex,
    hasResponsiveWidth,
    hasResponsiveImg,
    lineRef
  };
}
