export type ViewportBreakpoint = '320px' | '375px' | '425px' | '768px' | '1024px' | '1440px';

export interface ViewportConfig {
  id: ViewportBreakpoint;
  name: string;
  width: number;
  height: number;
  device: string;
}

export interface ParsedStyle {
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  display?: string;
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  gridTemplateColumns?: string;
  gridGap?: string;
  gap?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  whiteSpace?: string;
  fontSize?: string;
  [key: string]: string | undefined;
}

export interface HTMLNode {
  id: string;
  tag: string;
  classes: string[];
  attributes: Record<string, string>;
  style: ParsedStyle;
  children: HTMLNode[];
  textContent: string;
  rawHtml: string;
  lineStart: number;
  lineEnd: number;
}

export interface CSSRule {
  selector: string;
  declarations: Record<string, string>;
  mediaQuery?: string;
  lineStart: number;
  lineEnd: number;
}

export interface ComputedBox {
  nodeId: string;
  tag: string;
  selector: string;
  computedWidth: number;
  computedHeight: number;
  parentWidth: number;
  viewportWidth: number;
  isOverflowingX: boolean;
  isOverflowingY: boolean;
  flexWrap: string;
  position: string;
  zIndex: number;
  hasResponsiveWidth: boolean;
  hasResponsiveImg: boolean;
  lineRef: number;
}

export type FailureTarget =
  | 'Horizontal Overflow'
  | 'Broken Flexbox'
  | 'Broken Grid'
  | 'Image Overflow'
  | 'Navbar Collapse'
  | 'Text Overflow'
  | 'Button Overflow'
  | 'Hidden Components'
  | 'Element Collision'
  | 'Layout Shift'
  | 'Viewport Overflow'
  | 'Absolute Position Conflict'
  | 'Z-index Conflict'
  | 'Negative Margin Collision'
  | 'Missing Media Queries'
  | 'Accessibility Issues';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface LayoutIssue {
  id: string;
  title: FailureTarget;
  severity: SeverityLevel;
  confidenceScore: number; // 0 to 100
  probabilityScore: number; // 0 to 1
  affectedViewport: ViewportBreakpoint[];
  affectedElement: string; // e.g. "div.hero-banner"
  cssProperty: string; // e.g. "width: 1200px"
  lineStart: number;
  lineEnd?: number;
  file: 'html' | 'css';
  rootCause: string;
  shortDescription?: string;
  xaiExplanation: {
    naturalLanguageReason: string;
    blameAnalysis: { property: string; impact: string }[];
    confidenceRationale: string;
  };
  recommendedFix: {
    description: string;
    patchTarget: 'css' | 'html';
    targetLine: number;
    originalSnippet: string;
    replacementSnippet: string;
  };
}

export interface FeatureVector {
  fixedWidthRatio: number;
  flexWrapMissing: number;
  gridTrackOverflowRatio: number;
  mediaQueryCount: number;
  unresponsiveImageCount: number;
  absolutePositionCount: number;
  negativeMarginCount: number;
  zIndexConflictCount: number;
  nowrapTextCount: number;
  viewportUnitMisuseCount: number;
}

export interface FeedbackItem {
  id: string;
  issueId: string;
  issueTitle: string;
  action: 'accepted' | 'rejected';
  timestamp: string;
  userComment?: string;
}

export interface ResearchMetrics {
  predictionAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  predictionTimeMs: number;
  recommendationAccuracy: number;
  totalAnalyzedElements: number;
  totalIssuesFound: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: FailureTarget;
  html: string;
  css: string;
  js?: string;
  expectedIssue: FailureTarget;
}
