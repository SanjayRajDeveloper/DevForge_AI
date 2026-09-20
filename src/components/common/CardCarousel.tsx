import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CardCarouselProps {
  children: React.ReactNode;
  fadeColor?: string;
  dark?: boolean;
}

/**
 * Endless right-to-left card marquee.
 * Position advances every animation frame at a constant velocity and wraps
 * modulo one card-set width, so backward motion is impossible by construction.
 */
export function CardCarousel({ children, fadeColor = '#ffffff', dark = false }: CardCarouselProps) {
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(3);
  const [step, setStep] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const targetRef = useRef<number | null>(null);
  const startX = useRef(0);
  const moved = useRef(0);
  const suppressClick = useRef(false);

  const cards = React.Children.toArray(children);
  const count = cards.length;
  const setW = count * step;

  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 640px)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const update = () => setVisible(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    update();
    tablet.addEventListener('change', update);
    desktop.addEventListener('change', update);
    return () => {
      tablet.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      const first = trackRef.current?.querySelector<HTMLElement>('[data-card]');
      if (!first || !trackRef.current) return;
      const gap = parseFloat(getComputedStyle(trackRef.current).columnGap || '0') || 0;
      setStep(first.getBoundingClientRect().width + gap);
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 400);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [visible]);

  // Constant-velocity flow: one card every 2.4s, boosted while seeking a target.
  // Paused while the user hovers the cards or drags them.
  useEffect(() => {
    if (dragging || hovered || step <= 0 || count === 0) return;
    let raf = 0;
    let last = performance.now();
    const v = step / 3.5;
    const tick = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.06);
      last = ts;
      let o = offsetRef.current;
      const seek = targetRef.current != null;
      o += (seek ? v * 2.5 : v) * dt;
      if (seek && o >= (targetRef.current as number)) {
        o = targetRef.current as number;
        targetRef.current = null;
      }
      if (o >= setW) {
        o -= setW;
        if (targetRef.current != null) targetRef.current -= setW;
      }
      offsetRef.current = o;
      setOffset(o);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, hovered, step, count, setW]);

  const advance = (cardsToSkip: number) => {
    if (step <= 0 || cardsToSkip <= 0) return;
    const cur = Math.floor((((offsetRef.current % setW) + setW) % setW) / step) % count;
    const d = ((cardsToSkip - 1 + cur) % count) + 1;
    targetRef.current = offsetRef.current + d * step;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    moved.current = 0;
    startX.current = e.clientX;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      moved.current = e.clientX - startX.current;
      setDragX(moved.current);
    };
    const up = () => {
      const dist = moved.current;
      suppressClick.current = Math.abs(dist) > 6;
      // fold drag displacement into the flow, then align forward to the next card edge
      let o = offsetRef.current - dist;
      const s = setW > 0 ? ((o % setW) + setW) % setW : 0;
      offsetRef.current = o = s;
      const aligned = Math.ceil(s / step - 0.001) * step;
      if (step > 0 && aligned > s) targetRef.current = aligned >= setW ? 0 : aligned;
      setDragging(false);
      setDragX(0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, step, setW]);

  const normOffset = (((offset % setW) + setW) % setW) | 0;
  const activeDot = step > 0 ? Math.floor(normOffset / step) % count : 0;

  const arrowCls = `p-2 rounded-full transition-all duration-200 hover:scale-[1.08] hover:opacity-70 cursor-pointer ${
    dark ? 'text-slate-100' : 'text-slate-900'
  }`;

  const dotBase = 'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer';

  return (
    <div className="w-full" aria-roledescription="carousel">
      {/* Navigation arrow — top-right above the cards (forward only) */}
      <div className="flex items-center justify-end gap-1 px-4 sm:px-6 pb-2">
        <button onClick={() => advance(1)} className={arrowCls} aria-label="Next card">
          <ChevronRight className="w-6 h-6" strokeWidth={1.75} />
        </button>
      </div>

      <div
        className="relative overflow-hidden outline-none"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClickCapture={e => {
          if (suppressClick.current) {
            e.stopPropagation();
            e.preventDefault();
            suppressClick.current = false;
          }
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); }
        }}
        tabIndex={0}
        role="region"
        aria-label="Cards carousel"
      >
        <div
          ref={trackRef}
          data-track
          className="flex gap-4 sm:gap-7 px-4 sm:px-6 will-change-transform"
          style={{ transform: `translateX(${-offset + dragX}px)` }}
        >
          {[...cards, ...cards].map((child, i) => (
            <div
              key={i}
              data-card
              className="shrink-0 w-[85%] sm:w-[calc((100%-28px)/2)] lg:w-[calc((100%-56px)/3)] transition-transform duration-300 ease-out hover:scale-[1.02]"
            >
              {child}
            </div>
          ))}
        </div>

        {/* Edge fades */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[90px]"
          style={{ background: `linear-gradient(to right, ${fadeColor} 0%, rgba(0,0,0,0) 100%)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[90px]"
          style={{ background: `linear-gradient(to left, ${fadeColor} 0%, rgba(0,0,0,0) 100%)` }}
        />
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 pt-5">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i + 1)}
            aria-label={`Go to card ${i + 1}`}
            className={`${dotBase} ${
              i === activeDot
                ? dark
                  ? 'bg-slate-100 scale-110'
                  : 'bg-slate-900 scale-110'
                : dark
                ? 'bg-slate-600 hover:bg-slate-500'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
