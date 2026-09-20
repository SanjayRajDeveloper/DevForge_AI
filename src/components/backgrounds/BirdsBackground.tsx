import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore - vanta ships UMD without types
import * as VantaModule from 'vanta/dist/vanta.birds.min';

export function BirdsBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const anyModule = VantaModule as any;
    const vanta =
      typeof anyModule === 'function'
        ? anyModule
        : typeof anyModule.default === 'function'
          ? anyModule.default
          : anyModule.default?.default;
    if (typeof vanta !== 'function') return;

    (window as any).THREE = THREE;
    effectRef.current = vanta({
      el,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      colorMode: 'variance',
      birdSize: 1.5,
      wingSpan: 26,
      speedLimit: 4,
      separation: 80,
      alignment: 52,
      cohesion: 90,
      quantity: 3.5,
      backgroundColor: 0x0b1536,
      color1: 0x7cc4ff,
      color2: 0x9d8cff,
    });

    return () => {
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return <div ref={ref} className={className ?? 'absolute inset-0 w-full h-full'} />;
}