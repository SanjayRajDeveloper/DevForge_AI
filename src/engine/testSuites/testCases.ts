import type { TestCase } from '../../types';

export const IEEE_TEST_CASES: TestCase[] = [
  {
    id: 'tc-landing-demo',
    name: '0. NovaTech Landing Page (Small Project Demo)',
    description: 'A small one-page project (navbar, hero, features, stats, products, footer) with a few deliberate responsive layout mistakes and a broken JS handler.',
    category: 'Broken Grid',
    expectedIssue: 'Broken Grid',
    html: `<div class="page">
  <nav class="navbar">
    <div class="logo">NovaTech</div>
    <ul class="nav-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">Features</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
    <button id="menu-toggle" class="menu-btn">☰</button>
  </nav>

  <header class="hero">
    <span class="hero-badge">New: AI Launch Monitor</span>
    <h1>Build Faster With NovaTech Cloud</h1>
    <p>Deploy modern applications with zero-config pipelines and real-time monitoring dashboards for every team.</p>
    <button class="btn btn-primary">Start Free 30-Day Trial</button>
  </header>

  <section class="features">
    <h2>Why Teams Choose NovaTech</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <h3>Instant Deploy</h3>
        <p>Ship to production in under 60 seconds from any laptop.</p>
      </div>
      <div class="feature-card">
        <h3>Global Edge</h3>
        <p>Serve every request from 40+ edge locations worldwide.</p>
      </div>
      <div class="feature-card">
        <h3>Smart Scaling</h3>
        <p>Autoscaling that reacts instantly to traffic spikes.</p>
      </div>
      <div class="feature-card">
        <h3>24/7 Support</h3>
        <p>Real engineers on call around the clock for you.</p>
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="stat"><b>99.99%</b><span>Uptime SLA</span></div>
    <div class="stat"><b>40+</b><span>Edge Regions</span></div>
    <div class="stat"><b>2.4M</b><span>Requests / min</span></div>
    <div class="stat"><b>4.9</b><span>Customer Rating</span></div>
  </section>

  <section class="products">
    <h2>Featured Add-Ons</h2>
    <div class="product-row">
      <div class="product-card">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200" width="1200" height="210" alt="Analytics dashboard preview">
        <div class="product-info">
          <h3>Analytics Pro</h3>
          <p>Deep insights into every single deployment pipeline.</p>
          <button class="btn btn-primary">Buy Now — $49</button>
        </div>
      </div>
      <div class="product-card">
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200" width="1200" height="210" alt="Security shield preview">
        <div class="product-info">
          <h3>Shield Security</h3>
          <p>Zero-trust protection baked into every request layer.</p>
          <button class="btn btn-primary">Buy Now — $79</button>
        </div>
      </div>
    </div>
  </section>

  <div class="alert-banner">
    <span>MAINTENANCE WINDOW: Scheduled platform upgrade begins at 02:00 UTC — plan your deployments accordingly!</span>
  </div>

  <footer class="footer">
    <p>© <span id="current-year">2026</span> NovaTech Inc. All rights reserved.</p>
  </footer>
</div>`,
    css: `.page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 1200px;
  padding: 16px 32px;
  background: #0f172a;
  color: #fff;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  color: #38bdf8;
}

.nav-links {
  display: flex;
  flex-wrap: nowrap;
  list-style: none;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.nav-links a {
  min-width: 90px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
}

.menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
}

.hero {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 32px;
  text-align: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff;
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 16px;
}

.hero h1 {
  font-size: 42px;
  margin: 0 0 14px;
}

.hero p {
  font-size: 17px;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 28px;
}

.btn-primary {
  width: 420px;
  padding: 14px 28px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.features {
  padding: 48px 24px;
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: 380px 380px 380px;
  gap: 20px;
  justify-content: center;
}

.feature-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.feature-card h3 {
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 32px;
  background: #1e293b;
  color: #fff;
}

.stat {
  min-width: 190px;
  text-align: center;
}

.stat b {
  display: block;
  font-size: 40px;
  color: #38bdf8;
}

.stat span {
  font-size: 13px;
  color: #94a3b8;
}

.products {
  padding: 48px 24px;
}

.product-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.product-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.product-card img {
  width: 100%;
  max-width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
}

.product-info {
  padding: 18px;
}

.alert-banner {
  margin: 0 24px 32px;
  background: #991b1b;
  color: #fef2f2;
  padding: 16px;
  border-radius: 8px;
}

.footer {
  padding: 24px;
  text-align: center;
  background: #0f172a;
  color: #94a3b8;
  font-size: 14px;
}`,
    js: `// ── Mobile menu toggle (bug: id mismatch — HTML uses "menu-toggle") ──
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// ── Price formatting helper ──
function formatPrice(amount) {
  return '$' + amount.toFixed(2);
}

// ── Product buy buttons (bug: "price" is never defined) ──
document.querySelectorAll('.product-card .btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    console.log('Selected:', formatPrice(price));
  });
});

// ── Auto-update footer year ──
document.getElementById('current-year').textContent = new Date().getFullYear();
`
  },
  {
    id: 'tc-overflow',
    name: '1. Horizontal Overflow (Fixed Width)',
    description: 'Hero card has hardcoded width: 1200px causing horizontal scrollbar on mobile screens.',
    category: 'Horizontal Overflow',
    expectedIssue: 'Horizontal Overflow',
    html: `<div class="container">
  <header class="hero-header">
    <h1>SmartLayout AI Research Demo</h1>
    <p>Predicting responsive layout failures before browser render.</p>
  </header>

  <div class="hero-card">
    <h2>Fixed Width Container</h2>
    <p>This box has a hardcoded width of 1200px. Test on 375px viewport to see AI pre-render prediction!</p>
  </div>
</div>`,
    css: `.container {
  max-width: 100%;
  padding: 20px;
}

.hero-header {
  margin-bottom: 24px;
}

.hero-card {
  width: 1200px;
  background: #1e1b4b;
  color: #ffffff;
  padding: 32px;
  border-radius: 12px;
}`
  },
  {
    id: 'tc-flex',
    name: '2. Broken Flexbox (Missing Wrap)',
    description: 'Flex container holds 4 wide feature cards without flex-wrap, crushing content on mobile.',
    category: 'Broken Flexbox',
    expectedIssue: 'Broken Flexbox',
    html: `<div class="features-grid">
  <div class="feature-card">Feature A</div>
  <div class="feature-card">Feature B</div>
  <div class="feature-card">Feature C</div>
  <div class="feature-card">Feature D</div>
</div>`,
    css: `.features-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 16px;
}

.feature-card {
  min-width: 250px;
  padding: 20px;
  background: #312e81;
  color: #fff;
  border-radius: 8px;
}`
  },
  {
    id: 'tc-grid',
    name: '3. Broken Grid (Fixed Track Columns)',
    description: 'CSS Grid specifies repeat(3, 400px) summing to 1200px, breaking on narrow screens.',
    category: 'Broken Grid',
    expectedIssue: 'Broken Grid',
    html: `<div class="grid-wrapper">
  <div class="box">Grid Item 1</div>
  <div class="box">Grid Item 2</div>
  <div class="box">Grid Item 3</div>
</div>`,
    css: `.grid-wrapper {
  display: grid;
  grid-template-columns: 400px 400px 400px;
  gap: 16px;
}

.box {
  background: #4338ca;
  color: #fff;
  padding: 24px;
  border-radius: 8px;
}`
  },
  {
    id: 'tc-image',
    name: '4. Image Overflow (Unresponsive Asset)',
    description: 'High-res image lacks max-width: 100%, causing image boundary breach.',
    category: 'Image Overflow',
    expectedIssue: 'Image Overflow',
    html: `<div class="gallery">
  <h2>Product Showcase</h2>
  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200" alt="Code Screenshot">
</div>`,
    css: `.gallery {
  padding: 16px;
}

img {
  width: 1200px;
  max-width: none;
}`
  },
  {
    id: 'tc-navbar',
    name: '5. Navbar Collapse (Desktop Links on Mobile)',
    description: 'Header navbar items remain horizontal without hamburger menu media query.',
    category: 'Navbar Collapse',
    expectedIssue: 'Navbar Collapse',
    html: `<nav class="main-nav">
  <div class="logo">SmartLayout</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">Features</a></li>
    <li><a href="#">Research Paper</a></li>
    <li><a href="#">Metrics</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
    css: `.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #111827;
  color: #fff;
}

.nav-links {
  display: flex;
  flex-direction: row;
  list-style: none;
  gap: 24px;
}`
  },
  {
    id: 'tc-text',
    name: '6. Text Overflow (white-space: nowrap)',
    description: 'Long notification alert forces white-space: nowrap without text truncation.',
    category: 'Text Overflow',
    expectedIssue: 'Text Overflow',
    html: `<div class="alert-banner">
  <span class="alert-text">CRITICAL SYSTEM ALERT: High frequency AST responsive static layout anomaly detected across viewports!</span>
</div>`,
    css: `.alert-banner {
  background: #991b1b;
  color: #fef2f2;
  padding: 16px;
  border-radius: 8px;
  white-space: nowrap;
}`
  },
  {
    id: 'tc-button',
    name: '7. Button Overflow (Fixed Px Button)',
    description: 'Action button has width: 450px which exceeds 320px screen width.',
    category: 'Button Overflow',
    expectedIssue: 'Button Overflow',
    html: `<div class="actions">
  <button class="btn btn-primary">Download Complete IEEE Research Whitepaper PDF</button>
</div>`,
    css: `.btn-primary {
  width: 450px;
  padding: 14px 28px;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
}`
  },
  {
    id: 'tc-hidden',
    name: '8. Hidden Components (Off-screen Position Absolute)',
    description: 'Element positioned at top: -500px, clipping interactive content.',
    category: 'Hidden Components',
    expectedIssue: 'Hidden Components',
    html: `<div class="wrapper">
  <div class="offscreen-card">
    <h3>Hidden Floating Panel</h3>
    <p>This component is clipped off-screen.</p>
  </div>
</div>`,
    css: `.offscreen-card {
  position: absolute;
  top: -500px;
  left: 200px;
  width: 300px;
  background: #374151;
  color: #fff;
  padding: 20px;
}`
  },
  {
    id: 'tc-collision',
    name: '9. Element Collision (Excessive Negative Margin)',
    description: 'Card has margin-top: -120px causing text overlay collision with header.',
    category: 'Element Collision',
    expectedIssue: 'Element Collision',
    html: `<div class="section-top">Header Section</div>
<div class="colliding-card">Overlapping Body Content</div>`,
    css: `.section-top {
  height: 100px;
  background: #1f2937;
  color: #fff;
  padding: 20px;
}

.colliding-card {
  margin-top: -120px;
  background: #4b5563;
  color: #fff;
  padding: 20px;
}`
  },
  {
    id: 'tc-shift',
    name: '10. Layout Shift (Unsized Image Asset)',
    description: 'Image missing width/height attributes or aspect-ratio CSS causing CLS.',
    category: 'Layout Shift',
    expectedIssue: 'Layout Shift',
    html: `<div class="article">
  <h1>Core Web Vitals Benchmark</h1>
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" alt="Tech Banner">
  <p>Article body content that shifts when image loads.</p>
</div>`,
    css: `.article {
  padding: 20px;
}

img {
  width: 100%;
}`
  }
];
