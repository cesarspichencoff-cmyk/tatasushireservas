'use client';

import { useState } from 'react';

export function BotaoBaixarManual() {
  const [carregando, setCarregando] = useState(false);

  const baixar = async () => {
    setCarregando(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import('html2pdf.js')).default as any;
      const el = document.getElementById('manual-conteudo');
      if (!el) return;
      await html2pdf()
        .set({
          margin: [1.2, 1.5, 1.2, 1.5],
          filename: 'manual-tata-house.pdf',
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(el)
        .save();
    } finally {
      setCarregando(false);
    }
  };

  return (
    <button
      onClick={baixar}
      disabled={carregando}
      className="no-print flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1a5c3a]/30 bg-white px-6 py-3.5 text-sm font-bold text-[#1a5c3a] shadow-sm transition hover:bg-[#1a5c3a] hover:text-white disabled:opacity-60 active:scale-[0.98]"
    >
      {carregando ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Gerando PDF…
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Baixar manual em PDF
        </>
      )}
    </button>
  );
}
