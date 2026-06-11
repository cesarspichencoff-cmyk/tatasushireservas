// Posições das mesas no MAPA DE CHÃO oficial (imagem "Salão principal e
// Varanda"). Coordenadas em % do canvas (x: esquerda→direita, y: topo→base).
// O salão ocupa o topo (~0-74%) e a varanda a parte de baixo (~74-100%).
//
// Salão operacional: 24 mesas sequenciais de 2 lugares, em 3 colunas
// (de baixo para cima): direita 1-8, centro 9-16, esquerda 17-24.
// A mesa 17 não aparece numerada na imagem, mas completa a coluna
// esquerda para fechar as 24 sequenciais.
// Varanda: 60, 62, 64 (direita) e 66, 65 (esquerda) — ativas.
// Apoio (bloqueadas): banquetas do bar 41-45 e da barra fria 51-55.

export interface PosMesa {
  x: number;
  y: number;
  /** Banquetas de apoio (bar/barra fria) — desenhadas menores e bloqueadas. */
  pequena?: boolean;
}

const COLUNA = { esquerda: 19, centro: 48.5, direita: 77 };
const LINHA_BASE = 53.4; // linha de baixo das colunas do salão
const PASSO = 4.85; // espaçamento vertical entre mesas da coluna

function coluna(x: number, posicaoNaColuna: number): PosMesa {
  return { x, y: LINHA_BASE - posicaoNaColuna * PASSO };
}

export const POSICAO_MESA: Record<string, PosMesa> = {
  // Banquetas do balcão do bar (topo)
  '41': { x: 31, y: 11.7, pequena: true },
  '42': { x: 40.5, y: 11.7, pequena: true },
  '43': { x: 50, y: 11.7, pequena: true },
  '44': { x: 59.5, y: 11.7, pequena: true },
  '45': { x: 68.5, y: 11.7, pequena: true },
  // Coluna direita (1 embaixo → 8 em cima)
  '1': coluna(COLUNA.direita, 0),
  '2': coluna(COLUNA.direita, 1),
  '3': coluna(COLUNA.direita, 2),
  '4': coluna(COLUNA.direita, 3),
  '5': coluna(COLUNA.direita, 4),
  '6': coluna(COLUNA.direita, 5),
  '7': coluna(COLUNA.direita, 6),
  '8': coluna(COLUNA.direita, 7),
  // Coluna do centro (9 embaixo → 16 em cima)
  '9': coluna(COLUNA.centro, 0),
  '10': coluna(COLUNA.centro, 1),
  '11': coluna(COLUNA.centro, 2),
  '12': coluna(COLUNA.centro, 3),
  '13': coluna(COLUNA.centro, 4),
  '14': coluna(COLUNA.centro, 5),
  '15': coluna(COLUNA.centro, 6),
  '16': coluna(COLUNA.centro, 7),
  // Coluna esquerda (17 embaixo → 24 em cima)
  '17': coluna(COLUNA.esquerda, 0),
  '18': coluna(COLUNA.esquerda, 1),
  '19': coluna(COLUNA.esquerda, 2),
  '20': coluna(COLUNA.esquerda, 3),
  '21': coluna(COLUNA.esquerda, 4),
  '22': coluna(COLUNA.esquerda, 5),
  '23': coluna(COLUNA.esquerda, 6),
  '24': coluna(COLUNA.esquerda, 7),
  // Banquetas da barra fria (sushi)
  '51': { x: 28, y: 59, pequena: true },
  '52': { x: 28, y: 62, pequena: true },
  '53': { x: 28, y: 65, pequena: true },
  '54': { x: 28, y: 68, pequena: true },
  '55': { x: 28, y: 71, pequena: true },
  // Varanda — coluna direita
  '60': { x: 77, y: 79.5 },
  '62': { x: 77, y: 86.5 },
  '64': { x: 77, y: 93.5 },
  // Varanda — lado esquerdo
  '66': { x: 23, y: 82.5 },
  '65': { x: 21, y: 92 },
};

/** Ordem de desenho das mesas no mapa. */
export const ORDEM_MAPA = Object.keys(POSICAO_MESA);

/** Salão operacional: 24 mesas sequenciais de 2 lugares. */
export const MESAS_SALAO: string[] = Array.from({ length: 24 }, (_, i) => String(i + 1));

/** Varanda: continua visível e funcional na operação. */
export const MESAS_VARANDA = ['60', '62', '64', '65', '66'];

/** Todas as mesas que recebem casais (salão + varanda). */
export const MESAS_OPERACIONAIS = [...MESAS_SALAO, ...MESAS_VARANDA];

/** Numerações que NÃO aparecem no mapa de chão (ficam inativas no banco). */
export const MESAS_FORA_DO_LAYOUT = ['V1', 'V2'];
