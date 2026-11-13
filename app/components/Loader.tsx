'use client';
import { useEffect, useRef, useState } from 'react';

/** "SYNC" acendendo letra por letra enquanto o vídeo do herói carrega (no máximo 1,4 s). */
export function Loader() {
  const [on, setOn] = useState(0);
  const [gone, setGone] = useState(false);
  const [skip, setSkip] = useState(false);
  const done = useRef(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setSkip(true); return; }
    const timers = [0, 1, 2, 3].map(i => setTimeout(() => setOn(i + 1), 120 + i * 180));
    const t0 = performance.now();
    const hide = () => { if (done.current) return; done.current = true; setTimeout(() => setGone(true), 200); };
    const v = document.getElementById('heroVideo') as HTMLVideoElement | null;
    const ready = () => setTimeout(hide, Math.max(0, 900 - (performance.now() - t0)));
    if (v && v.readyState >= 3) ready(); else v?.addEventListener('canplay', ready, { once: true });
    const cap = setTimeout(hide, 1400);
    return () => { timers.forEach(clearTimeout); clearTimeout(cap); v?.removeEventListener('canplay', ready); };
  }, []);
  if (skip) return null;
  return (
    <div id="loader" className={gone ? 'gone' : ''} aria-hidden="true">
      <b>{'SYNC'.split('').map((l, i) => <i key={i} className={i < on ? 'on' : ''}>{l}</i>)}</b>
    </div>
  );
}
