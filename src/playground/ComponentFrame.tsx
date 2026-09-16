import { useEffect, useRef } from 'react';
import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { default as Babel } from '@babel/standalone';

let babelPromise: Promise<typeof Babel> | null = null;
function loadBabel(): Promise<typeof Babel> {
  if (!babelPromise) {
    babelPromise = import('@babel/standalone').then(m => m.default as typeof Babel);
  }
  return babelPromise;
}

interface ComponentFrameProps {
  jsxCode: string;
  cssCode: string;
  propsJson: string;
  componentName: string;
  width: number;
  isLight: boolean;
  isDarkModePreview: boolean;
  isRTLPreview: boolean;
}

export function ComponentFrame({
  jsxCode, cssCode, propsJson, componentName, width,
  isLight, isDarkModePreview, isRTLPreview
}: ComponentFrameProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!host.shadowRoot) host.attachShadow({ mode: 'open' });
    const shadow = host.shadowRoot!;
    shadow.textContent = '';

    const bgColor = isDarkModePreview ? '#090d16' : isLight ? '#f8fafc' : '#0f172a';
    const fgColor = isDarkModePreview ? '#f8fafc' : isLight ? '#0f172a' : '#f8fafc';

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      .render-surface {
        height: 100%;
        min-height: 100%;
        padding: 16px;
        display: flex;
        overflow: auto;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: ${bgColor};
        color: ${fgColor};
      }
      ${isRTLPreview ? `.render-surface { direction: rtl; }` : ''}
      ${cssCode}
    `;
    shadow.appendChild(style);

    const surface = document.createElement('div');
    surface.className = 'render-surface';
    shadow.appendChild(surface);

    const viewport = document.createElement('div');
    viewport.style.width = 'max-content';
    viewport.style.minWidth = '100%';
    viewport.style.margin = 'auto';
    viewport.style.minHeight = '100%';
    viewport.style.display = 'flex';
    viewport.style.justifyContent = 'center';
    viewport.style.alignItems = 'flex-start';
    surface.appendChild(viewport);

    const mount = document.createElement('div');
    viewport.appendChild(mount);

    const root: Root = createRoot(mount);
    let cancelled = false;

    loadBabel().then(Babel => {
      if (cancelled) return;

      try {
        let props: Record<string, any> = {};
        try { props = JSON.parse(propsJson); } catch { /* keep default props */ }

        const compiled = Babel.transform(jsxCode, { presets: ['react'] }).code || '';
        const factory = new Function('React', `${compiled}; return ${componentName};`);
        const Comp = factory(React);

        root.render(React.createElement(Comp, props));
      } catch (e: any) {
        root.render(
          React.createElement('div', {
            style: {
              color: '#f87171',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '8px',
              padding: '12px',
              whiteSpace: 'pre-wrap',
            },
          }, `Error rendering <${componentName} />:\n${String(e?.message || e)}`)
        );
      }
    });

    return () => { cancelled = true; queueMicrotask(() => root.unmount()); };
  }, [jsxCode, cssCode, propsJson, componentName, isLight, isDarkModePreview, isRTLPreview]);

  return (
    <div
      ref={hostRef}
      className="w-full"
      style={{
        width: width > 0 ? `${width}px` : '100%',
        maxWidth: '100%',
        height: '100%',
      }}
    />
  );
}
