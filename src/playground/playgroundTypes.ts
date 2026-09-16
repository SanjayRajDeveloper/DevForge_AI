export interface PlaygroundComponent {
  id: string;
  name: string;
  code: string;
  css: string;
  propsJson?: string;
  isCustom?: boolean;
  aiGenerated?: boolean;
}

export const DEVICE_SIZES = [
  { id: '320px', label: 'Mobile S', width: 320, icon: 'smartphone' as const },
  { id: '375px', label: 'Mobile M', width: 375, icon: 'smartphone' as const },
  { id: '425px', label: 'Mobile L', width: 425, icon: 'smartphone' as const },
  { id: '768px', label: 'Tablet', width: 768, icon: 'tablet' as const },
  { id: '1024px', label: 'Laptop', width: 1024, icon: 'laptop' as const },
  { id: '1440px', label: 'Desktop', width: 1440, icon: 'monitor' as const }
];

export const PLAYGROUND_SAMPLE_COMPONENTS: PlaygroundComponent[] = [
  {
    id: 'hero-card',
    name: 'HeroCard',
    code: `function HeroCard({ title, description, buttonText, badge }) {
  return (
    <div className="hero-card">
      {badge && <span className="badge">{badge}</span>}
      <h1 className="hero-title">{title}</h1>
      <p className="hero-desc">{description}</p>
      <button className="hero-btn">{buttonText}</button>
    </div>
  );
}`,
    css: `.hero-card {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 48px;
  border-radius: 16px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 16px;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 16px;
}

.hero-desc {
  font-size: 18px;
  opacity: 0.85;
  margin: 0 0 28px;
}

.hero-btn {
  width: 100%;
  max-width: 350px;
  padding: 14px 28px;
  background: white;
  color: #1e3a8a;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}

@media (max-width: 600px) {
  .hero-title { font-size: 32px; }
  .hero-card { padding: 32px 24px; }
}`
  },
  {
    id: 'nav-bar',
    name: 'NavigationBar',
    code: `function NavigationBar({ brand, links }) {
  return (
    <nav className="navbar">
      <div className="brand">{brand}</div>
      <ul className="nav-links">
        {links.map((link, i) => (
          <li key={i}><a href={link.href}>{link.label}</a></li>
        ))}
      </ul>
      <button className="cta-btn">Sign Up Free</button>
    </nav>
  );
}`,
    css: `.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 16px 32px;
  background: #0f172a;
  color: white;
}

.brand {
  font-size: 22px;
  font-weight: 700;
  color: #38bdf8;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
}

.cta-btn {
  padding: 8px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}`
  },
  {
    id: 'feature-grid',
    name: 'FeatureGrid',
    code: `function FeatureGrid({ title, features }) {
  return (
    <section className="feature-section">
      <h2 className="section-title">{title}</h2>
      <div className="feature-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card">
            <span className="icon">{f.icon}</span>
            <h3>{f.name}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}`,
    css: `.feature-section {
  padding: 64px 24px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.feature-card {
  flex: 1 1 280px;
  max-width: 420px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 28px;
}

.icon {
  font-size: 32px;
  display: block;
  margin-bottom: 12px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}`
  },
  {
    id: 'product-card',
    name: 'ProductCard',
    code: `function ProductCard({ name, price, rating, image, badge }) {
  return (
    <div className="product-card">
      <div className="img-wrap">
        <img src={image} alt={name} />
        {badge && <span className="badge">{badge}</span>}
      </div>
      <div className="card-body">
        <h3 className="prod-name">{name}</h3>
        <div className="rating">{"★".repeat(Math.floor(rating))} {rating}</div>
        <div className="price-row">
          <span className="price">\${price}</span>
          <button className="add-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}`,
    css: `.product-card {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.img-wrap {
  position: relative;
}

.img-wrap img {
  width: 100%;
  max-width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}

.card-body {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.prod-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating { color: #f59e0b; margin-bottom: 12px; font-size: 14px; }

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.price { font-size: 20px; font-weight: 700; color: #1d4ed8; }

.add-btn {
  padding: 8px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  max-width: 200px;
}`
  },
  {
    id: 'stats-row',
    name: 'StatsRow',
    code: `function StatsRow({ stats }) {
  return (
    <div className="stats-row">
      {stats.map((s, i) => (
        <div key={i} className="stat-item">
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}`,
    css: `.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 40px;
  background: #1e293b;
  justify-content: center;
}

.stat-item {
  flex: 1 1 180px;
  min-width: 0;
  text-align: center;
  color: white;
}

.stat-value {
  font-size: 48px;
  font-weight: 900;
  color: #38bdf8;
}

.stat-label {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
}`
  },
  {
    id: 'data-table',
    name: 'DataTable',
    code: `function DataTable({ title, rows }) {
  return (
    <div className="table-container">
      <h2 className="table-title">{title}</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Revenue</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="name-cell">{row.name}</td>
                <td><span className={\`status \${row.status}\`}>{row.status}</span></td>
                <td>{row.revenue}</td>
                <td className={row.growth > 0 ? 'positive' : 'negative'}>
                  {row.growth > 0 ? '+' : ''}{row.growth}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
    css: `.table-container {
  padding: 32px;
  width: 100%;
  max-width: 1400px;
}

.table-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #475569;
}

.name-cell {
  font-weight: 600;
  color: #0f172a;
}

.status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.status.active { background: #dcfce7; color: #166534; }
.status.inactive { background: #fee2e2; color: #991b1b; }
.status.pending { background: #fef3c7; color: #92400e; }

.positive { color: #16a34a; font-weight: 600; }
.negative { color: #dc2626; font-weight: 600; }`
  }
];

export const PLAYGROUND_SAMPLE_PROPS: Record<string, Record<string, any>> = {
  'hero-card': {
    title: 'Smart Hero Card',
    description: 'AI Powered Responsive Layout Detection for Modern Web Apps',
    buttonText: 'Get Started Free',
    badge: 'IEEE Research 2026'
  },
  'nav-bar': {
    brand: 'SmartLayout AI',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Research', href: '#' },
      { label: 'Docs', href: '#' },
      { label: 'Pricing', href: '#' }
    ]
  },
  'feature-grid': {
    title: 'Why SmartLayout AI?',
    features: [
      { icon: '🧠', name: 'AI Prediction', desc: 'Pre-render layout failure detection' },
      { icon: '⚡', name: 'Real-Time', desc: '< 20ms inference on AST nodes' },
      { icon: '🔧', name: 'Auto Fix', desc: '1-Click responsive CSS patches' }
    ]
  },
  'product-card': {
    name: 'SmartLayout Pro License',
    price: '49.99',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    badge: 'Best Seller'
  },
  'stats-row': {
    stats: [
      { value: '96.5%', label: 'Prediction Accuracy' },
      { value: '<20ms', label: 'Inference Time' },
      { value: '10+', label: 'Failure Targets' },
      { value: '1-Click', label: 'Auto Fix' }
    ]
  },
  'data-table': {
    title: 'Enterprise Dashboard',
    rows: [
      { name: 'SmartLayout Pro', status: 'active', revenue: '$124,500', growth: 23.5 },
      { name: 'LayoutGuard Basic', status: 'active', revenue: '$89,200', growth: 12.1 },
      { name: 'A11y Scanner', status: 'pending', revenue: '$45,800', growth: -5.3 },
      { name: 'GridOptimizer', status: 'inactive', revenue: '$12,300', growth: -18.7 },
      { name: 'FlexMonitor', status: 'active', revenue: '$67,400', growth: 8.9 },
      { name: 'ViewportAI', status: 'active', revenue: '$203,100', growth: 41.2 },
      { name: 'PixelPerfect', status: 'pending', revenue: '$31,500', growth: 2.1 },
      { name: 'ResponsiveKit', status: 'active', revenue: '$156,700', growth: 15.8 }
    ]
  }
};