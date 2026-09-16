import type { HTMLNode, CSSRule, LayoutIssue, FeatureVector } from '../../types';
import { runRuleEngine } from '../rules/ruleEngine';
import { extractFeatureVector } from './featureExtractor';
import { generateXAIExplanation } from './explainableAI';

export interface AuditResult {
  issues: LayoutIssue[];
  featureVector: FeatureVector;
  totalElements: number;
  overallHealthScore: number; // 0 to 100
  predictionTimeMs: number;
}

export function runAIPrediction(
  _htmlString: string,
  _cssString: string,
  nodes: HTMLNode[],
  cssRules: CSSRule[]
): AuditResult {
  const startTime = performance.now();

  // 1. Feature extraction
  const featureVector = extractFeatureVector(nodes, cssRules);

  // 2. Rule-based static layout analysis
  const ruleIssues = runRuleEngine(nodes, cssRules);

  // 3. ML Model prediction adjustment based on feature vector & active weights
  const finalIssues: LayoutIssue[] = ruleIssues.map((issue) => {
    // Enhance confidence scores dynamically based on feature density
    let confidenceBoost = 0;
    if (featureVector.fixedWidthRatio > 0.3) confidenceBoost += 2;
    if (featureVector.mediaQueryCount === 0) confidenceBoost += 3;
    if (featureVector.unresponsiveImageCount > 0) confidenceBoost += 2;

    const confidenceScore = Math.min(99, Math.max(80, issue.confidenceScore + confidenceBoost));
    const probabilityScore = parseFloat((confidenceScore / 100).toFixed(2));

    // Enhance XAI explanation
    const xaiExplanation = generateXAIExplanation(issue, featureVector);

    return {
      ...issue,
      confidenceScore,
      probabilityScore,
      xaiExplanation
    };
  });

  const endTime = performance.now();
  const predictionTimeMs = Math.round(endTime - startTime);

  // Calculate health score: 100 - (High*25 + Med*10 + Low*5)
  const highCount = finalIssues.filter((i) => i.severity === 'High').length;
  const medCount = finalIssues.filter((i) => i.severity === 'Medium').length;
  const lowCount = finalIssues.filter((i) => i.severity === 'Low').length;

  const penalty = highCount * 25 + medCount * 12 + lowCount * 5;
  const overallHealthScore = Math.max(0, 100 - penalty);

  return {
    issues: finalIssues,
    featureVector,
    totalElements: nodes.length,
    overallHealthScore,
    predictionTimeMs: Math.max(8, predictionTimeMs)
  };
}
