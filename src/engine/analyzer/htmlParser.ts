import type { HTMLNode, ParsedStyle } from '../../types';

export interface ParseResult {
  rootNodes: HTMLNode[];
  allNodes: HTMLNode[];
  semanticErrors: string[];
  missingTags: string[];
}

export function parseHTML(htmlString: string): ParseResult {
  const allNodes: HTMLNode[] = [];
  const rootNodes: HTMLNode[] = [];
  const stack: HTMLNode[] = [];
  const semanticErrors: string[] = [];
  const missingTags: string[] = [];

  const tagRegex = /<(\/)?([a-zA-Z0-9-]+)([^>]*)>/g;
  let match: RegExpExecArray | null;

  let nodeCounter = 0;

  // Simple AST scanner with line numbers
  while ((match = tagRegex.exec(htmlString)) !== null) {
    const isClosing = Boolean(match[1]);
    const tagName = match[2].toLowerCase();
    const rawAttrString = match[3];
    const matchIndex = match.index;
    
    // Calculate line number
    const lineStart = htmlString.substring(0, matchIndex).split('\n').length;

    // Void / self-closing HTML tags
    const isSelfClosing = rawAttrString.endsWith('/') || 
      ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName);

    if (isClosing) {
      if (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.tag === tagName) {
          top.lineEnd = lineStart;
          stack.pop();
        } else {
          missingTags.push(`Mismatched closing tag </${tagName}> at line ${lineStart}, expected </${top.tag}>`);
        }
      } else {
        missingTags.push(`Unexpected closing tag </${tagName}> at line ${lineStart}`);
      }
      continue;
    }

    // Parse attributes
    const attributes: Record<string, string> = {};
    let classes: string[] = [];
    let style: ParsedStyle = {};

    const attrRegex = /([a-zA-Z0-9-]+)(?:=["']([^"']*)["'])?/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(rawAttrString)) !== null) {
      const key = attrMatch[1].toLowerCase();
      const val = attrMatch[2] || '';
      attributes[key] = val;

      if (key === 'class') {
        classes = val.split(/\s+/).filter(Boolean);
      } else if (key === 'style') {
        style = parseInlineStyle(val);
      }
    }

    // Create Node
    nodeCounter++;
    const node: HTMLNode = {
      id: attributes.id || `node-${nodeCounter}`,
      tag: tagName,
      classes,
      attributes,
      style,
      children: [],
      textContent: '',
      rawHtml: match[0],
      lineStart,
      lineEnd: lineStart
    };

    // Semantic checks
    if (tagName === 'div' && classes.includes('btn') && !attributes.role) {
      semanticErrors.push(`Non-semantic element <div class="${classes.join(' ')}"> at line ${lineStart} should be a <button>`);
    }
    if (tagName === 'img' && !attributes.alt) {
      semanticErrors.push(`Image tag at line ${lineStart} missing alt attribute`);
    }

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node);
    } else {
      rootNodes.push(node);
    }

    allNodes.push(node);

    if (!isSelfClosing) {
      stack.push(node);
    }
  }

  if (stack.length > 0) {
    stack.forEach(node => {
      missingTags.push(`Unclosed HTML tag <${node.tag}> started at line ${node.lineStart}`);
    });
  }

  return { rootNodes, allNodes, semanticErrors, missingTags };
}

export function parseInlineStyle(styleStr: string): ParsedStyle {
  const result: ParsedStyle = {};
  if (!styleStr) return result;

  const pairs = styleStr.split(';');
  for (const pair of pairs) {
    const [prop, val] = pair.split(':');
    if (prop && val) {
      const cleanProp = prop.trim().replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      result[cleanProp] = val.trim();
    }
  }
  return result;
}
