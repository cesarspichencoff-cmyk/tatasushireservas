'use client';

import type { EstadoSemana, Papel } from '@/lib/cardapio/tipos';

export function AbaCotacao({
  estado,
  atualizar,
  papel,
  precos,
  fatores,
  aprenderDeSemana,
}: {
  estado: EstadoSemana;
  atualizar: (fn: (e: EstadoSemana) => EstadoSemana) => void;
  papel: Papel;
  precos?: Record<string, number>;
  fatores?: Record<string, number>;
  aprenderDeSemana?: (estado: EstadoSemana) => void;
}) {
  return (
    <div className="p-4">
      <p className="text-sm text-carvao-400">Aba de Cotação em construção.</p>
    </div>
  );
}