'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlternadorTema } from '@/components/AlternadorTema';
import { BottomNav, GRUPOS } from '@/components/BottomNav';
import { ToastHost, toast } from '@/components/Toast';
import { Icone } from '@/components/Icones';
import { BottomSheet, Skeleton } from '@/components/ui';
import { AbaAgora } from '@/components/cardapio/AbaAgora';
import { AbaAceitacao } from '@/components/cardapio/AbaAceitacao';
import { AbaCardapio } from '@/components/cardapio/AbaCardapio';
import { AbaCompras } from '@/components/cardapio/AbaCompras';
import { AbaDesperdicio } from '@/components/cardapio/AbaDesperdicio';
import { AbaEstoque } from '@/components/cardapio/AbaEstoque';
import { AbaFluxo } from '@/components/cardapio/AbaFluxo';
import { AbaRadar } from '@/components/cardapio/AbaRadar';
import { CentralGerencial } from '@/components/cardapio/CentralGerencial';
import { Configuracoes } from '@/components/cardapio/Configuracoes';
import { Assistente } from '@/components/cardapio/Assistente';
import { PosterSemana } from '@/components/cardapio/PosterSemana';
import {
  deslocarSemana,
  idSemanaIso,
  lerSemana,
  periodoSemana,
  rotuloSemana,
  semanasComConteudo,
  useAceitacao,
  useAprendizado,
  useDesperdicio,
  useEstoque,
  useEventos,
  useFornecedores,
  useHistoricoPrecos,
  useItensExtras,
  usePapel,
  usePrecos,
  useSemana,
} from '@/lib/cardapio/estado';
import { useLogo } from '@/lib/cardapio/logo';
import { useLogin, abasDoPapel } from '@/lib/cardapio/login';
import { Login } from '@/components/Login';
import { pode } from '@/lib/cardapio/org';
import type { Etapa } from '@/lib/cardapio/tipos';

/* ── abas ────────────────────────────────────────────────── */

const ABAS = [
  { id: 'agora',      rotulo: 'Início'     },
  { id: 'cardapio',   rotulo: 'Cardápio'   },
  { id: 'compras',    rotulo: 'Compras'    },
  { id: 'relatorios', rotulo: 'Relatórios' },
  { id: 'ajustes',    rotulo: 'Ajustes'    },
] as const;

type AbaId = (typeof ABAS)[number]['id'];

/* ── badge de etapa ──────────────────────────────────────── */

const ROTULO_ETAPA: Record<Etapa, string> = {
  rascunho:    'Rascunho',
  cozinha:     'Na cozinha',
  compras:     'Em compra',
  recebimento: 'Recebendo',
  concluido:   'Concluída',
};

const COR_ETAPA: Record<Etapa, string> = {
  rascunho:    'bg-carvao-400/10    text-carvao-500  ring-carvao-400/25',
  cozinha:     'bg-ouro-400/10      text-ouro-700    ring-ouro-400/25   dark:text-ouro-300',
  compras:     'bg-[#2d6f8e]/10    text-[#2d6f8e]   ring-[#2d6f8e]/25  dark:text-[#7cb8d4]',
  recebimento: 'bg-ouro-400/10      text-ouro-600    ring-ouro-400/25   dark:text-ouro-300',
  concluido:   'bg-brand-500/10     text-brand-600   ring-brand-500/25',
};

/* ── busca global ────────────────────────────────────────── */

interface ResultadoBusca {
  tipo: 'cardapio' | 'compra' | 'fornecedor' | 'relatorio' | 'acao';
  titulo: string;
  subtitulo?: string;
  acao: () => void;
}

