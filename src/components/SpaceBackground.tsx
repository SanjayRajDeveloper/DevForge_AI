import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  speed: number;
  tw: number;
  tws: number;
  hue: number;
  size: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

const SHOT_INTERVAL = 2.8;

export function SpaceBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = true;
    const t0 = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stars: Star[] = [];
    const shots: ShootingStar[] = [];
    let nextShot = SHOT_INTERVAL;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(460, Math.max(180, (w * h) / 3000)));
      while (stars.length < count) {
        stars.push({
          x: rand(-w * 0.9, w * 0.9),
          y: rand(-h * 0.9, h * 0.9),
          z: rand(0.12, 1),
          speed: rand(0.004, 0.02),
          tw: rand(0, Math.PI * 2),
          tws: rand(0.6, 2.4),
          hue: Math.random() < 0.72 ? 0 : Math.random() < 0.5 ? 190 : 260,
          size: rand(0.5, 1.6),
        });
      }
      stars.length = count;
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!running) return;
      const t = (now - t0) / 1000;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, w, h);

      // Nebula clouds drifting
      const neb = [
        { cx: 0.2 + 0.05 * Math.sin(t * 0.05), cy: 0.28 + 0.04 * Math.cos(t * 0.07), r: 0.52, c: '99,102,241' },
        { cx: 0.78 + 0.05 * Math.cos(t * 0.045), cy: 0.62 + 0.05 * Math.sin(t * 0.06), r: 0.48, c: '34,211,238' },
        { cx: 0.55 + 0.06 * Math.sin(t * 0.06 + 2), cy: 0.14 + 0.04 * Math.cos(t * 0.05), r: 0.4, c: '217,70,239' },
        { cx: 0.35 + 0.04 * Math.cos(t * 0.055 + 4), cy: 0.85 + 0.05 * Math.sin(t * 0.045), r: 0.5, c: '56,189,248' },
        { cx: 0.9 + 0.05 * Math.sin(t * 0.06 + 1), cy: 0.3 + 0.05 * Math.cos(t * 0.05 + 3), r: 0.38, c: '251,146,60' },
      ];
      neb.forEach(n => {
        for (const [base, spread, alpha] of [[0.6, 0.5, 0.2], [1, 0.75, 0.09]] as const) {
          const g = ctx.createRadialGradient(n.cx * w, n.cy * h, 0, n.cx * w, n.cy * h, n.r * w * base);
          g.addColorStop(0, `rgba(${n.c},${alpha})`);
          g.addColorStop(0.5, `rgba(${n.c},${alpha * spread})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      });

      // faint Milky Way band sweeping diagonally
      {
        const band = ctx.createLinearGradient(0, h * 0.1, w, h * 0.9);
        band.addColorStop(0, 'rgba(148,163,184,0)');
        band.addColorStop(0.45, 'rgba(148,163,184,0.075)');
        band.addColorStop(0.55, 'rgba(148,163,184,0.11)');
        band.addColorStop(1, 'rgba(148,163,184,0)');
        ctx.fillStyle = band;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(226,232,240,0.05)';
        for (let i = 0; i < 90; i++) {
          const px = rand(0, 1);
          const py = 0.1 + px * 0.8 + rand(-0.045, 0.045);
          const ps = rand(0.3, 0.9);
          ctx.fillRect(px * w, py * h, ps, ps);
        }
      }

      // TWINKLE + fly-toward-viewer starfield
      const cx = w / 2;
      const cy = h / 2;
      stars.forEach(s => {
        s.z -= s.speed * (reduced ? 0 : 1);
        if (s.z <= 0.11) {
          s.z = rand(0.85, 1);
          s.x = rand(-w * 0.9, w * 0.9);
          s.y = rand(-h * 0.9, h * 0.9);
        }
        const inv = 1 / s.z;
        const sx = cx + s.x * inv;
        const sy = cy + s.y * inv;
        const size = s.size * (1.8 - s.z) * 1.4;
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.tws + s.tw);
        const alpha = Math.min(1, inv * 0.9) * twinkle;
        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) return;
        const color = s.hue === 0 ? '226,232,255' : s.hue === 190 ? '103,232,249' : '196,181,253';
        // soft halo for brighter stars
        if (size > 2.1) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
          halo.addColorStop(0, `rgba(${color},${alpha * 0.22})`);
          halo.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
        if (inv > 1.35) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.35})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - s.x * 0.02, sy - s.y * 0.02);
          ctx.stroke();
        }
      });

      // Shooting stars
      nextShot -= 1 / 60;
      if (nextShot <= 0 && shots.length === 0 && !reduced) {
        shots.push({
          x: rand(w * 0.15, w * 0.85),
          y: rand(h * 0.05, h * 0.3),
          vx: rand(-3.4, -2.2),
          vy: rand(2.0, 3.0),
          life: 0,
          max: rand(0.55, 0.95),
        });
        nextShot = rand(1.6, 4.4);
      }
      shots.forEach((s, i) => {
        s.life += 1 / 60;
        s.x += s.vx;
        s.y += s.vy;
        const k = 1 - s.life / s.max;
        if (k <= 0 || s.x < -60 || s.y > h + 60) {
          shots.splice(i, 1);
          return;
        }
        const tail = 54;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
        grad.addColorStop(0, `rgba(255,255,255,${0.95 * k})`);
        grad.addColorStop(0.4, `rgba(147,197,253,${0.45 * k})`);
        grad.addColorStop(1, 'rgba(147,197,253,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.stroke();
      });
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduced) {
      raf = requestAnimationFrame(draw);
    } else {
      // static frame so reduced-motion users still see the scene
      draw(performance.now());
      cancelAnimationFrame(raf);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className ?? 'absolute inset-0 w-full h-full'} />;
}