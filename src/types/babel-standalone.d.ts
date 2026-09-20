declare module '@babel/standalone' {
  export interface BabelTransformOptions {
    presets?: string[];
    plugins?: string[];
    filename?: string;
    sourceType?: 'script' | 'module' | 'unambiguous';
    [key: string]: any;
  }

  export interface BabelTransformResult {
    code: string | null;
    map?: unknown;
    ast?: unknown;
    [key: string]: any;
  }

  export function transform(code: string, options?: BabelTransformOptions): BabelTransformResult;

  export const availablePlugins: Record<string, unknown>;
  export const availablePresets: Record<string, unknown>;

  const babel: {
    transform: typeof transform;
    availablePlugins: Record<string, unknown>;
    availablePresets: Record<string, unknown>;
    [key: string]: any;
  };

  export default babel;
}
