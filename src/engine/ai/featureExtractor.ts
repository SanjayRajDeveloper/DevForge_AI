import type { HTMLNode, CSSRule, FeatureVector } from '../../types';

export function extractFeatureVector(nodes: HTMLNode[], cssRules: CSSRule[]): FeatureVector {
  let fixedWidthCount = 0;
  let flexWrapMissingCount = 0;
  let gridTrackOverflowCount = 0;
  let mediaQueryCount = 0;
  let unresponsiveImageCount = 0;
  let absolutePositionCount = 0;
  let negativeMarginCount = 0;
  let zIndexConflictCount = 0;
  let nowrapTextCount = 0;
  let viewportUnitMisuseCount = 0;

  // Media queries count
  for (const rule of cssRules) {
    if (rule.mediaQuery) mediaQueryCount++;
    const decls = Object.values(rule.declarations);
    for (const val of decls) {
      if (val.includes('100vw')) viewportUnitMisuseCount++;
      if (val.includes('-') && val.includes('px')) negativeMarginCount++;
    }
  }

  // Node feature inspection
  for (const node of nodes) {
    const style = node.style;
    if (style.width && style.width.endsWith('px') && parseFloat(style.width) > 375) {
      fixedWidthCount++;
    }
    if (style.display === 'flex' && style.flexWrap !== 'wrap') {
      flexWrapMissingCount++;
    }
    if (style.position === 'absolute') {
      absolutePositionCount++;
    }
    if (node.tag === 'img' && !style.maxWidth) {
      unresponsiveImageCount++;
    }
    if (style.whiteSpace === 'nowrap') {
      nowrapTextCount++;
    }
    if (style.gridTemplateColumns && style.gridTemplateColumns.includes('px')) {
      gridTrackOverflowCount++;
    }
    if (style.zIndex) {
      zIndexConflictCount++;
    }
  }

  const total = nodes.length || 1;

  return {
    fixedWidthRatio: fixedWidthCount / total,
    flexWrapMissing: flexWrapMissingCount,
    gridTrackOverflowRatio: gridTrackOverflowCount / total,
    mediaQueryCount,
    unresponsiveImageCount,
    absolutePositionCount,
    negativeMarginCount,
    zIndexConflictCount,
    nowrapTextCount,
    viewportUnitMisuseCount
  };
}
