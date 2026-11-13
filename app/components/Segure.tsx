'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

const AREAS: [string, number, number][] = [
  ['Gestão', 165, 110],
  ['Sites & LPs', 490, 68],
  ['CRM', 815, 110],
  ['Finanças', 165, 450],
  ['Arquitetura', 815, 450],
];
const RL = 427.3, FILL = 1600, DRAIN = 900;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Segurar o botão enche o anel e acende o circuito das 5 áreas até o SYNC. */
export function Segure() {
  const wires = useMemo(() => AREAS.map(([name, x, y]) => {
    const w = Math.max(148, name.length * 14 + 54);
    if (x === 490) {
      return { name, x, y, d: `M490 ${y + 28} V224`, len: Math.abs(224 - (y + 28)), w };
    }
    const midX = x < 490 ? 330 : 650;
    const end = x < 490 ? 434 : 546;
    return { name, x, y, d: `M${x} ${y} H${midX} V280 H${end}`, len: Math.abs(midX - x) + Math.abs(280 - y) + Math.abs(end - midX), w };
  }), []);
  const [prog, setProg] = useState(0);
  const [done, setDone] = useState(false);
  const holding = useRef(false), last = useRef(0), raf = useRef(0), p = useRef(0), reduce = useRef(false);
  const holdBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { reduce.current = matchMedia('(prefers-reduced-motion: reduce)').matches; return () => cancelAnimationFrame(raf.current); }, []);

  const step = (now: number) => {
    const dt = now - last.current; last.current = now;
    p.current = clamp(p.current + (holding.current ? dt / FILL : -dt / DRAIN), 0, 1);
    setProg(p.current);
    if (p.current >= 1) { holding.current = false; setDone(true); return; }
    if (holding.current || p.current > 0) raf.current = requestAnimationFrame(step);
  };
  const start = (e?: { preventDefault(): void }) => {
    if (done) return; e?.preventDefault(); holding.current = true; cancelAnimationFrame(raf.current);
    if (reduce.current) { p.current = 1; setProg(1); setDone(true); return; }
    last.current = performance.now(); raf.current = requestAnimationFrame(step);
  };
  const stop = () => { holding.current = false; };
  const reset = () => { p.current = 0; setProg(0); setDone(false); setTimeout(() => holdBtn.current?.focus(), 0); };

  return (
    <section id="segure" className="sec" aria-label="Segure para sincronizar" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="stage" data-rise="">
          <svg className="map" viewBox="0 0 980 560" role="img" aria-label="Circuito ligando Gestão, Sites & LPs, CRM, Finanças e Arquitetura ao SYNC">
            <g>
              {wires.map((w, i) => {
                const s = clamp(prog * 4.5 - i * 0.65, 0, 1);
                return (
                  <g key={w.name}>
                    <path d={w.d} className="wire" />
                    <path d={w.d} className="wire-lit" style={{ strokeDasharray: w.len, strokeDashoffset: w.len * (1 - s) }} />
                  </g>
                );
              })}
            </g>
            <g className="core" transform="translate(490 280)">
              <circle className="halo" r="78" style={{ fill: `rgba(28,188,16,${0.12 + 0.4 * prog})` }} />
              <circle r="56" fill="#16201d" stroke={prog >= 1 ? '#1cbc10' : 'rgba(159,176,169,.28)'} />
              <text textAnchor="middle" dy="10">SYNC</text>
            </g>
            <g>
              {wires.map((w, i) => {
                const s = clamp(prog * 4.5 - i * 0.65, 0, 1);
                return (
                  <g key={w.name} className={'node' + (s > 0.02 ? ' on' : '')} transform={`translate(${w.x} ${w.y})`}>
                    <rect x={-w.w / 2} y={-28} width={w.w} height={56} rx={28} />
                    <text textAnchor="middle" dy="6">{w.name}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <div className="hold-wrap">
          <p className={'msg' + (done ? ' show' : '')} id="msg" aria-live="polite">{done ? 'Assim fica a rotina quando tudo conversa.' : ''}</p>
          <button ref={holdBtn} className={'hold' + (prog === 0 && !done ? ' pulse' : '')} type="button" aria-describedby="msg" hidden={done} data-flyover="stand"
            onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); start(e); }}
            onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
            onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); }}
            onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') stop(); }}
            onClick={e => e.preventDefault()}>
            <svg viewBox="0 0 144 144" aria-hidden="true">
              <circle cx="72" cy="72" r="68" fill="none" stroke="rgba(159,176,169,.2)" strokeWidth="4" />
              <circle cx="72" cy="72" r="68" fill="none" stroke="#1cbc10" strokeWidth="4" strokeLinecap="round" strokeDasharray={RL} strokeDashoffset={RL * (1 - prog)} />
            </svg>
            <span>Segure para sincronizar.</span>
          </button>
          <button className="again" type="button" hidden={!done} onClick={reset}>Desligar e tentar de novo</button>
        </div>
      </div>
    </section>
  );
}
