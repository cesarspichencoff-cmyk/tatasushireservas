/* =====================================================================
   Confiança de preço — quão confiável é o valor que o app mostra.
   Cruza evidências reais: nº de pontos no histórico, recência da última
   cotação e nº de fornecedores conhecidos. Vira um selo 🟢/🟡/🔴 que dá
   credibilidade à cotação — o gestor sabe se decide com base sólida.
   ===================================================================== */

import type { HistoricoPrecos } from './tipos';

export type NivelConfianca = 'alta' | 'media' | 'baixa';

export interface Confianca {
  pct: number; // 0–100
  nivel: NivelConfianca;
  baseado: string[]; // evidências legíveis
}

const DIA_MS = 86_400_000;

/**
 * Calcula a confiança do preço de um item a partir das evidências disponíveis.
 * Não inventa dados — só pondera o que já foi registrado.
 */
export function confiancaPreco(
  norm: string,
  historico: HistoricoPrecos,
  ofertas: Record<string, { fornecedor: string; preco: number }[]> = {},
  temPrecoAtual = true,
): Confianca {
  const serie = historico[norm] ?? [];
  const nPontos = serie.length;

  const fornecedores = new Set((ofertas[norm] ?? []).map((o) => o.fornecedor.toLowerCase()));
  const nForn = fornecedores.size;

  // Dias desde a última cotação registrada
  let diasDesde: number | null = null;
  if (nPontos > 0) {
    const ultimo = serie[serie.length - 1].em;
    const t = Date.parse(ultimo);
    if (!Number.isNaN(t)) diasDesde = Math.max(0, Math.round((Date.now() - t) / DIA_MS));
  }

  // ── Pontuação (0–100) ──────────────────────────────────────────
  let score = temPrecoAtual ? 35 : 10; // ter preço lançado já é base

  // histórico: até +30
  score += Math.min(30, nPontos * 6);

  // fornecedores conhecidos: até +20
  score += Math.min(20, nForn * 10);

  // recência: até +15, penaliza preço velho
  if (diasDesde !== null) {
    if (diasDesde <= 7) score += 15;
    else if (diasDesde <= 21) score += 8;
    else if (diasDesde <= 45) score += 2;
    else score -= 8;
  }

  const pct = Math.max(5, Math.min(99, Math.round(score)));
  const nivel: NivelConfianca = pct >= 80 ? 'alta' : pct >= 55 ? 'media' : 'baixa';

  // ── Evidências legíveis ────────────────────────────────────────
  const baseado: string[] = [];
  if (nPontos > 0) baseado.push(`${nPontos} cotação${nPontos > 1 ? 'ões' : ''} no histórico`);
  else baseado.push('preço estimado');
  if (nForn >= 2) baseado.push(`${nForn} fornecedores`);
  else if (nForn === 1) baseado.push('1 fornecedor');
  if (diasDesde !== null) {
    if (diasDesde === 0) baseado.push('cotado hoje');
    else baseado.push(`última cotação há ${diasDesde} dia${diasDesde > 1 ? 's' : ''}`);
  }

  return { pct, nivel, baseado };
}

export const COR_CONFIANCA: Record<NivelConfianca, { ponto: string; texto: string }> = {
  alta:  { ponto: 'bg-emerald-500', texto: 'text-emerald-600 dark:text-emerald-400' },
  media: { ponto: 'bg-ouro-400',    texto: 'text-ouro-600 dark:text-ouro-400' },
  baixa: { ponto: 'bg-carvao-300 dark:bg-carvao-600', texto: 'text-carvao-400' },
};
