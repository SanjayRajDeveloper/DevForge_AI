export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  source: string;
  description?: string;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
  fetched: boolean;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, '');
  const m = cleaned.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\/.*/, '');
  if (!owner || !repo) return null;
  return { owner, repo };
}

function demoEndpoints(owner: string, repo: string): ApiEndpoint[] {
  const seed = hashString(`${owner}/${repo}`);
  const resources = ['users', 'projects', 'reports', 'helpers', 'widgets', 'orders'];
  const count = 4 + (seed % 3);
  const endpoints: ApiEndpoint[] = [
    { method: 'GET', path: '/api/health', source: 'demo', description: 'Liveness probe for the service' },
  ];
  for (let i = 0; i < count; i++) {
    const r = resources[(seed + i) % resources.length];
    const verb = (seed >> i) % 4;
    const method = verb === 0 ? 'POST' : verb === 1 ? 'PUT' : verb === 2 ? 'PATCH' : 'DELETE';
    endpoints.push({
      method,
      path: `/api/${r}`,
      source: 'demo',
      description: `Manage ${r} resources`,
    });
    endpoints.push({
      method: 'GET',
      path: `/api/${r}/:id`,
      source: 'demo',
      description: `Fetch one ${r} by id`,
    });
  }
  return endpoints;
}

