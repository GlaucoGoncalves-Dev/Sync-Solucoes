'use client';
import { useEffect } from 'react';

/** Os efeitos de rolagem do protótipo: nav sólida, herói que vira card, blocos que sobem,
 *  palavras do Quem acendendo, dores da Rotina acendendo e vídeos que só tocam quando visíveis.
 *  Otimizado com IntersectionObserver (filtra apenas elementos próximos da tela) e separação de leituras/escritas DOM. */
export function ScrollEffects() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
    const ease = (u: number) => 1 - Math.pow(1 - u, 3);
    const $ = <T extends Element>(q: string) => document.querySelector(q) as T;
    const nav = $<HTMLElement>('#nav'), topo = $<HTMLElement>('#topo'), media = $<HTMLElement>('#heroMedia'), title = $<HTMLElement>('#heroTitle');
    const qt = $<HTMLElement>('#quemText');
    const spans = [...qt.querySelectorAll<HTMLElement>('.w')];
    const rise = [...document.querySelectorAll<HTMLElement>('[data-rise]')];
    const lit = [...document.querySelectorAll<HTMLElement>('[data-lit]')];
    const staggers = new Map(rise.map(el => [el, (+(el.dataset.stagger || 0)) * 0.06]));
    const prevRiseP = new Map<HTMLElement, number>();
    const activeRise = new Set<HTMLElement>(rise);
    const activeLit = new Set<HTMLElement>(lit);
    let quemNear = true, topoNear = true;
    let lastSolid: boolean | null = null, lastHeroP = -1, lastQuemN = -1, wasMobile: boolean | null = null;
    let topoH = topo.offsetHeight;

    const applyRise = (el: HTMLElement, p: number) => {
      if (prevRiseP.get(el) === p) return;
      prevRiseP.set(el, p);
      const e = ease(p);
      el.style.transform = `translateY(${(1 - e) * 28}px)`;
      el.style.opacity = String(0.15 + 0.85 * e);
    };

    const setQuemCount = (n: number) => {
      if (n === lastQuemN) return;
      const start = Math.max(0, Math.min(lastQuemN, n));
      const end = Math.min(spans.length, Math.max(lastQuemN, n));
      for (let i = start; i < end; i++) spans[i].classList.toggle('on', i < n);
      lastQuemN = n;
    };

    if (reduce) spans.forEach(s => s.classList.add('on'));

    function frame(full = false) {
      const vh = innerHeight, y = scrollY, isMob = innerWidth <= 720;
      if (full) topoH = topo.offsetHeight;

      // 1. Fase de leitura (DOM reads agrupadas para evitar layout thrashing)
      const riseSet = full ? rise : activeRise;
      const litSet = full ? lit : activeLit;
      const riseReads: [HTMLElement, number][] = [];
      if (!reduce) {
        for (const el of riseSet) {
          const r = el.getBoundingClientRect();
          const p = clamp((vh - r.top) / (vh * 0.32) - (staggers.get(el) || 0), 0, 1);
          riseReads.push([el, p]);
        }
      }
      let nextQuemN = lastQuemN;
      if (!reduce && (full || quemNear)) {
        const qr = qt.getBoundingClientRect();
        const qp = clamp((vh * 0.85 - qr.top) / (qr.height + vh * 0.35), 0, 1);
        nextQuemN = Math.round(qp * spans.length);
      }
      const litReads: [HTMLElement, boolean][] = [];
      for (const el of litSet) {
        const r = el.getBoundingClientRect();
        litReads.push([el, r.top < vh * 0.6 && r.bottom > vh * 0.25]);
      }

      // 2. Fase de escrita (DOM writes agrupadas e só quando mudam)
      const solid = y > 40;
      if (solid !== lastSolid) { nav.classList.toggle('solid', solid); lastSolid = solid; }

      if (!reduce) {
        if (isMob) {
          if (wasMobile !== true) {
            media.style.transform = ''; media.style.borderRadius = '';
            title.style.transform = ''; title.style.opacity = '';
            wasMobile = true; lastHeroP = -1;
          }
        } else if (full || topoNear || lastHeroP < 1) {
          wasMobile = false;
          const p = clamp(y / Math.max(1, topoH - vh), 0, 1);
          if (p !== lastHeroP) {
            lastHeroP = p;
            const e = ease(p);
            media.style.transform = `scale(${1 - 0.12 * e})`;
            media.style.borderRadius = `${28 * e}px`;
            title.style.transform = `translateY(${-60 * e}px)`;
            title.style.opacity = String(1 - clamp(p * 1.6, 0, 1));
          }
        }
        for (const [el, p] of riseReads) applyRise(el, p);
        setQuemCount(nextQuemN);
      }
      for (const [el, isLit] of litReads) el.classList.toggle('lit', isLit);
    }

    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(false); }); } };
    const onResize = () => frame(true);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    frame(true);

    let ioTrack: IntersectionObserver | null = null;
    let ioVideo: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      activeRise.clear();
      activeLit.clear();
      ioTrack = new IntersectionObserver(entries => {
        const vh = innerHeight;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (el === topo) { topoNear = entry.isIntersecting; continue; }
          if (el === qt) { quemNear = entry.isIntersecting; continue; }
          if (el.hasAttribute('data-rise')) {
            if (entry.isIntersecting) activeRise.add(el);
            else {
              activeRise.delete(el);
              if (!reduce) applyRise(el, entry.boundingClientRect.top < vh * 0.5 ? 1 : 0);
            }
          }
          if (el.hasAttribute('data-lit')) {
            if (entry.isIntersecting) activeLit.add(el);
            else { activeLit.delete(el); el.classList.remove('lit'); }
          }
        }
      }, { rootMargin: '25% 0px 25% 0px' });

      ioTrack.observe(topo);
      ioTrack.observe(qt);
      rise.forEach(el => ioTrack!.observe(el));
      lit.forEach(el => ioTrack!.observe(el));

      if (!reduce) {
        const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        ioVideo = new IntersectionObserver(es => es.forEach(e => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && !conn?.saveData) v.play().catch(() => {});
          else v.pause();
        }), { threshold: 0.2 });
        document.querySelectorAll('video[data-loop], #heroVideo').forEach(v => ioVideo!.observe(v));
      }
    }

    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      ioTrack?.disconnect();
      ioVideo?.disconnect();
    };
  }, []);
  return null;
}
