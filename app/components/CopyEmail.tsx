'use client';
import { useState } from 'react';
import { EMAIL } from '../contato';

export function CopyEmail() {
  const [label, setLabel] = useState('Copiar e-mail');
  const select = () => {
    const el = document.getElementById('mail'); if (!el) return;
    const r = document.createRange(); r.selectNodeContents(el);
    const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
  };
  return (
    <button className="btn ghost" type="button" style={{ minHeight: 44, fontSize: 15 }}
      onClick={() => {
        try {
          navigator.clipboard.writeText(EMAIL).then(() => { setLabel('Copiado'); setTimeout(() => setLabel('Copiar e-mail'), 1600); }, select);
        } catch { select(); }
      }}>{label}</button>
  );
}
