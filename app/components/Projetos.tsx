'use client';
import { useEffect, useRef, useState } from 'react';
import { PROJETOS_INICIAIS, Projeto, STORAGE_KEY, getThumbnailForUrl } from '../projetos-data';

export function Projetos() {
  const [projetos, setProjetos] = useState<Projeto[]>(PROJETOS_INICIAIS);
  const [modalProj, setModalProj] = useState<Projeto | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/projetos.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProjetos(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return;
          }
        }
      } catch {}
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) setProjetos(parsed);
        }
      } catch {}
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setProjetos(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!modalProj) {
      lastTriggerRef.current?.focus();
      return;
    }
    setTimeout(() => closeBtnRef.current?.focus(), 10);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalProj(null);
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalProj]);

  const openModal = (p: Projeto, trigger: HTMLElement | null) => {
    lastTriggerRef.current = trigger;
    setModalProj(p);
  };

  const ativos = projetos.filter(p => p.ativo !== false);

  return (
    <section id="projetos" className="sec" aria-labelledby="projetosT" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="proj-head" data-rise="">
          <h2 className="h2" id="projetosT">Projetos no ar.</h2>
          <p className="proj-sub">
            Sites institucionais, landing pages de alta conversão e sistemas web completos construídos sob medida e rodando na prática.
          </p>
        </div>

        <div className="proj-grid">
          {ativos.map((p, i) => (
            <article key={p.id} className="proj-card" data-rise="" data-stagger={i} data-flyover="card">
              <div className="proj-browser">
                <div className="proj-addr">
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <circle cx="5" cy="5" r="4" fill="#1cbc10" />
                  </svg>
                  <span>{p.dominio}</span>
                </div>
              </div>
              <div className="proj-preview" onClick={e => openModal(p, e.currentTarget)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p, e.currentTarget); } }}
                aria-label={`Ampliar visualização de ${p.nome}`}>
                <img
                  src={getThumbnailForUrl(p.url, p.imagem)}
                  alt={`Prévia do projeto ${p.nome} (${p.dominio})`}
                  loading="lazy"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/m/hero-poster.jpg'; }}
                />
                <div className="proj-overlay"><span>Ampliar prévia</span></div>
              </div>
              <div className="proj-body">
                <span className="proj-tag">{p.categoria}</span>
                <h3>{p.nome}</h3>
                <p>{p.descricao}</p>
                <div className="proj-actions">
                  <button type="button" className="btn ghost proj-btn" onClick={e => openModal(p, e.currentTarget)}>
                    Ampliar prévia
                  </button>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn proj-btn">
                    <span>Visitar site</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10 10 4M5 4h5v5" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {modalProj && (
        <div className="proj-modal-backdrop" onClick={() => setModalProj(null)} role="dialog" aria-modal="true" aria-label={`Visualização de ${modalProj.nome}`}>
          <div ref={modalRef} className="proj-modal" onClick={e => e.stopPropagation()}>
            <div className="proj-modal-top">
              <div className="proj-modal-info">
                <strong>{modalProj.nome}</strong>
                <span>{modalProj.url}</span>
              </div>
              <div className="proj-modal-btns">
                <a href={modalProj.url} target="_blank" rel="noopener noreferrer" className="btn" style={{ minHeight: 40, padding: '0 18px', fontSize: 14 }}>
                  <span>Abrir site ao vivo</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 10 10 4M5 4h5v5" />
                  </svg>
                </a>
                <button ref={closeBtnRef} type="button" className="proj-close" onClick={() => setModalProj(null)} aria-label="Fechar visualização">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="proj-modal-frame">
              <img
                src={getThumbnailForUrl(modalProj.url, modalProj.imagem)}
                alt={`Visualização em tela cheia de ${modalProj.nome}`}
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/m/hero-poster.jpg'; }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
