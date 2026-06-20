/* =====================================================================
   Previsão evoluída de consumo — intervalos de confiança + ajuste por
   eventos + empurra as quantidades previstas para a lista de compras.

   Usa o histórico real de contagens de refeições (localStorage) para
   calcular mediana + desvio interquartil por dia da semana e retorna
   bandas de confiança: pessimista, esperado, otimista.
   ===================================================================== */

import { PESSOAS_PADRAO } from './motor';
import { mediana } from './memoria';
import type { ContagemRefeicoesDia, EstadoSemana, EventoDemanda } from './tipos';

export interface BandaPrevisao {
  dia: number;
  data: Date;
  pessimista: number; // p25
  esperado: number; // mediana
  otimista: number; // p75
  confianca: number; // 0–1: quão confiável é a previsão (mais dados = mais alta)
  base: 'historico' | 'padrao';
  evento?: EventoDemanda;
}

export interface PrevisaoSemana {
  dias: BandaPrevisao[];
  totalEsperado: number;
  totalPessimista: number;
  totalOtimista: number;
  /** Semanas de histórico usadas na previsão. */
  baseSemanas: number;
}

/* ------------------------------------------------------------------ */

const MAX_CONFIANCA_N = 8; // com 8+ semanas, confiança = 1.0

function percentil(arr: number[], p: number): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

/**
 * Calcula as bandas de previsão por dia da semana a partir do histórico
 * real de contagens. Sem histórico, usa a curva padrão com banda ±20%.
 */
export function calcularPrevisaoSemana(
  semanaId: string,
  /** Histórico de contagens: histContagens[diaDaSemana] = array de qtds reais */
  histContagens: Partial<Record<number, number[]>>,
  eventos: EventoDemanda[],
  datas: Date[],
): PrevisaoSemana {
  const dias: BandaPrevisao[] = datas.map((data, dia) => {
    const hist = histContagens[dia] ?? [];
    const iso = data.toISOString().slice(0, 10);
    const evento = eventos.find((e) => e.data === iso);
    const fatorEvento = evento?.fator ?? 1;

    let pessimista: number;
    let esperado: number;
    let otimista: number;
    let base: BandaPrevisao['base'];
    let confianca: number;

    if (hist.length >= 2) {
      pessimista = Math.round(percentil(hist, 25) * fatorEvento);
      esperado = Math.round(mediana(hist) * fatorEvento);
      otimista = Math.round(percentil(hist, 75) * fatorEvento);
      confianca = Math.min(1, hist.length / MAX_CONFIANCA_N);
      base = 'historico';
    } else {
      const pad = PESSOAS_PADRAO[dia] ?? 65;
      // sem histórico: banda ±20% ao redor do padrão
      pessimista = Math.round(pad * 0.8 * fatorEvento);
      esperado = Math.round(pad * fatorEvento);
      otimista = Math.round(pad * 1.2 * fatorEvento);
      confianca = hist.length === 1 ? 0.3 : 0;
      base = 'padrao';
    }

    return { dia, data, pessimista, esperado, otimista, confianca, base, evento };
  });

  return {
    dias,
    totalEsperado: dias.reduce((a, d) => a + d.esperado, 0),
    totalPessimista: dias.reduce((a, d) => a + d.pessimista, 0),
    totalOtimista: dias.reduce((a, d) => a + d.otimista, 0),
    baseSemanas: Math.max(...Object.values(histContagens).map((a) => a?.length ?? 0), 0),
  };
}

/**
 * Extrai contagens históricas por dia da semana cruzando três fontes:
 *   1. estado.refeicoes — contagem real registrada na semana (mais confiável)
 *   2. estado.dias[i].pessoas — headcount planejado (proxy quando não há real)
 *   3. contagemRefeicoes — registro detalhado almoco/jantar/marmitas por data
 *
 * Retorna um mapa dia→array de quantidades reais observadas.
 */
export function extrairHistoricoContagens(
  semanas: { estado: EstadoSemana }[],
  contagemRefeicoes?: ContagemRefeicoesDia[],
): Partial<Record<number, number[]>> {
  const acc: Record<number, number[]> = {};

  semanas.forEach(({ estado }) => {
    // Fonte 1: refeicoes registradas no estado (campo mais confiável)
    const temRefeicoes = Object.keys(estado.refeicoes ?? {}).length > 0;
    if (temRefeicoes) {
      Object.entries(estado.refeicoes!).forEach(([diS, qtd]) => {
        if (!(qtd > 0)) return;
        (acc[Number(diS)] ??= []).push(qtd);
      });
    } else {
      // Fonte 2: pessoas planejadas por dia (quando não há contagem real)
      estado.dias.forEach((d, di) => {
        if (d.principal && d.pessoas > 0) (acc[di] ??= []).push(d.pessoas);
      });
    }
  });

  // Fonte 3: contagemRefeicoes (registro diário com almoco + jantar + marmitas)
  contagemRefeicoes?.forEach((c) => {
    const total = (c.almoco ?? 0) + (c.jantar ?? 0) + (c.marmitas ?? 0);
    if (!(total > 0)) return;
    const date = new Date(c.data + 'T12:00:00');
    const dow = date.getDay(); // 0=dom…6=sab
    const di = dow === 0 ? 6 : dow - 1; // converte para 0=seg…6=dom
    (acc[di] ??= []).push(total);
  });

  return acc;
}

/**
 * Escala os itens de uma lista de compras de acordo com a previsão
 * evoluída: substitui `pessoas` por `esperado` (ou `otimista` para
 * planejar com folga) para cada dia.
 *
 * Retorna um mapa diaIdx → pessoas a usar no cálculo das quantidades.
 */
export function pessoasPorDia(
  previsao: PrevisaoSemana,
  modo: 'esperado' | 'otimista' | 'pessimista' = 'otimista',
): Record<number, number> {
  const mapa: Record<number, number> = {};
  previsao.dias.forEach((d) => {
    mapa[d.dia] = d[modo];
  });
  return mapa;
}
