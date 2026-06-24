import { describe, it, expect, beforeEach } from 'vitest';

// Ambiente mínimo de navegador para o módulo cliente (sem jsdom).
const store: Record<string, string> = {};
(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => { store[k] = String(v); },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; },
  key: () => null,
  length: 0,
} as Storage;

import { idSemanaIso, lerCardapioDoDia, registrarVotoCliente } from './avaliar-cliente';
import type { Aceitacao } from './tipos';

const P = 'cardapio.v1.';
const lerAceitacao = (): Aceitacao => JSON.parse(store[P + 'aceitacao'] || '{}');

beforeEach(() => { for (const k in store) delete store[k]; });

describe('avaliar-cliente — voto do QR chega ao gestor', () => {
  it('idSemanaIso casa com a semana ISO conhecida', () => {
    // 2026-06-24 é uma quarta-feira da semana ISO 26
    expect(idSemanaIso(new Date(2026, 5, 24))).toBe('2026-S26');
  });

  it('lê o prato do dia do documento da semana', () => {
    const doc = { dias: [{ principal: 'Feijoada', guarnicao: 'Couve', salada: 'Vinagrete' }] };
    store[P + 'semana.2026-S26'] = JSON.stringify(doc);
    const c = lerCardapioDoDia('2026-S26', 0);
    expect(c.principal).toBe('Feijoada');
    expect(c.guarnicao).toBe('Couve');
  });

  it('registra o voto na estrutura de aceitação do app (chave normalizada)', () => {
    registrarVotoCliente('Strogonoff de Frango', 'bom');
    const ac = lerAceitacao();
    const reg = ac['strogonoff de frango'];
    expect(reg).toBeDefined();
    expect(reg.bom).toBe(1);
    expect(reg.n).toBe(1);
    expect(reg.somaNotas).toBe(5); // bom = nota 5
  });

  it('votos do mesmo prato agregam', () => {
    registrarVotoCliente('Lasanha', 'bom');
    registrarVotoCliente('Lasanha', 'ruim');
    const reg = lerAceitacao()['lasanha'];
    expect(reg.n).toBe(2);
    expect(reg.bom).toBe(1);
    expect(reg.ruim).toBe(1);
    expect(reg.somaNotas).toBe(6); // 5 + 1
  });

  it('grava também a pesquisa de satisfação', () => {
    registrarVotoCliente('Moqueca', 'ok', 'menos sal');
    const sat = JSON.parse(store[P + 'satisfacao'] || '[]');
    expect(sat).toHaveLength(1);
    expect(sat[0].prato).toBe('Moqueca');
    expect(sat[0].comentario).toBe('menos sal');
  });
});
