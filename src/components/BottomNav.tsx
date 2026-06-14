'use client';

/* =====================================================================
   Navegação inferior (mobile) — polegar-first. Agrupa as 12 abas em 5
   áreas mentais. Vidro fosco sobre o conteúdo, respeitando a safe-area.
   ===================================================================== */

import type { ReactNode } from 'react';

export interface Grupo {
  id: string;
  rotulo: string;
  abas: string[];
  icone: ReactNode;
}

const svg = (filhos: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[22px] w-[22px]"
    aria-hidden
  >
    {filhos}
  </svg>
);

export const GRUPOS: Grupo[] = [
  { id: 'painel', rotulo: 'Painel', abas: ['painel'], icone: svg(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /></>) },
  {
    id: 'cardapio',
    rotulo: 'Cardápio',
    abas: ['cardapio', 'cotacao', 'simulador', 'precos'],
    icone: svg(<><path d="M5 3v7a2 2 0 0 0 4 0V3" /><path d="M7 10v11" /><path d="M17 3c-1.6 0-3 2-3 5s1.4 4 3 4v9" /></>),
  },
  {
    id: 'compras',
    rotulo: 'Compras',
    abas: ['compras', 'estoque', 'fluxo'],
    icone: svg(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6" /></>),
  },
  {
    id: 'insights',
    rotulo: 'Insights',
    abas: ['aceitacao', 'desperdicio', 'radar'],
    icone: svg(<><path d="M4 20V11" /><path d="M10 20V4" /><path d="M16 20v-6" /><path d="M21 20H3" /></>),
  },
  { id: 'mais', rotulo: 'Mais', abas: ['auditoria'], icone: svg(<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>) },
];

export function BottomNav({
  grupoAtivo,
  aoSelecionar,
}: {
  grupoAtivo: string;
  aoSelecionar: (grupoId: string) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-carvao-200/70 bg-white/85 backdrop-blur-xl lg:hidden dark:border-carvao-700/70 dark:bg-carvao-900/85 print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {GRUPOS.map((g) => {
          const ativo = g.id === grupoAtivo;
          return (
            <button
              key={g.id}
              onClick={() => aoSelecionar(g.id)}
              aria-current={ativo ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                ativo ? 'text-brand-600 dark:text-brand-400' : 'text-carvao-400'
              }`}
            >
              <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${ativo ? 'bg-brand-500/12' : ''}`}>
                {g.icone}
              </span>
              <span className="text-[10px] font-semibold tracking-tight">{g.rotulo}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