const EXPRESS_RE = /(?:app|router|route|r)\.(get|post|put|patch|delete|head|options)\(\s*['"`]([^'"`]+)['"`]/gi;
const FLASK_ROUTE_RE = /@\w+\.(?:route|get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/gi;
const FASTAPI_RE = /@(?:app|router)\.(get|post|put|patch|delete|route)\(\s*['"]([^'"]+)['"]/gi;
const NEST_RE = /@(Get|Post|Put|Patch|Delete)(?:Mapping)?\(\s*['"`]?([^'"`)]+)['"`]?/gi;
const SPRING_RE = /@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)["(]([^")]*)[")]/gi;
const SPRING_REQUESTMAPPING_RE = /@RequestMapping\(\s*(?:path\s*=\s*)?['"`]([^'"`]+)['"`]/gi;
const OPENAPI_ROUTE_RE = /["'](\/[^"']+)["']\s*:\s*\{([^]*?)\}/g;
const FETCH_CALL_RE = /(?:fetch|axios\.(?:get|post|put|patch|delete)|\.(?:get|post|put|patch|delete))\(\s*['"`]([^'"`]+)['"`]/gi;

function extractFromSource(text: string, file: string): ApiEndpoint[] {
  const found: ApiEndpoint[] = [];
  const seen = new Set<string>();
  const METHOD_SET = new Set<string>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  const push = (method: string, path: string) => {
    const m = method.toUpperCase();
    if (!METHOD_SET.has(m)) return;
    const p = path.startsWith('/') ? path : `/${path}`;
    const key = `${m} ${p}`;
    if (!seen.has(key)) {
      seen.add(key);
      found.push({ method: m as HttpMethod, path: p.replace(/:[A-Za-z0-9_]+/g, ':id'), source: file });
    }
  };

  for (const m of text.matchAll(EXPRESS_RE)) push(m[1].toUpperCase() as HttpMethod, m[2]);
  for (const m of text.matchAll(FASTAPI_RE)) push(m[0].toUpperCase().includes('ROUTE') ? 'POST' : m[0].toUpperCase().includes('GET') ? 'GET' : ((m[0].match(/(get|post|put|patch|delete)\./i)?.[1] || 'GET').toUpperCase() as HttpMethod), m[1]);
  const flaskMethods = /methods\s*=\s*\[([^\]]*)\]/g.exec(text)?.[0] || '';
  for (const m of text.matchAll(FLASK_ROUTE_RE)) {
    const methodsList = flaskMethods.match(/['"](\w+)['"]/g) || [];
    const methods = methodsList.length ? methodsList.map(s => s.replace(/['"]/g, '')) : ['GET'];
    for (const meth of methods) push(meth.toUpperCase() as HttpMethod, m[1]);
  }
  for (const m of text.matchAll(NEST_RE)) push(m[1].toUpperCase() as HttpMethod, m[2]);
  for (const m of text.matchAll(SPRING_RE)) push(m[1].replace('Mapping', '').toUpperCase() as HttpMethod, m[2]);
  for (const m of text.matchAll(SPRING_REQUESTMAPPING_RE)) {
    for (const meth of ['GET', 'POST', 'PUT', 'DELETE']) push(meth as HttpMethod, m[1]);
  }

  for (const m of text.matchAll(OPENAPI_ROUTE_RE)) {
    const ops = m[2].match(/"(get|post|put|patch|delete|head|options)"/gi) || [];
    for (const op of ops) push(op.replace(/"/g, '').toUpperCase() as HttpMethod, m[1]);
  }

  // Client-side API calls (recognize them when no server routes were declared anywhere)
  if (found.length === 0) {
    for (const m of text.matchAll(FETCH_CALL_RE)) {
      const p = m[1];
      if (/^[/a-zA-Z_]/.test(p) && !p.includes('://') && !p.startsWith('/#') && p.length > 1) {
        push('GET', p);
      }
    }
  }

  return found;
}

function scoreCandidate(path: string): number {
  let s = 0;
  if (/(routes|controllers?|api|endpoints?|handlers?)\//i.test(path)) s += 6;
  if (/(server|app|main|index|launch|entry)\.(ts|js|tsx|jsx|go|py|java|cs)$/i.test(path)) s += 5;
  if (/(openapi|swagger|api[-_.]?docs|redoc)/i.test(path)) s += 8;
  if (/\/(routes|controllers?|api|endpoints?)\//i.test(path)) s += 4;
  if (/\.(graphql|proto|yml|yaml|json)$/i.test(path) && /api/i.test(path)) s += 3;
  if (/\/server\//i.test(path)) s += 2;
  if (/\.(tsx|jsx)$/i.test(path)) s -= 8;
  if (/(node_modules|dist|build|coverage|\.test\.|\.spec\.|\.d\.ts$)/i.test(path)) s -= 50;
  if (/\.(md|txt|lock|env|css|html)$/i.test(path)) s -= 30;
  return s;
}

async function fetchBranchTree(owner: string, repo: string, branch: string): Promise<{ branch: string; paths: string[] }> {
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!treeRes.ok) throw new Error(`Could not read repo tree (${treeRes.status}).`);
  const tree = await treeRes.json();
  const paths: string[] = (tree.tree || [])
    .filter((t: any) => t.type === 'blob')
    .map((t: any) => t.path)
    .filter((p: string) => !p.includes('node_modules') && !p.includes('/dist/'));
  return { branch, paths };
}

async function fetchRepoTree(owner: string, repo: string): Promise<{ branch: string; paths: string[] }> {
  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!metaRes.ok) throw new Error(`Repo not found (${metaRes.status}) — check the link or try a public repo.`);
  const meta = await metaRes.json();
  const branches: string[] = [];
  if (meta.default_branch) {
    branches.push(meta.default_branch);
    if (meta.default_branch !== 'main') branches.push('main');
  } else {
    branches.push('main', 'master');
  }

  let lastErr: any = null;
  for (const b of branches) {
    try {
      return await fetchBranchTree(owner, repo, b);
    } catch (e: any) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Could not read repo tree.');
}

const MAX_FILES = 90;

const RAW_GUESSES = [
  'server.ts', 'server.js', 'server.mjs', 'app.ts', 'app.js', 'app.mjs',
  'index.ts', 'index.js', 'main.ts', 'main.py', 'app.py', 'application.py',
  'routes/index.ts', 'routes/index.js', 'routes/main.py', 'controllers.js',
  'src/server.ts', 'src/server.js', 'src/app.ts', 'src/app.js', 'src/index.ts',
  'src/index.js', 'src/main.ts', 'src/main.py', 'src/routes/index.ts',
  'api/index.ts', 'api/index.js', 'backend/server.ts', 'backend/server.js',
  'backend/app.ts', 'backend/index.ts', 'backend/routes.ts', 'openapi.yaml', 'swagger.yaml',
  'package.json', 'requirements.txt', 'go.mod',
];

async function scanEndpointsFrom(
  owner: string,
  repo: string,
  branch: string,
  paths: string[]
): Promise<{ endpoints: ApiEndpoint[]; scanned: string[] }> {
  const candidateSet = paths.length > 0
    ? paths
    : [...RAW_GUESSES, ...paths];

  const candidates = Array.from(new Set(candidateSet))
    .filter(p => {
      if (/(node_modules|\/dist\/|\.test\.|\.spec\.)/i.test(p)) return false;
      return /\.(ts|js|mjs|cjs|tsx|go|py|java|cs|json|yaml|yml)$/i.test(p) || /(openapi|swagger)/i.test(p);
    })
    .sort((a, b) => scoreCandidate(b) - scoreCandidate(a))
    .slice(0, MAX_FILES);

  const endpoints: ApiEndpoint[] = [];
  const scanned: string[] = [];

  const pool = async <T,>(items: string[], worker: (item: string) => Promise<T>, width: number): Promise<T[]> => {
    const results: T[] = new Array(items.length);
    let cursor = 0;
    const runners = Array.from({ length: Math.min(width, items.length) }, async () => {
      while (cursor < items.length) {
        const idx = cursor;
        cursor += 1;
        results[idx] = await worker(items[idx]);
      }
    });
    await Promise.all(runners);
    return results;
  };

  const texts = await pool(candidates, async pathname => {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${pathname}`
      );
      if (!res.ok) return null;
      const text = await res.text();
      if (text.length > 300_000) return null;
      return text;
    } catch {
      return null;
    }
  }, 8);

  candidates.forEach((pathname, i) => {
    const text = texts[i];
    if (text === null) return;
    scanned.push(pathname);
    endpoints.push(...extractFromSource(text, pathname));
  });

  const byKey = new Map<string, ApiEndpoint>();
  for (const e of endpoints) {
    const key = `${e.method} ${e.path}`;
    if (!byKey.has(key)) byKey.set(key, e);
  }
  return { endpoints: Array.from(byKey.values()), scanned };
}

async function scanRawOnly(owner: string, repo: string): Promise<{ branchUsed: string; endpoints: ApiEndpoint[]; scanned: string[] }> {
  for (const branch of ['main', 'master', 'dev']) {
    const { endpoints, scanned } = await scanEndpointsFrom(owner, repo, branch, []);
    if (endpoints.length > 0) return { branchUsed: branch, endpoints, scanned };
  }
  return { branchUsed: 'main', endpoints: [], scanned: [] };
}

export interface AnalyzeResult {
  info: RepoInfo;
  endpoints: ApiEndpoint[];
  scannedFiles: string[];
  note?: string;
}

export async function analyzeRepo(url: string): Promise<AnalyzeResult> {
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    throw new Error('Invalid link. Paste a full GitHub repo URL like https://github.com/owner/repo');
  }
  const { owner, repo } = parsed;

  let branchUsed = 'main';
  let scanned: string[] = [];
  let endpoints: ApiEndpoint[] = [];
  let apiError: string | null = null;
  let usedApi = false;

  try {
    const { branch, paths } = await fetchRepoTree(owner, repo);
    branchUsed = branch;
    usedApi = true;
    const result = await scanEndpointsFrom(owner, repo, branch, paths);
    endpoints = result.endpoints;
    scanned = result.scanned;
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (/Repo not found/i.test(msg)) throw err; // genuinely wrong URL
    if (/rate limit/i.test(msg)) {
      const rawScan = await scanRawOnly(owner, repo);
      endpoints = rawScan.endpoints;
      scanned = rawScan.scanned;
      branchUsed = rawScan.branchUsed;
      apiError = 'GitHub API rate limit reached — fell back to direct raw file scan.';
    } else {
      // API unreachable (offline / blocked / proxy) -> scan raw files directly
      try {
        const rawScan = await scanRawOnly(owner, repo);
        endpoints = rawScan.endpoints;
        scanned = rawScan.scanned;
        branchUsed = rawScan.branchUsed;
        apiError = 'GitHub API unavailable — fell back to direct raw file scan.';
      } catch {
        throw err;
      }
    }
  }

  if (endpoints.length === 0) {
    return {
      info: { owner, repo, branch: branchUsed, fetched: usedApi },
      endpoints: demoEndpoints(owner, repo),
      scannedFiles: scanned,
      note: apiError
        ? `${apiError} Still no route definitions detected — showing sample endpoints for this repo.`
        : `Scanned ${scanned.length} files but found no route definitions — showing sample endpoints for this repo.`,
    };
  }

  return {
    info: { owner, repo, branch: branchUsed, fetched: usedApi },
    endpoints,
    scannedFiles: scanned,
    note: apiError || undefined,
  };
}

export interface ApiTestRequest {
  method: HttpMethod;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
}

export interface ApiTestResponse {
  status: number;
  latencyMs: number;
  body: string;
  ok: boolean;
}

const eslintHeaders = { 'X-Powered-By': 'SmartLayout API Tester', 'Cache-Control': 'no-store' };

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

async function groqBackendResponse(
  req: ApiTestRequest,
  owner: string,
  repo: string,
  headersObj: Record<string, string>,
  payload: any
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) return null;
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content:
              `You are the live backend server for the GitHub repo ${owner}/${repo}. ` +
              'Given an HTTP request (method, path, headers, body), respond with ONLY the raw JSON response body that this API would really return. ' +
              'Use realistic field names and values that match the domain of the repository and the requested path. ' +
              'Output must be a single valid JSON object — no markdown fences, no explanations.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              method: req.method,
              path: req.url || '/',
              headers: headersObj,
              body: payload ?? (req.body.trim() || null),
            }),
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    return content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim() || null;
  } catch {
    return null;
  }
}

export async function runApiRequest(req: ApiTestRequest, owner: string, repo: string): Promise<ApiTestResponse> {
  const started = Date.now();

  const headersObj: Record<string, string> = {};
  for (const h of req.headers) {
    if (h.key.trim()) headersObj[h.key.trim()] = h.value.trim();
  }

  let payload: any = null;
  try {
    const parsed = JSON.parse(req.body.trim() || '{}');
    payload = parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return {
      status: 400,
      latencyMs: Date.now() - started,
      ok: false,
      body: JSON.stringify(
        { error: 'Invalid JSON in request body.', repo: `${owner}/${repo}`, method: req.method, path: req.url },
        null,
        2
      ),
    };
  }

  if (req.method !== 'GET' && req.method !== 'DELETE' && !req.body.trim()) {
    return {
      status: 422,
      latencyMs: Date.now() - started,
      ok: false,
      body: JSON.stringify(
        { error: `Request body is required for ${req.method}.`, hint: 'Send a JSON object.' },
        null,
        2
      ),
    };
  }

  // Real AI-generated response via Groq (LLM plays the repo's backend server).
  const aiBody = await groqBackendResponse(req, owner, repo, headersObj, payload);
  if (aiBody) {
    let body = aiBody;
    try { body = JSON.stringify(JSON.parse(aiBody), null, 2); } catch { /* keep raw text */ }
    return { status: 200, latencyMs: Date.now() - started, body, ok: true };
  }

  // Fallback: local heuristic simulation.
  const latency = 90 + Math.round(Math.random() * 300);
  await new Promise(r => setTimeout(r, latency));
  const totalLatency = Date.now() - started;
  let status = 200;
  let bodyText: string;

  if (req.method === 'GET') {
    bodyText = JSON.stringify(
      {
        ok: true,
        method: req.method,
        endpoint: req.url,
        requestId: `req_${Date.now().toString(36)}`,
        latencyMs: totalLatency,
        headers: { ...eslintHeaders, 'content-type': 'application/json', ...headersObj },
        data: [
          { id: 1, name: 'Alpha', status: 'active', repo },
          { id: 2, name: 'Beta', status: 'active', repo },
        ],
      },
      null,
      2
    );
  } else {
    bodyText = JSON.stringify(
      {
        ok: true,
        method: req.method,
        endpoint: req.url,
        receivedAt: new Date().toISOString(),
        requestId: `req_${Date.now().toString(36)}`,
        latencyMs: totalLatency,
        message: `Simulated ${req.method} executed against ${owner}/${repo}.`,
        echoedBody: payload,
      },
      null,
      2
    );
  }

  return { status, latencyMs: totalLatency, body: bodyText, ok: status < 400 };
}