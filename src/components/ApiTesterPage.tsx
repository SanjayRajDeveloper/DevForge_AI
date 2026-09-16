import React, { useState } from 'react';
import {
  ArrowLeft,
  PanelsTopLeft,
  Link2,
  Search,
  Send,
  Trash2,
  Plus,
  Loader2,
  FileJson,
} from 'lucide-react';
import {
  analyzeRepo,
  runApiRequest,
  parseRepoUrl,
  type ApiEndpoint,
  type HttpMethod,
  type ApiTestRequest,
  type ApiTestResponse,
} from '../engine/api/repoEndpoints';

const METHOD_COLORS: Record<HttpMethod, { chip: string; text: string }> = {
  GET: { chip: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40', text: 'text-emerald-500' },
  POST: { chip: 'bg-blue-500/15 text-blue-500 border-blue-500/40', text: 'text-blue-500' },
  PUT: { chip: 'bg-amber-500/15 text-amber-500 border-amber-500/40', text: 'text-amber-500' },
  PATCH: { chip: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/40', text: 'text-cyan-500' },
  DELETE: { chip: 'bg-rose-500/15 text-rose-500 border-rose-500/40', text: 'text-rose-500' },
};

interface ApiTesterPageProps {
  theme: 'light' | 'dark';
  onBack: () => void;
  onOpenWorkspaces: () => void;
}

export const ApiTesterPage: React.FC<ApiTesterPageProps> = ({ theme, onBack, onOpenWorkspaces }) => {
  const isLight = theme === 'light';
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(null);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [scannedFiles, setScannedFiles] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [note, setNote] = useState<string | undefined>();

  const bg = isLight ? 'bg-slate-50' : 'bg-slate-950';
  const panelBg = isLight ? 'bg-white' : 'bg-slate-900';
  const border = isLight ? 'border-slate-200' : 'border-slate-800';
  const text = isLight ? 'text-slate-800' : 'text-slate-100';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';

  const handleAnalyze = async () => {
    setError(null);
    setEndpoints([]);
    setRepo(null);
    setSelectedPath(null);
    setAnalyzing(true);
    try {
      const result = await analyzeRepo(repoUrl);
      const parsed = parseRepoUrl(repoUrl);
      setRepo(parsed);
      setEndpoints(result.endpoints);
      setScannedFiles(result.scannedFiles);
      setNote(result.note);
      setSelectedPath(result.endpoints[0] ? `${result.endpoints[0].method} ${result.endpoints[0].path}` : null);
    } catch (e: any) {
      setError(e?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const activate = (ep: ApiEndpoint) => {
    setSelectedPath(`${ep.method} ${ep.path}`);
    setTestReq(p => ({ ...p, method: ep.method, url: ep.path }));
  };

  const [testReq, setTestReq] = useState<ApiTestRequest>({
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: '',
  });
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<ApiTestResponse | null>(null);

  const sendRequest = async () => {
    if (!repo) return;
    setSending(true);
    try {
      const res = await runApiRequest(testReq, repo.owner, repo.repo);
      setResponse(res);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans overflow-hidden transition-colors ${bg} ${text}`}>
      {/* Header */}
      <header className={`h-18 px-5 flex items-center justify-between border-b shrink-0 ${panelBg} ${border}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWorkspaces}
            className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title="Back to Workspaces"
          >
            <PanelsTopLeft className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-bold">Back to Workspaces</span>
          </button>
          <button
            onClick={onBack}
            className={`p-2.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-bold">Back to Home</span>
          </button>
          <div>
            <h1 className={`font-extrabold text-xl tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              API Endpoint Tester
            </h1>
            <p className={`text-xs font-semibold ${muted}`}>GitHub repo → endpoints → Postman-style testing</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: repo input + endpoints */}
        <div className="lg:w-[46%] xl:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r overflow-hidden ${border}">
          {/* Repo input */}
          <div className={`p-4 border-b ${border}`}>
            <div className="flex items-center space-x-2">
              <div className={`flex-1 flex items-center rounded-lg border px-3 ${panelBg} ${border}`}>
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAnalyze(); }}
                  placeholder="https://github.com/owner/repo"
                  className="w-full py-2 px-2 text-sm font-mono font-semibold bg-transparent focus:outline-none"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !repoUrl.trim()}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white text-sm font-bold flex items-center space-x-1.5 transition-all hover:shadow-md hover:shadow-indigo-600/30 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{analyzing ? 'Analyzing…' : 'Analyze Repo'}</span>
              </button>
            </div>
            {error && (
              <div className={`mt-2 text-xs font-semibold px-2.5 py-2 rounded-lg border ${isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/40 border-rose-800 text-rose-300'}`}>
                {error}
              </div>
            )}
            {repo && (
              <div className={`mt-2 flex items-center justify-between text-xs font-semibold ${muted}`}>
                <span className="font-mono font-bold">
                  {repo.owner}/{repo.repo}
                </span>
                <span>{endpoints.length} endpoints · {scannedFiles.length} files scanned</span>
              </div>
            )}
            {note && (
              <div className={`mt-1.5 text-xs font-semibold ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>{note}</div>
            )}
          </div>

          {/* Endpoint list */}
          <div className="flex-1 overflow-y-auto p-2">
            {endpoints.length === 0 && !analyzing && (
              <div className={`text-center py-10 text-sm font-semibold ${muted}`}>
                {repoUrl
                  ? 'No endpoints yet — analyze a repo to discover its API routes.'
                  : 'Paste a GitHub repo link above to discover its API endpoints.'}
              </div>
            )}
            {endpoints.map(ep => {
              const active = selectedPath === `${ep.method} ${ep.path}`;
              return (
                <button
                  key={`${ep.method} ${ep.path}`}
                  onClick={() => activate(ep)}
                  className={`w-full text-left px-3 py-2 mb-1 rounded-lg border transition-all cursor-pointer flex items-center space-x-2.5 ${
                    active
                      ? isLight
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-indigo-950/50 border-indigo-600/60'
                      : `${panelBg} ${border} hover:border-indigo-300`
                  }`}
                >
                  <span className={`shrink-0 text-[11px] font-extrabold px-2 py-1 rounded-full border ${METHOD_COLORS[ep.method].chip}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold truncate">{ep.path}</span>
                  {ep.description && (
                    <span className={`ml-auto hidden xl:inline text-[11px] font-semibold truncate max-w-[140px] ${muted}`}>
                      {ep.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Postman-style tester */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`px-4 pt-3 border-b flex items-center justify-between ${border}`}>
            <span className={`text-xs font-extrabold uppercase tracking-wider ${muted} flex items-center gap-1.5`}>
              <FileJson className="w-4 h-4" /> Postman-style API Tester
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Request bar */}
            <div className="flex items-center space-x-2">
              <select
                value={testReq.method}
                onChange={e => setTestReq(p => ({ ...p, method: e.target.value as HttpMethod }))}
                className={`rounded-lg border px-2.5 py-2.5 text-sm font-extrabold focus:outline-none cursor-pointer ${METHOD_COLORS[testReq.method].chip} ${panelBg}`}
              >
                {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map(m => (
                  <option key={m} value={m} className={isLight ? 'bg-white' : 'bg-slate-900'}>{m}</option>
                ))}
              </select>
              <div className={`flex-1 flex items-center rounded-lg border px-3 ${panelBg} ${border}`}>
                <input
                  value={testReq.url}
                  onChange={e => setTestReq(p => ({ ...p, url: e.target.value }))}
                  placeholder="/api/users"
                  className="w-full py-2 text-sm font-mono font-semibold bg-transparent focus:outline-none"
                />
              </div>
              <button
                onClick={sendRequest}
                disabled={sending || !repo}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>
            <div className={`text-xs font-semibold ${muted}`}>
              Target: {repo ? <span className="font-mono font-bold">https://api.{repo.repo}.dev{testReq.url || '(no path)'}</span> : 'Analyze a repo first'}
            </div>

            {/* Headers */}
            <div>
              <div className={`flex items-center justify-between mb-1.5`}>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${muted}`}>Headers</span>
                <button
                  onClick={() => setTestReq(p => ({ ...p, headers: [...p.headers, { key: '', value: '' }] }))}
                  className={`text-xs font-extrabold flex items-center space-x-1 cursor-pointer hover:text-indigo-500 ${muted}`}
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-1.5">
                {testReq.headers.map((h, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <input
                      value={h.key}
                      onChange={e => {
                        const next = [...testReq.headers];
                        next[i] = { ...next[i], key: e.target.value };
                        setTestReq(p => ({ ...p, headers: next }));
                      }}
                      placeholder="key"
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold bg-transparent focus:outline-none ${border}`}
                    />
                    <input
                      value={h.value}
                      onChange={e => {
                        const next = [...testReq.headers];
                        next[i] = { ...next[i], value: e.target.value };
                        setTestReq(p => ({ ...p, headers: next }));
                      }}
                      placeholder="value"
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold bg-transparent focus:outline-none ${border}`}
                    />
                    <button
                      onClick={() => setTestReq(p => ({ ...p, headers: p.headers.filter((_, j) => j !== i) }))}
                      className={`p-1.5 rounded border cursor-pointer hover:text-rose-500 hover:border-rose-300 ${muted} ${border}`}
                      title="Remove header"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div>
              <span className={`text-xs font-extrabold uppercase tracking-wider mb-1.5 block ${muted}`}>Body (JSON)</span>
              <textarea
                value={testReq.body}
                onChange={e => setTestReq(p => ({ ...p, body: e.target.value }))}
                rows={3}
                spellCheck={false}
                placeholder={`{\n  "name": "Alpha"\n}`}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-mono font-semibold bg-transparent focus:outline-none resize-y ${border}`}
              />
            </div>

            {/* Response */}
            <div>
              <div className={`flex items-center justify-between mb-1.5`}>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${muted}`}>Response</span>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${muted}`}>
                  {response && !sending && (
                    <>
                      <span className={response.ok ? 'text-emerald-500' : 'text-rose-500'}>Status: {response.status}</span>
                      <span>{response.latencyMs} ms</span>
                    </>
                  )}
                  {sending && <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> sending…</span>}
                </span>
              </div>
              <pre
                className={`rounded-lg border p-3 text-sm font-semibold leading-relaxed overflow-auto max-h-64 font-mono ${
                  isLight ? 'bg-slate-900 text-emerald-300 border-slate-700' : 'bg-black/60 text-emerald-300 border-slate-800'
                } ${!response && !sending ? 'opacity-40' : ''}`}
              >
                {(sending && 'Waiting for response…') || response?.body || 'Send a request to see the JSON response here.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};