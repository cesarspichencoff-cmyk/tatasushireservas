import { describe, it, expect } from 'vitest';
import { normalizar } from './texto';

describe('normalizar — chave estável de prato', () => {
  it('remove acentos, baixa a caixa e colapsa espaços', () => {
    expect(normalizar('Feijoada')).toBe('feijoada');
    expect(normalizar('  FRANGO   Grelhado ')).toBe('frango grelhado');
    expect(normalizar('Filé à Parmegiana')).toBe('file a parmegiana');
  });

  it('vazio/nulo viram string vazia', () => {
    expect(normalizar('')).toBe('');
    expect(normalizar(null)).toBe('');
    expect(normalizar(undefined)).toBe('');
  });

  it('grafias equivalentes colidem na mesma chave (voto agrega certo)', () => {
    expect(normalizar('Strogonoff')).toBe(normalizar('strogonoff'));
    expect(normalizar('Pão de Alho')).toBe(normalizar('pao de  alho'));
  });
});