function useBuscaGlobal(
  estado: ReturnType<typeof useSemana>['estado'],
  precos: Record<string, number>,
  fornecedores: Record<string, string>,
  irPara: (aba: AbaId) => void,
) {
  return (termo: string): ResultadoBusca[] => {
    if (termo.trim().length < 2) return [];
    const t = termo.toLowerCase().trim();
    const res: ResultadoBusca[] = [];

    // pratos da semana atual
    const DIAS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    estado.dias.forEach((d, i) => {
      [d.principal, d.guarnicaoFixa, d.guarnicao, d.salada, d.sobremesa]
        .filter(Boolean)
        .forEach((prato) => {
          if (prato!.toLowerCase().includes(t)) {
            res.push({
              tipo: 'cardapio',
              titulo: prato!,
              subtitulo: DIAS_PT[i] + ' · semana atual',
              acao: () => irPara('cardapio'),
            });
          }
        });
    });

    // itens da lista de compras (via preços)
    Object.entries(precos).forEach(([item, preco]) => {
      if (item.toLowerCase().includes(t)) {
        res.push({
          tipo: 'compra',
          titulo: item,
          subtitulo: preco ? `R$ ${preco.toFixed(2)}` : 'sem preço',
          acao: () => irPara('compras'),
        });
      }
    });

    // fornecedores
    Object.entries(fornecedores).forEach(([item, marca]) => {
      if (marca.toLowerCase().includes(t) || item.toLowerCase().includes(t)) {
        res.push({
          tipo: 'fornecedor',
          titulo: marca,
          subtitulo: item,
          acao: () => irPara('relatorios'),
        });
      }
    });

    // relatórios
    ['Custo semanal', 'Aceitação', 'Desperdício', 'Exportar CSV', 'Auditoria'].forEach((r) => {
      if (r.toLowerCase().includes(t)) {
        res.push({ tipo: 'relatorio', titulo: r, acao: () => irPara('relatorios') });
      }
    });

    return res.slice(0, 8);
  };
}

const ICONE_TIPO: Record<ResultadoBusca['tipo'], React.ReactNode> = {
  cardapio:   <Icone nome="cardapio"  tam={14} />,
  compra:     <Icone nome="compras"   tam={14} />,
  fornecedor: <Icone nome="usuario"   tam={14} />,
  relatorio:  <Icone nome="insights"  tam={14} />,
  acao:       <Icone nome="raio"      tam={14} />,
};

/* ── componente busca ────────────────────────────────────── */

