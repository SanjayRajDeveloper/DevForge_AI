import type { CSSRule } from '../../types';

export interface CSSParseResult {
  rules: CSSRule[];
  duplicateSelectors: string[];
  unusedSelectors: string[];
  totalSelectors: number;
}

export function parseCSS(cssString: string, htmlClasses: string[] = [], htmlIds: string[] = []): CSSParseResult {
  const rules: CSSRule[] = [];
  const duplicateSelectors: string[] = [];
  const unusedSelectors: string[] = [];
  const seenSelectors = new Set<string>();

  // Remove comments
  const cleanCSS = cssString.replace(/\/\*[\s\S]*?\*\//g, '');

  // Simple parser for CSS rules & media queries
  const ruleRegex = /(?:@media[^{]+\{([\s\S]+?)\}\s*\}|([^{]+)\{([^}]+)\})/g;
  let match: RegExpExecArray | null;

  while ((match = ruleRegex.exec(cleanCSS)) !== null) {
    const rawMatch = match[0];
    const rawSelector = match[2]?.trim();
    const rawDeclarations = match[3]?.trim();

    if (!rawSelector || !rawDeclarations) continue;

    const lineStart = cssString.substring(0, match.index).split('\n').length;
    const lineEnd = lineStart + rawMatch.split('\n').length - 1;

    // Check duplicate selectors
    if (seenSelectors.has(rawSelector)) {
      duplicateSelectors.push(rawSelector);
    } else {
      seenSelectors.add(rawSelector);
    }

    const declarations: Record<string, string> = {};
    const decPairs = rawDeclarations.split(';');
    for (const dec of decPairs) {
      const [prop, val] = dec.split(':');
      if (prop && val) {
        const cleanProp = prop.trim().toLowerCase();
        declarations[cleanProp] = val.trim();
      }
    }

    // Unused CSS detection check for simple class or ID selectors
    if (rawSelector.startsWith('.')) {
      const className = rawSelector.substring(1).split(/[\s:>+~]/)[0];
      if (htmlClasses.length > 0 && !htmlClasses.includes(className)) {
        unusedSelectors.push(rawSelector);
      }
    } else if (rawSelector.startsWith('#')) {
      const idName = rawSelector.substring(1).split(/[\s:>+~]/)[0];
      if (htmlIds.length > 0 && !htmlIds.includes(idName)) {
        unusedSelectors.push(rawSelector);
      }
    }

    rules.push({
      selector: rawSelector,
      declarations,
      lineStart,
      lineEnd
    });
  }

  return {
    rules,
    duplicateSelectors,
    unusedSelectors,
    totalSelectors: rules.length
  };
}
