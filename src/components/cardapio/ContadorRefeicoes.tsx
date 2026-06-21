'use client';

import { useEffect, useState } from 'react';
import { Cartao } from '@/components/ui';
import { calcularStats, hojeISO, registrarDia } from '@/lib/cardapio/refeicoes';
import type { StatsRefeicoes } from '@/lib/cardapio/refeicoes';

const DIAS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function fmt(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function ContadorRefeicoes() {
  const [stats, setStats] = useState<StatsRefeicoes | null>(null);
  const [almoco, setAlmoco] = useState('');
  const [jantar, setJantar] = useState('');
  const [salvo, setSalvo] = useState(false);

  const recarregar = () => setStats(calcularStats());

  useEffect(() => { recarregar(); }, []);

  const registrar = () => {
    const a = parseInt(almoco) || 0;
    const j = parseInt(jantar) || 0;
    if (a + j === 0) return;
    registrarDia(hojeISO(), a, j);
    setAlmoco('');
    setJantar('');
    setSalvo(true);
    recarregar();
    setTimeout(() => setSalvo(false), 3000);
  };

  const hoje = stats?.hoje;
  const diaNome = DIAS_PT[new Date().getDay()];
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const varAno = stats && stats.anoPassado > 0
    ? Math.round(((stats.anoAtual - stats.anoPassado) / stats.anoPassado) * 100)
    : null;

  return (
    <Cartao>
      <p className="mb-4 text-sm font-extrabold uppercase tracking-widest text-carvao-400">
        Refeições
      </p>

      {/* Hoje */}
      <div className="mb-4 rounded-2xl bg-brand-50 px-4 py-3 dark:bg-carvao-800/60">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Hoje — {diaNome}, {dataFormatada}
        </p>

        {hoje ? (
          <div className="flex items-end gap-6">
            <div>
              <p className="text-4xl font-black tabular-nums text-carvao-900 dark:text-white">
                {fmt(hoje.total)}
              </p>
              <p className="mt-0.5 text-xs text-carvao-400">
                Almoço {hoje.almoco} · Jantar {hoje.jantar}
              </p>
            </div>
            <button
              onClick={() => { setAlmoco(String(hoje.almoco)); setJantar(String(hoje.jantar)); }}
              className="mb-1 text-xs font-semibold text-carvao-400 hover:text-carvao-600"
            >
              Editar
            </button>
          </div>
        ) : (
          <p className="text-sm text-carvao-400">Ainda não registrado hoje.</p>
        )}

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-carvao-500">Almoço</label>
            <input
              type="number"
              min="0"
              value={almoco}
              onChange={(e) => setAlmoco(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && registrar()}
              placeholder="0"
              className="w-full rounded-xl border border-carvao-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-carvao-800 focus:border-brand-400 focus:outline-none dark:border-carvao-700 dark:bg-carvao-900 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-carvao-500">Jantar</label>
            <input
              type="number"
              min="0"
              value={jantar}
              onChange={(e) => setJantar(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && registrar()}
              placeholder="0"
              className="w-full rounded-xl border border-carvao-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-carvao-800 focus:border-brand-400 focus:outline-none dark:border-carvao-700 dark:bg-carvao-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={registrar}
              disabled={salvo}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                salvo
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {salvo ? '✓' : 'OK'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-carvao-50 px-3 py-2.5 dark:bg-carvao-800/50">
            <p className="text-micro uppercase tracking-wider text-carvao-400">Esta semana</p>
            <p className="mt-0.5 text-xl font-black tabular-nums text-carvao-800 dark:text-white">
              {fmt(stats.semana)}
            </p>
          </div>

          <div className="rounded-xl bg-carvao-50 px-3 py-2.5 dark:bg-carvao-800/50">
            <p className="text-micro uppercase tracking-wider text-carvao-400">Este ano</p>
            <p className="mt-0.5 text-xl font-black tabular-nums text-carvao-800 dark:text-white">
              {fmt(stats.anoAtual)}
            </p>
            {varAno !== null && (
              <p className={`text-micro font-semibold ${varAno >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {varAno >= 0 ? '+' : ''}{varAno}% vs {Number(new Date().getFullYear()) - 1}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-carvao-50 px-3 py-2.5 dark:bg-carvao-800/50">
            <p className="text-micro uppercase tracking-wider text-carvao-400">Ano passado</p>
            <p className="mt-0.5 text-xl font-black tabular-nums text-carvao-800 dark:text-white">
              {fmt(stats.anoPassado)}
            </p>
          </div>

          <div className="rounded-xl bg-carvao-50 px-3 py-2.5 dark:bg-carvao-800/50">
            <p className="text-micro uppercase tracking-wider text-carvao-400">Total histórico</p>
            <p className="mt-0.5 text-xl font-black tabular-nums text-carvao-800 dark:text-white">
              {fmt(stats.totalHistorico)}
            </p>
            <p className="text-micro text-carvao-400">{fmt(stats.diasRegistrados)} dias</p>
          </div>
        </div>
      )}
    </Cartao>
  );
}
