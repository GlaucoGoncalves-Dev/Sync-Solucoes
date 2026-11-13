'use client';
import { useEffect, useRef } from 'react';

/** Vídeo do herói. Com movimento reduzido ou economia de dados fica parado no poster. */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || conn?.saveData) {
      v.pause();
      v.removeAttribute('autoplay');
      return;
    }
    v.play().catch(() => {});
  }, []);
  return <video ref={ref} id="heroVideo" src="/m/hero.mp4" poster="/m/hero-poster.jpg" muted playsInline loop autoPlay preload="metadata" aria-hidden="true" />;
}
