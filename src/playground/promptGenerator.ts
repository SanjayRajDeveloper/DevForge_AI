import type { PlaygroundComponent } from './playgroundTypes';

const jsxText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').trim();

const titleCase = (s: string) =>
  s.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

const toComponentName = (s: string) => {
  const cleaned = s.replace(/[^A-Za-z0-9\s]/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const base = parts.length > 0 ? parts.slice(-2).map(p => p[0].toUpperCase() + p.slice(1)).join('') : 'Component';
  return base.replace(/^[0-9]+/, 'G') || 'PromptCard';
};

const COLORS: Record<string, { main: string; soft: string; glow: string }> = {
  blue:   { main: '#3b82f6', soft: 'rgba(59,130,246,0.18)',  glow: 'rgba(59,130,246,0.35)' },
  purple: { main: '#8b5cf6', soft: 'rgba(139,92,246,0.18)',  glow: 'rgba(139,92,246,0.35)' },
  green:  { main: '#10b981', soft: 'rgba(16,185,129,0.18)',  glow: 'rgba(16,185,129,0.35)' },
  red:    { main: '#ef4444', soft: 'rgba(239,68,68,0.18)',   glow: 'rgba(239,68,68,0.35)' },
  orange: { main: '#f97316', soft: 'rgba(249,115,22,0.18)',  glow: 'rgba(249,115,22,0.35)' },
  pink:   { main: '#ec4899', soft: 'rgba(236,72,153,0.18)',  glow: 'rgba(236,72,153,0.35)' },
  teal:   { main: '#14b8a6', soft: 'rgba(20,184,166,0.18)',  glow: 'rgba(20,184,166,0.35)' },
  yellow: { main: '#eab308', soft: 'rgba(234,179,8,0.18)',   glow: 'rgba(234,179,8,0.35)' },
};

const extractQuoted = (p: string): string[] => {
  const out: string[] = [];
  const re = /["'"]([^"'']+)["'"]|"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(p)) !== null) out.push((m[1] || m[2]).trim());
  return out.filter(Boolean);
};

const pickColor = (p: string) => {
  for (const key of Object.keys(COLORS)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(p)) return COLORS[key];
  }
  return COLORS.purple;
};

type Template = {
  match: RegExp;
  name: string;
  build: (ctx: { prompt: string; texts: string[]; c: { main: string; soft: string; glow: string } }) => { code: string; css: string };
};

const baseCardCss = (c: { main: string; soft: string; glow: string }, extra = '') => `
.pg-card {
  max-width: 440px;
  margin: 0 auto;
  padding: 28px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  border: 1px solid ${c.soft};
  box-shadow: 0 0 24px ${c.glow}, 0 0 48px rgba(56, 189, 248, 0.10);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  ${extra}
}

.pg-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e9d5ff;
  background: ${c.soft};
  border-radius: 999px;
  padding: 4px 10px;
  margin-bottom: 14px;
}`;

const TEMPLATES: Template[] = [
  {
    match: /\b(pricing|price|plan|subscription|billing)\b/i,
    name: 'PricingCard',
    build: ({ texts, c }) => {
      const plan = texts[0] ? titleCase(texts[0]) : 'Pro Plan';
      const price = (texts.find(t => /[$€£]\s?\d|\d+\s?(\/|per)\s?mo/i.test(t)) || '$19/mo').replace(/^["']|["']$/g, '');
      const features = ['Unlimited projects', 'Priority support', 'Advanced analytics'];
      return {
        code: `function PricingCard() {
  const features = ${JSON.stringify(features)};
  return (
    <div className="pg-card">
      <span className="pg-badge">AI Prompt Generated</span>
      <h2 className="pg-plan">${jsxText(plan)}</h2>
      <div className="pg-price">${jsxText(price)}</div>
      <ul className="pg-features">
        {features.map(f => (
          <li key={f} className="pg-feature">
            <span className="pg-check">✓</span> {f}
          </li>
        ))}
      </ul>
      <button className="pg-cta">Get Started</button>
    </div>
  );
}`,
        css: `${baseCardCss(c)}
.pg-plan {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin: 0 0 6px;
}

.pg-price {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(90deg, ${c.main}, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 18px;
}

.pg-features {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pg-feature {
  font-size: 14px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pg-check {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: ${c.soft};
  color: ${c.main};
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pg-cta {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: white;
  background: linear-gradient(90deg, ${c.main}, #6366f1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pg-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px ${c.glow};
}`,
      };
    },
  },
  {
    match: /\b(nav\s?bar|navbar|header|navigation|menu\s?bar|topbar)\b/i,
    name: 'NavigationBar',
    build: ({ texts, c }) => {
      const brand = texts[0] ? titleCase(texts[0]) : 'Acme';
      const links = ['Products', 'Pricing', 'Docs', 'Blog'];
      return {
        code: `function NavigationBar() {
  const links = ${JSON.stringify(links)};
  return (
    <nav className="pg-nav">
      <span className="pg-brand">
        <span className="pg-logo-dot" />
        ${jsxText(brand)}
      </span>
      <div className="pg-links">
        {links.map(l => (
          <a key={l} href="#" className="pg-link" onClick={e => e.preventDefault()}>{l}</a>
        ))}
      </div>
      <button className="pg-nav-cta">Sign Up</button>
    </nav>
  );
}`,
        css: `.pg-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 14px 22px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid ${c.soft};
  box-shadow: 0 0 24px ${c.glow};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.pg-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 16px;
  color: #f8fafc;
}

.pg-logo-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(135deg, ${c.main}, #38bdf8);
  box-shadow: 0 0 10px ${c.glow};
}

.pg-links {
  display: flex;
  gap: 18px;
}

.pg-link {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s ease;
}

.pg-link:hover {
  color: ${c.main};
}

.pg-nav-cta {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  background: linear-gradient(90deg, ${c.main}, #6366f1);
}`,
      };
    },
  },
  {
    match: /\b(hero|landing|banner|headline|jumbotron)\b/i,
    name: 'HeroSection',
    build: ({ texts, c }) => {
      const headline = texts[0] ? titleCase(texts[0]) : 'Build Faster Than Ever';
      const sub = 'Ship beautiful interfaces in minutes with ready-made building blocks.';
      return {
        code: `function HeroSection() {
  return (
    <section className="pg-hero">
      <span className="pg-badge">AI Prompt Generated</span>
      <h1 className="pg-hero-title">${jsxText(headline)}</h1>
      <p className="pg-hero-sub">${jsxText(sub)}</p>
      <div className="pg-hero-actions">
        <button className="pg-cta">Start Free Trial</button>
        <button className="pg-ghost">View Demo</button>
      </div>
    </section>
  );
}`,
        css: `.pg-hero {
  max-width: 560px;
  margin: 0 auto;
  padding: 44px 32px;
  text-align: center;
  border-radius: 20px;
  background:
    radial-gradient(600px 200px at 50% -40%, ${c.soft}, transparent),
    rgba(15, 23, 42, 0.92);
  color: #f8fafc;
  border: 1px solid ${c.soft};
  box-shadow: 0 0 32px ${c.glow};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.pg-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e9d5ff;
  background: ${c.soft};
  border-radius: 999px;
  padding: 4px 10px;
  margin-bottom: 16px;
}

.pg-hero-title {
  font-size: 34px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 12px;
  background: linear-gradient(90deg, ${c.main}, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pg-hero-sub {
  font-size: 15px;
  line-height: 1.6;
  color: #cbd5e1;
  margin: 0 0 24px;
}

.pg-hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.pg-cta {
  padding: 12px 22px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  background: linear-gradient(90deg, ${c.main}, #6366f1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pg-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px ${c.glow};
}

.pg-ghost {
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #e2e8f0;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.4);
  transition: border-color 0.15s ease;
}

.pg-ghost:hover {
  border-color: ${c.main};
}`,
      };
    },
  },
  {
    match: /\b(login|log\s?in|sign\s?in|sign\s?up|signup|register|auth|password)\b/i,
    name: 'LoginForm',
    build: ({ texts, c }) => {
      const heading = texts[0] ? titleCase(texts[0]) : 'Welcome Back';
      return {
        code: `function LoginForm() {
  return (
    <form className="pg-card" onSubmit={e => e.preventDefault()}>
      <span className="pg-badge">AI Prompt Generated</span>
      <h2 className="pg-form-title">${jsxText(heading)}</h2>
      <label className="pg-label">Email</label>
      <input className="pg-input" type="email" placeholder="you@example.com" />
      <label className="pg-label">Password</label>
      <input className="pg-input" type="password" placeholder="••••••••" />
      <button className="pg-cta" type="submit">Sign In</button>
      <p className="pg-form-foot">Forgot password?</p>
    </form>
  );
}`,
        css: `${baseCardCss(c)}
.pg-form-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 18px;
  background: linear-gradient(90deg, ${c.main}, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pg-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  margin: 0 0 6px;
}

.pg-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  margin-bottom: 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(2, 6, 23, 0.6);
  color: #f8fafc;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pg-input:focus {
  border-color: ${c.main};
  box-shadow: 0 0 0 3px ${c.soft};
}

.pg-cta {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: white;
  background: linear-gradient(90deg, ${c.main}, #6366f1);
}

.pg-form-foot {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin: 14px 0 0;
}`,
      };
    },
  },
  {
    match: /\b(table|data\s?grid|rows|columns?\s+of\s+data)\b/i,
    name: 'DataTable',
    build: ({ texts, c }) => {
      const title = texts[0] ? titleCase(texts[0]) : 'Recent Orders';
      const rows = [
        ['#1042', 'Shipped', '$129.00'],
        ['#1043', 'Pending', '$54.50'],
        ['#1044', 'Delivered', '$210.75'],
      ];
      return {
        code: `function DataTable() {
  const rows = ${JSON.stringify(rows)};
  return (
    <div className="pg-table-wrap">
      <h3 className="pg-table-title">${jsxText(title)}</h3>
      <table className="pg-table">
        <thead>
          <tr><th>Order</th><th>Status</th><th>Total</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r[0]}>
              <td>{r[0]}</td>
              <td><span className={'pg-pill pg-' + r[1].toLowerCase()}>{r[1]}</span></td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
        css: `.pg-table-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid ${c.soft};
  box-shadow: 0 0 24px ${c.glow};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.pg-table-title {
  font-size: 16px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 14px;
}

.pg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.pg-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.pg-table td {
  padding: 10px;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.pg-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}

.pg-shipped { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.pg-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.pg-delivered { background: ${c.soft}; color: ${c.main}; }`,
      };
    },
  },
  {
    match: /\b(stats?|dashboard|metrics?|analytics|kpi|numbers?)\b/i,
    name: 'StatsGrid',
    build: ({ texts, c }) => {
      const title = texts[0] ? titleCase(texts[0]) : 'This Week';
      const stats = [
        ['Revenue', '$12.4k', '+18%'],
        ['Users', '3,214', '+7%'],
        ['Churn', '1.2%', '-0.4%'],
      ];
      return {
        code: `function StatsGrid() {
  const stats = ${JSON.stringify(stats)};
  return (
    <div className="pg-stats">
      <h3 className="pg-stats-title">${jsxText(title)}</h3>
      <div className="pg-stats-grid">
        {stats.map(([label, value, delta]) => (
          <div key={label} className="pg-stat">
            <span className="pg-stat-label">{label}</span>
            <span className="pg-stat-value">{value}</span>
            <span className="pg-stat-delta">{delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
        css: `.pg-stats {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid ${c.soft};
  box-shadow: 0 0 24px ${c.glow};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.pg-stats-title {
  font-size: 16px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 16px;
}

.pg-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.pg-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.pg-stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.pg-stat-value {
  font-size: 22px;
  font-weight: 800;
  color: ${c.main};
}

.pg-stat-delta {
  font-size: 12px;
  font-weight: 700;
  color: #34d399;
}`,
      };
    },
  },
  {
    match: /\b(testimonial|review|quote|rating|feedback)\b/i,
    name: 'TestimonialCard',
    build: ({ texts, c }) => {
      const quote = texts[0] || 'This tool completely changed how our team ships UI. Absolutely love it.';
      const author = texts[1] ? titleCase(texts[1]) : 'Sarah Chen';
      return {
        code: `function TestimonialCard() {
  return (
    <figure className="pg-card">
      <span className="pg-badge">AI Prompt Generated</span>
      <div className="pg-stars">★★★★★</div>
      <blockquote className="pg-quote">"${jsxText(quote)}"</blockquote>
      <figcaption className="pg-author">
        <span className="pg-avatar">${jsxText(author.charAt(0))}</span>
        <span>
          <strong className="pg-author-name">${jsxText(author)}</strong>
          <span className="pg-author-role">Product Lead, Nova</span>
        </span>
      </figcaption>
    </figure>
  );
}`,
        css: `${baseCardCss(c)}
.pg-stars {
  color: #fbbf24;
  font-size: 16px;
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.pg-quote {
  font-size: 16px;
  line-height: 1.65;
  color: #e2e8f0;
  margin: 0 0 18px;
}

.pg-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, ${c.main}, #6366f1);
}

.pg-author-name {
  display: block;
  font-size: 14px;
  color: #f8fafc;
}

.pg-author-role {
  font-size: 12px;
  color: #94a3b8;
}`,
      };
    },
  },
  {
    match: /\b(todo|to-do|task\s?list|checklist|kanban)\b/i,
    name: 'TaskList',
    build: ({ texts, c }) => {
      const title = texts[0] ? titleCase(texts[0]) : 'Today';
      const tasks = [['Design review', true], ['Ship v2 release', false], ['Update docs', false]];
      return {
        code: `function TaskList() {
  const tasks = ${JSON.stringify(tasks)};
  return (
    <div className="pg-card">
      <span className="pg-badge">AI Prompt Generated</span>
      <h2 className="pg-list-title">${jsxText(title)}</h2>
      <ul className="pg-tasks">
        {tasks.map(([label, done]) => (
          <li key={label} className="pg-task">
            <span className={done ? 'pg-box pg-done' : 'pg-box'}>{done ? '✓' : ''}</span>
            <span className={done ? 'pg-task-label pg-strike' : 'pg-task-label'}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
        css: `${baseCardCss(c)}
.pg-list-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 14px;
  color: #f8fafc;
}

.pg-tasks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pg-task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.pg-box {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid rgba(148, 163, 184, 0.5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}

.pg-done {
  background: ${c.main};
  border-color: ${c.main};
}

.pg-task-label {
  font-size: 14px;
  color: #e2e8f0;
}

.pg-strike {
  text-decoration: line-through;
  color: #64748b;
}`,
      };
    },
  },
  {
    match: /\b(profile|user\s?card|avatar|team\s?member|account)\b/i,
    name: 'ProfileCard',
    build: ({ texts, c }) => {
      const name = texts[0] ? titleCase(texts[0]) : 'Alex Rivera';
      return {
        code: `function ProfileCard() {
  return (
    <div className="pg-card pg-profile">
      <span className="pg-badge">AI Prompt Generated</span>
      <div className="pg-profile-head">
        <span className="pg-avatar-lg">${jsxText(name.charAt(0))}</span>
        <div>
          <h2 className="pg-name">${jsxText(name)}</h2>
          <p className="pg-role">Senior Product Designer</p>
        </div>
      </div>
      <div className="pg-profile-stats">
        <div><strong>128</strong><span>Projects</span></div>
        <div><strong>4.9k</strong><span>Followers</span></div>
        <div><strong>312</strong><span>Following</span></div>
      </div>
      <button className="pg-cta">Follow</button>
    </div>
  );
}`,
        css: `${baseCardCss(c, 'text-align: center;')}
.pg-profile-head {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  margin-bottom: 18px;
}

.pg-avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, ${c.main}, #38bdf8);
  box-shadow: 0 0 16px ${c.glow};
  flex-shrink: 0;
}

.pg-name {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #f8fafc;
}

.pg-role {
  font-size: 13px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.pg-profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.pg-profile-stats div {
  display: flex;
  flex-direction: column;
  padding: 10px 6px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.55);
}

.pg-profile-stats strong {
  font-size: 16px;
  color: ${c.main};
}

.pg-profile-stats span {
  font-size: 11px;
  color: #94a3b8;
}

.pg-cta {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: white;
  background: linear-gradient(90deg, ${c.main}, #6366f1);
}`,
      };
    },
  },
];

export function generateFromPrompt(prompt: string): PlaygroundComponent | null {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) return null;

  const lower = trimmedPrompt.toLowerCase();
  const texts = extractQuoted(trimmedPrompt);
  const c = pickColor(lower);

  const template = TEMPLATES.find(t => t.match.test(lower));
  let compName: string;
  let built: { code: string; css: string };

  if (template) {
    compName = template.name;
    built = template.build({ prompt: trimmedPrompt, texts, c });
  } else {
    const words = trimmedPrompt.split(/\s+/).filter(Boolean);
    const title = texts[0] ? titleCase(texts[0]) : titleCase(words.slice(0, 6).join(' '));
    const description =
      texts[1] || (words.length > 6 ? words.slice(6).join(' ') : 'Built from your prompt.');
    compName = toComponentName(words.slice(0, 4).join(' ')) || 'PromptCard';
    built = {
      code: `function ${compName}() {
  return (
    <div className="pg-card">
      <span className="pg-badge">AI Prompt Generated</span>
      <h1 className="pg-title">${jsxText(title)}</h1>
      <p className="pg-desc">${jsxText(description)}</p>
    </div>
  );
}`,
      css: `${baseCardCss(c)}
.pg-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 10px;
  background: linear-gradient(90deg, ${c.main}, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pg-desc {
  font-size: 14px;
  line-height: 1.65;
  color: #cbd5e1;
  margin: 0;
}`,
    };
  }

  return {
    id: `custom-${Date.now()}`,
    name: compName,
    code: built.code,
    css: built.css,
    propsJson: '{}',
    isCustom: true,
    aiGenerated: true,
  };
}