function BuscaGlobal({
  buscar,
  aoFechar,
}: {
  buscar: (t: string) => ResultadoBusca[];
  aoFechar: () => void;
}) {
  const [termo, setTermo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultados = useMemo(() => buscar(termo), [buscar, termo]);

  useEffect(() => {
    inputRef.current?.focus();
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm" onClick={aoFechar}>
      <div
        className="mx-auto mt-16 w-full max-w-lg px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* campo de busca */}
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-2xl ring-1 ring-carvao-200 dark:bg-carvao-900 dark:ring-carvao-600">
          <Icone nome="busca" tam={18} className="shrink-0 text-carvao-400" />
          <input
            ref={inputRef}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar cardápio, ingrediente, fornecedor, relatório…"
            className="flex-1 bg-transparent text-[15px] text-carvao-800 outline-none placeholder:text-carvao-400 dark:text-areia-100"
          />
          {termo && (
            <button onClick={() => setTermo('')} className="text-carvao-400 hover:text-carvao-600">
              <Icone nome="fechar" tam={16} />
            </button>
          )}
          <kbd className="hidden rounded bg-carvao-100 px-1.5 py-0.5 text-[11px] font-semibold text-carvao-400 sm:block dark:bg-carvao-700">
            esc
          </kbd>
        </div>

        {/* resultados */}
        {resultados.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-carvao-200 dark:bg-carvao-900 dark:ring-carvao-600">
            {resultados.map((r, i) => (
              <button
                key={i}
                onClick={() => { r.acao(); aoFechar(); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-carvao-50 dark:hover:bg-carvao-800 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-carvao-100 dark:[&:not(:last-child)]:border-carvao-700"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-carvao-100 text-carvao-500 dark:bg-carvao-700 dark:text-carvao-300">
                  {ICONE_TIPO[r.tipo]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-carvao-800 dark:text-areia-100">{r.titulo}</p>
                  {r.subtitulo && (
                    <p className="truncate text-xs text-carvao-400">{r.subtitulo}</p>
                  )}
                </div>
                <Icone nome="proximo" tam={14} className="ml-auto shrink-0 text-carvao-300" />
              </button>
            ))}
          </div>
        )}

        {termo.trim().length >= 2 && resultados.length === 0 && (
          <div className="mt-2 rounded-2xl bg-white px-4 py-6 text-center shadow-xl ring-1 ring-carvao-200 dark:bg-carvao-900 dark:ring-carvao-600">
            <p className="text-sm text-carvao-400">Nenhum resultado para "{termo}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── componente principal ────────────────────────────────── */

export default function PaginaCardapios() {
  const [semanaId, setSemanaId] = useState(() => idSemanaIso(new Date()));
  const [aba, setAba] = useState<AbaId>('agora');
  const [posterAberto, setPosterAberto] = useState(false);
  const [semanaSheet, setSemanaSheet] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [abaCompras, setAbaCompras] = useState<'lista' | 'estoque'>('lista');

  const { estado, atualizar, pronto } = useSemana(semanaId);
  const { precos, definirPreco } = usePrecos();
  const { fornecedores, definirFornecedor } = useFornecedores();
  const { itensExtras, cadastrarItem } = useItensExtras();
  const { fatores, aprenderDeSemana } = useAprendizado();
  const { papel } = usePapel();
  const { perfil, perfilId, pronto: loginPronto, sair } = useLogin();
  const { logo } = useLogo();
  const { estoque, movimentar, definirMinimo, definirSaldo } = useEstoque();
  const { aceitacao, avaliar } = useAceitacao();
  const { eventos, adicionar: addEvento, remover: rmEvento } = useEventos();
  const { registros: desperdicio, adicionar: addDesperdicio, remover: rmDesperdicio } = useDesperdicio(semanaId);
  const historico = useHistoricoPrecos();

  const semanaAtualId = idSemanaIso(new Date());

  const abasPermitidas = useMemo(() => abasDoPapel(papel), [papel]);
  const gruposVisiveis = useMemo(
    () => GRUPOS.filter((g) => g.abas.some((a) => abasPermitidas.includes(a as AbaId))),
    [abasPermitidas],
  );
  const grupoAtivo = GRUPOS.find((g) => g.abas.includes(aba)) ?? GRUPOS[0];

  const irSemana = (delta: number) => setSemanaId(deslocarSemana(semanaId, delta));
  const irPara = (alvo: AbaId) => {
    if (abasPermitidas.includes(alvo)) setAba(alvo);
  };

  const listaSemanas = useMemo(() => {
    const set = new Set<string>();
    for (let i = -2; i <= 8; i++) set.add(deslocarSemana(semanaAtualId, i));
    semanasComConteudo().forEach((id) => set.add(id));
    set.add(semanaId);
    return Array.from(set).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaId, semanaAtualId, semanaSheet]);

  const duplicarSemanaAnterior = () => {
    const origem = lerSemana(deslocarSemana(semanaId, -1));
    if (!origem.dias.some((d) => d.principal)) {
      toast('A semana anterior está vazia', 'erro');
      return;
    }
    atualizar((e) => ({
      ...e,
      dias: e.dias.map((d, i) => ({
        ...d,
        principal:     origem.dias[i]?.principal     ?? '',
        guarnicaoFixa: origem.dias[i]?.guarnicaoFixa ?? d.guarnicaoFixa,
        guarnicao:     origem.dias[i]?.guarnicao     ?? '',
        salada:        origem.dias[i]?.salada        ?? '',
        sobremesa:     origem.dias[i]?.sobremesa     ?? '',
      })),
      ajustes: {},
    }));
    toast('Cardápio duplicado da semana anterior');
    setSemanaSheet(false);
  };

  const podeEditarCardapio = pode(papel, 'cardapio:editar') && (estado.etapa === 'rascunho' || estado.etapa === 'cozinha');
  const podeEstoque = pode(papel, 'estoque:gerenciar');
  const podeAvaliar = pode(papel, 'cardapio:editar');

  const buscarFn = useBuscaGlobal(estado, precos, fornecedores, irPara);

  // atalho de teclado ⌘K / Ctrl+K
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setBuscaAberta(true); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // redireciona para primeira aba permitida se a atual for bloqueada
  useEffect(() => {
    if (!abasPermitidas.includes(aba)) setAba(abasPermitidas[0] as AbaId);
  }, [abasPermitidas, aba]);

  if (!loginPronto) return null;
  if (!perfilId) return <Login />;

  if (posterAberto) {
    return <PosterSemana estado={estado} semanaId={semanaId} aoFechar={() => setPosterAberto(false)} />;
  }

  return (
    <>
      {/* ── Busca global (overlay) ───────────────────────── */}
      {buscaAberta && (
        <BuscaGlobal buscar={buscarFn} aoFechar={() => setBuscaAberta(false)} />
      )}

      {/* ── Cabeçalho ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-800 text-white shadow-media print:hidden">
        <div className="h-1 w-full bg-gradient-to-r from-ouro-600 via-ouro-300 to-ouro-600" />
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">

          {/* Marca */}
          <div className="flex min-w-0 items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-10 w-auto max-w-[120px] shrink-0 object-contain" />
            ) : (
              <span className="h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-ouro-300 to-ouro-500" aria-hidden />
            )}
            <div className="min-w-0 leading-tight">
              <div className="truncate font-display text-[17px] font-bold tracking-[0.18em] sm:text-[19px] sm:tracking-[0.26em]">
                TATÁ&nbsp;HOUSE
              </div>
              <div className="truncate text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-200">
                Refeitório do Tatá Sushi
              </div>
            </div>
          </div>

          {/* Busca — pill central */}
          <button
            onClick={() => setBuscaAberta(true)}
            className="mx-auto hidden max-w-xs flex-1 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white/70 ring-1 ring-white/25 transition hover:bg-white/25 sm:flex"
          >
            <Icone nome="busca" tam={14} />
            <span>Buscar…</span>
            <kbd className="ml-auto text-[11px] font-semibold text-white/40">⌘K</kbd>
          </button>

          {/* Ações do header */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
            {/* Busca — ícone mobile */}
            <button
              onClick={() => setBuscaAberta(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25 sm:hidden"
              aria-label="Buscar"
            >
              <Icone nome="busca" tam={16} />
            </button>
            <span className="hidden items-center gap-1.5 rounded-full bg-white/15 py-1.5 pl-3 pr-3 text-xs font-semibold text-white ring-1 ring-white/25 sm:flex">
              <Icone nome="usuario" tam={14} className="text-white/70" />
              {perfil?.rotulo ?? 'Perfil'}
            </span>
            <button
              onClick={() => { sair(); if (typeof window !== 'undefined') window.location.reload(); }}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              Sair
            </button>
            <AlternadorTema />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 pb-28 pt-5 lg:pb-8">

        {/* ── Barra de semana ─────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-carvao-800 dark:text-areia-100 sm:text-3xl">
              {periodoSemana(semanaId)}
              <span
                className={`ml-2.5 inline-flex translate-y-[-2px] items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${COR_ETAPA[estado.etapa]}`}
              >
                {ROTULO_ETAPA[estado.etapa]}
              </span>
            </h1>
            <p className="text-sm font-semibold text-carvao-500 dark:text-carvao-300">
              {semanaId === semanaAtualId ? 'Semana atual' : 'Semana planejada'}{' '}
              <span className="font-normal text-carvao-400">· segunda a domingo</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-2xl border border-carvao-200 bg-white p-1 dark:border-carvao-600 dark:bg-carvao-900">
              <button
                onClick={() => irSemana(-1)}
                aria-label="Semana anterior"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-carvao-500 transition hover:bg-carvao-100 dark:hover:bg-carvao-800"
              >
                <Icone nome="anterior" tam={18} />
              </button>
              <button
                onClick={() => setSemanaSheet(true)}
                className="flex min-w-[104px] items-center justify-center gap-1.5 rounded-xl px-1 py-1 text-sm font-bold tabular-nums transition hover:bg-carvao-100 dark:hover:bg-carvao-800"
              >
                <Icone nome="calendario" tam={15} className="text-carvao-400" />
                {periodoSemana(semanaId)}
              </button>
              <button
                onClick={() => irSemana(1)}
                aria-label="Próxima semana"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-carvao-500 transition hover:bg-carvao-100 dark:hover:bg-carvao-800"
              >
                <Icone nome="proximo" tam={18} />
              </button>
            </div>
            <button
              onClick={() => setPosterAberto(true)}
              className="flex h-11 min-h-11 items-center gap-1.5 whitespace-nowrap rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 px-4 text-sm font-bold text-white shadow-suave ring-1 ring-ouro-400/50 transition hover:from-brand-800 hover:to-brand-700"
            >
              <Icone nome="imagem" tam={18} />
              <span className="hidden sm:inline">Pôster</span>
            </button>
          </div>
        </div>

        {/* ── Navegação desktop ────────────────────────────── */}
        <nav className="hidden gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-carvao-200 lg:flex dark:bg-carvao-800 dark:ring-carvao-600 print:hidden">
          {ABAS.filter((a) => abasPermitidas.includes(a.id)).map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-5 text-[13px] font-semibold tracking-tight transition ${
                aba === a.id
                  ? 'bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow-suave'
                  : 'text-carvao-500 hover:bg-brand-50 hover:text-brand-700 dark:text-areia-200 dark:hover:bg-carvao-700'
              }`}
            >
              {a.rotulo}
            </button>
          ))}
        </nav>

        {/* ── Conteúdo ─────────────────────────────────────── */}
        {!pronto ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* ── INÍCIO ────────────────────────────────────── */}
            {aba === 'agora' && (
              <AbaAgora
                estado={estado}
                precos={precos}
                aceitacao={aceitacao}
                fatores={fatores}
                papel={papel}
                irPara={(alvo) => irPara(alvo as AbaId)}
              />
            )}

            {/* ── CARDÁPIO ──────────────────────────────────── */}
            {aba === 'cardapio' && (
              <div className="space-y-6">
                <AbaCardapio
                  estado={estado}
                  atualizar={atualizar}
                  podeEditar={podeEditarCardapio}
                  precos={precos}
                  definirPreco={definirPreco}
                />
                <AbaFluxo
                  estado={estado}
                  atualizar={atualizar}
                  papel={papel}
                  precos={precos}
                  fatores={fatores}
                  aprenderDeSemana={aprenderDeSemana}
                />
                {/* Feedback integrado ao fluxo — aparece quando concluído */}
                {(estado.etapa === 'concluido' || estado.etapa === 'recebimento') && podeAvaliar && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-carvao-100 dark:bg-carvao-700" />
                      <span className="text-xs font-bold uppercase tracking-widest text-carvao-400">
                        Avaliação da semana
                      </span>
                      <div className="h-px flex-1 bg-carvao-100 dark:bg-carvao-700" />
                    </div>
                    <AbaAceitacao
                      estado={estado}
                      aceitacao={aceitacao}
                      avaliar={avaliar}
                      eventos={eventos}
                      addEvento={addEvento}
                      rmEvento={rmEvento}
                      desperdicio={desperdicio}
                      podeEditar={podeAvaliar}
                    />
                    <AbaDesperdicio
                      estado={estado}
                      precos={precos}
                      fatores={fatores}
                      registros={desperdicio}
                      adicionar={addDesperdicio}
                      remover={rmDesperdicio}
                      podeEditar={podeEstoque}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── COMPRAS ───────────────────────────────────── */}
            {aba === 'compras' && (
              <div className="space-y-4">
                {/* segmento Lista / Estoque */}
                <div className="flex rounded-2xl border border-carvao-200 bg-white p-1 dark:border-carvao-600 dark:bg-carvao-900">
                  {(['lista', 'estoque'] as const).map((seg) => (
                    <button
                      key={seg}
                      onClick={() => setAbaCompras(seg)}
                      className={`flex-1 rounded-xl py-2 text-[13px] font-semibold transition ${
                        abaCompras === seg
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-carvao-500 hover:text-carvao-700 dark:text-carvao-400'
                      }`}
                    >
                      {seg === 'lista' ? 'Lista de compras' : 'Estoque'}
                    </button>
                  ))}
                </div>

                {abaCompras === 'lista' && (
                  <AbaCompras
                    estado={estado}
                    atualizar={atualizar}
                    papel={papel}
                    precos={precos}
                    fornecedores={fornecedores}
                    fatores={fatores}
                  />
                )}

                {abaCompras === 'estoque' && (
                  <AbaEstoque
                    estado={estado}
                    fatores={fatores}
                    estoque={estoque}
                    movimentar={movimentar}
                    definirMinimo={definirMinimo}
                    definirSaldo={definirSaldo}
                    podeEditar={podeEstoque}
                  />
                )}
              </div>
            )}

            {/* ── RELATÓRIOS ────────────────────────────────── */}
            {aba === 'relatorios' && (
              <div className="space-y-4">
                {/* cabeçalho da seção com exportar sempre visível */}
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-carvao-800 dark:text-areia-100">
                    Relatórios
                  </h2>
                  <div className="flex items-center gap-2">
                    <AbaRadar precos={precos} historico={historico} fornecedores={fornecedores} />
                  </div>
                </div>
                <CentralGerencial
                  estado={estado}
                  semanaId={semanaId}
                  precos={precos}
                  historico={historico}
                  aceitacao={aceitacao}
                  fornecedores={fornecedores}
                  fatores={fatores}
                />
              </div>
            )}

            {/* ── AJUSTES ───────────────────────────────────── */}
            {aba === 'ajustes' && (
              <div className="space-y-6">
                {/* Catálogo de preços */}
                <SecaoAjuste titulo="Catálogo de preços e fornecedores">
                  <AbaCotacaoInline
                    precos={precos}
                    definirPreco={definirPreco}
                    definirFornecedor={definirFornecedor}
                    cadastrarItem={cadastrarItem}
                    itensExtras={itensExtras}
                  />
                </SecaoAjuste>

                {/* Configurações (PINs etc) — só gerência */}
                {(papel === 'administrador' || papel === 'gestor') && (
                  <SecaoAjuste titulo="Configurações de acesso">
                    <Configuracoes />
                  </SecaoAjuste>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Sheet: Seletor de semana ─────────────────────── */}
      <BottomSheet titulo="Escolher semana" aberto={semanaSheet} aoFechar={() => setSemanaSheet(false)}>
        <div className="mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={duplicarSemanaAnterior}
              disabled={!podeEditarCardapio}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-brand-50 px-3 py-2.5 text-[13px] font-bold text-brand-700 ring-1 ring-brand-500/30 transition hover:bg-brand-100 disabled:opacity-40 dark:bg-carvao-700 dark:text-brand-300"
            >
              <Icone nome="somar" tam={16} /> Duplicar anterior
            </button>
            <button
              onClick={() => { setSemanaId(deslocarSemana(semanaId, 1)); setSemanaSheet(false); }}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-carvao-100 px-3 py-2.5 text-[13px] font-bold text-carvao-600 transition hover:bg-carvao-200 dark:bg-carvao-700 dark:text-areia-200"
            >
              <Icone nome="proximo" tam={16} /> Próxima semana
            </button>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-carvao-200 px-3 py-2 dark:border-carvao-600">
            <Icone nome="calendario" tam={16} className="shrink-0 text-carvao-400" />
            <span className="shrink-0 text-[13px] font-semibold text-carvao-500">Ir para a semana de</span>
            <input
              type="date"
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                setSemanaId(idSemanaIso(new Date(y, m - 1, d)));
                setSemanaSheet(false);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:[color-scheme:dark]"
            />
          </label>
        </div>
        <div className="space-y-1">
          {listaSemanas.map((id) => (
            <button
              key={id}
              onClick={() => { setSemanaId(id); setSemanaSheet(false); }}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold tabular-nums transition ${
                id === semanaId
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500/30 dark:bg-carvao-700 dark:text-brand-300'
                  : 'hover:bg-carvao-50 dark:hover:bg-carvao-800'
              }`}
            >
              <span>{rotuloSemana(id)}</span>
              {id === semanaAtualId && (
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">atual</span>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomNav
        grupos={gruposVisiveis}
        grupoAtivo={grupoAtivo.id}
        aoSelecionar={(g) => {
          const grupo = GRUPOS.find((x) => x.id === g);
          if (grupo) setAba(grupo.abas[0] as AbaId);
        }}
      />
      <Assistente contexto={{ estado, semanaId, precos, historico, fornecedores, aceitacao, estoque, fatores }} />
      <ToastHost />
    </>
  );
}

/* ── Seção de Ajustes ────────────────────────────────────── */

function SecaoAjuste({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white shadow-sm ring-1 ring-carvao-100 dark:bg-carvao-850 dark:ring-carvao-700">
      <div className="border-b border-carvao-100 px-6 py-4 dark:border-carvao-700">
        <h2 className="font-display text-base font-bold text-carvao-700 dark:text-areia-200">{titulo}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ── Cotação inline (em Ajustes) ─────────────────────────── */

import { AbaCotacao } from '@/components/cardapio/AbaCotacao';

function AbaCotacaoInline({
  precos,
  definirPreco,
  definirFornecedor,
  cadastrarItem,
  itensExtras,
}: {
  precos: Record<string, number>;
  definirPreco: (itemNorm: string, valor: number | null, nome?: string) => void;
  definirFornecedor?: (itemNorm: string, marca: string | null) => void;
  cadastrarItem?: (norm: string, nome: string, unid: string) => void;
  itensExtras?: Record<string, { n: string; u: string }>;
}) {
  return (
    <AbaCotacao
      definirPreco={definirPreco}
      definirFornecedor={definirFornecedor}
      cadastrarItem={cadastrarItem}
      itensExtras={itensExtras ?? {}}
    />
  );
}
