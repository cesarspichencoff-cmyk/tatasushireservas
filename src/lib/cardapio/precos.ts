/* =====================================================================
   Núcleo de preços — três estados claros: real, estimado e sem preço.
   - real:     veio da cotação, nota fiscal, fornecedor ou manual confirmado.
   - estimado: média de mercado interna (histórico) — base pronta para IA.
   - sem:      sem cotação e sem estimativa → exige revisão antes de fechar.
   Funções puras, sem efeitos; a camada de UI só consome o resultado.
   ===================================================================== */

import { DADOS, normalizar } from './motor';
import type { HistoricoPrecos } from './tipos';

export type TipoPreco = 'real' | 'estimado' | 'sem';

export interface PrecoResolvido {
  valor: number;
  tipo: TipoPreco;
}

const unidadeDe = new Map<string, string>();
DADOS.itens.forEach((i) => unidadeDe.set(normalizar(i.n), i.u));

function media(ns: number[]): number {
  return ns.reduce((a, b) => a + b, 0) / Math.max(ns.length, 1);
}

export function resolverPreco(
  norm: string,
  precos: Record<string, number>,
  estimativas: Record<string, number> = {},
): PrecoResolvido {
  const real = precos[norm];
  if (real > 0) return { valor: real, tipo: 'real' };
  const est = estimativas[norm];
  if (est > 0) return { valor: est, tipo: 'estimado' };
  return { valor: 0, tipo: 'sem' };
}

export function estimarPreco(
  norm: string,
  precos: Record<string, number>,
  historico: HistoricoPrecos,
): number | null {
  const serie = historico[norm];
  if (serie && serie.length) return Math.round(media(serie.map((p) => p.valor)) * 100) / 100;

  const u = unidadeDe.get(norm);
  if (u) {
    const mesmos = DADOS.itens
      .filter((it) => it.u === u && precos[normalizar(it.n)] > 0)
      .map((it) => precos[normalizar(it.n)]);
    if (mesmos.length >= 2) return Math.round(media(mesmos) * 100) / 100;
  }
  return null;
}

export async function estimarPrecoIA(_norm: string): Promise<number | null> {
  void _norm;
  return null;
}

export interface CustoTipado {
  total: number;
  real: number;
  estimado: number;
  itensReais: number;
  itensEstimados: number;
  itensSemPreco: number;
  semPreco: string[];
}

export function custoTipado(
  itens: { norm: string; qtd: number }[],
  precos: Record<string, number>,
  estimativas: Record<string, number> = {},
): CustoTipado {
  const c: CustoTipado = {
    total: 0,
    real: 0,
    estimado: 0,
    itensReais: 0,
    itensEstimados: 0,
    itensSemPreco: 0,
    semPreco: [],
  };
  itens.forEach(({ norm, qtd }) => {
    const r = resolverPreco(norm, precos, estimativas);
    if (r.tipo === 'real') {
      c.real += r.valor * qtd;
      c.itensReais++;
    } else if (r.tipo === 'estimado') {
      c.estimado += r.valor * qtd;
      c.itensEstimados++;
    } else {
      c.itensSemPreco++;
      c.semPreco.push(norm);
    }
  });
  c.total = c.real + c.estimado;
  return c;
}

export const ROTULO_TIPO_PRECO: Record<TipoPreco, string> = {
  real: 'real',
  estimado: 'estimado',
  sem: 'sem preço',
};
