'use client';

import { Cartao, Pilula } from '@/components/ui';
import { formatarReais } from '@/lib/cardapio/motor';
import gastosJson from '@/lib/cardapio/gastos-mensais.json';

const MESES_LABEL: Record<string, string> = {
  '2026-01': 'Jan/26', '2026-02': 'Fev/26', '2026-03': 'Mar/26',
  '2026-04': 'Abr/26', '2026-05': 'Mai/26',
};

const MESES_CURTO: Record<string, string> = {
  '2026-01': 'Jan', '2026-02': 'Fev', '2026-03': 'Mar',
  '2026-04': 'Abr', '2026-05': 'Mai',
};

const dados = gastosJson as {
  meses: { total: number; entradas: number; mes: string }[];
  top: { n: string; t: number }[];
};

// Remove 'total' entry from top list (it's the grand total line from spreadsheet)
const topItens = dados.top.filter((x) => x.n !== 'total');
const maxItem = topItens.length > 0 ? topItens[0].t : 1;
const maxMes = Math.max(...dados.meses.map((m) => m.total));
const totalGeral = dados.meses.reduce((s, m) => s + m.total, 0);
const mediasMes = totalGeral / dados.meses.length;

const variacaoAbr = dados.meses[3] && dados.meses[2]
  ? ((dados.meses[3].total - dados.meses[2].total) / dados.meses[2].total) * 100
  : null;
const variacaoMai = dados.meses[4] && dados.meses[3]
  ? ((dados.meses[4].total - dados.meses[3].total) / dados.meses[3].total) * 100
  : null;

/**
 * Análise de gastos reais jan–mai/2026 extraída da planilha de compras.
 * Mostra tendência mensal, top itens por custo e média geral.
 */
export function AbaGastos() {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { r: 'Total jan–mai/26', v: formatarReais(totalGeral), sub: '5 meses' },
          { r: 'Média mensal', v: formatarReais(mediasMes), sub: 'jan–mai/26' },
          { r: 'Maior mês', v: formatarReais(maxMes), sub: 'Abril/26' },
          { r: 'Entradas NF', v: String(dados.meses.reduce((s, m) => s + m.entradas, 0)), sub: 'total de linhas' },
        ].map((k) => (
          <Cartao key={k.r} className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-texto-suave">{k.r}</p>
            <p className="mt-0.5 text-lg font-extrabold tabular-nums leading-tight">{k.v}</p>
            <p className="text-caption text-texto-suave">{k.sub}</p>
          </Cartao>
        ))}
      </div>

      {/* Gasto mensal — barra horizontal */}
      <Cartao className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">Gasto mensal</p>
          <Pilula tom="ouro">jan–mai/2026</Pilula>
        </div>
        <div className="space-y-2">
          {dados.meses.map((m, idx) => {
            const pct = (m.total / maxMes) * 100;
            const isMaior = m.total === maxMes;
            const variacao = idx > 0
              ? ((m.total - dados.meses[idx - 1].total) / dados.meses[idx - 1].total) * 100
              : null;
            return (
              <div key={m.mes} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-[11px] font-bold text-texto-suave">
                  {MESES_CURTO[m.mes]}
                </span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-carvao-100 dark:bg-carvao-700/50" style={{ height: 22 }}>
                  <div
                    className={`h-full rounded-full transition-all ${isMaior ? 'bg-ouro-400' : 'bg-brand-400 dark:bg-brand-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs font-bold tabular-nums">
                  {formatarReais(m.total)}
                  {variacao !== null && (
                    <span className={`ml-1 text-[10px] font-normal ${variacao > 0 ? 'text-perigo' : 'text-brand-600'}`}>
                      {variacao > 0 ? '▲' : '▼'}{Math.abs(Math.round(variacao))}%
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {(variacaoAbr !== null || variacaoMai !== null) && (
          <p className="text-[11px] text-texto-suave">
            {variacaoAbr !== null && variacaoAbr > 0 && (
              <>Abril teve alta de <strong className="text-perigo">{Math.round(variacaoAbr)}%</strong> vs. Março. </>
            )}
            {variacaoMai !== null && variacaoMai < 0 && (
              <>Maio recuou <strong className="text-brand-600">{Math.abs(Math.round(variacaoMai))}%</strong> em relação ao pico de Abril.</>
            )}
          </p>
        )}
      </Cartao>

      {/* Top itens por gasto total */}
      <Cartao className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">Itens que mais pesam no orçamento</p>
          <Pilula tom="vermelho">jan–mai/2026</Pilula>
        </div>
        <p className="text-xs text-texto-suave">
          Base: planilha de compras jan–mai/2026. Gastos acumulados reais (NF).
        </p>
        <div className="space-y-2">
          {topItens.map((item, idx) => {
            const pct = (item.t / maxItem) * 100;
            const pctGasto = (item.t / totalGeral) * 100;
            return (
              <div key={item.n} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right text-[10px] text-texto-suave">{idx + 1}</span>
                <span className="w-32 shrink-0 truncate text-xs font-semibold capitalize">{item.n}</span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-carvao-100 dark:bg-carvao-700/50" style={{ height: 16 }}>
                  <div
                    className="h-full rounded-full bg-brand-300 dark:bg-brand-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-[11px] tabular-nums">
                  {formatarReais(item.t)}
                </span>
                <span className="w-8 shrink-0 text-right text-[10px] text-texto-suave">
                  {pctGasto.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-texto-suave">
          Açaim em cubo e filé de frango juntos representam{' '}
          <strong>{(((topItens[0]?.t ?? 0) + (topItens[1]?.t ?? 0)) / totalGeral * 100).toFixed(0)}%</strong>{' '}
          do gasto total do período.
        </p>
      </Cartao>

      {/* Nota de origem */}
      <p className="text-center text-[11px] text-texto-suave">
        Dados extraídos da planilha "Alimentação de Funcionário jan–mai/2026" · {dados.meses.reduce((s, m) => s + m.entradas, 0)} linhas de NF
      </p>
    </div>
  );
}
