// Posições fixas das mesas no MAPA DE CHÃO oficial do restaurante (PDF).
// Coordenadas em % do canvas do mapa (x: esquerda→direita, y: topo→base).
// O salão ocupa o topo (~0-71%) e a varanda a parte de baixo (~71-100%).
// Estas posições NÃO dependem do banco — o mapa sempre segue a planta real.

export interface PosMesa {
  x: number;
  y: number;
  /** Lugares de apoio (banquetas do bar/barra fria) — desenhados menores. */
  pequena?: boolean;
}

export const POSICAO_MESA: Record<string, PosMesa> = {
  // Banquetas do balcão do bar (topo)
  '41': { x: 31, y: 11, pequena: true },
  '42': { x: 40, y: 11, pequena: true },
  '43': { x: 48.5, y: 11, pequena: true },
  '44': { x: 58, y: 11, pequena: true },
  '45': { x: 68, y: 11, pequena: true },
  // Coluna esquerda (sofá)
  '24': { x: 14, y: 19.5 },
  '21': { x: 13.5, y: 28.5 },
  '20': { x: 13, y: 34.5 },
  // Centro (parte de cima)
  '19': { x: 47, y: 21 },
  '17': { x: 47, y: 29.5 },
  '15': { x: 47, y: 38 },
  // Parede direita (sofá), do fundo para a entrada
  '11': { x: 79, y: 17.5 },
  '10': { x: 79, y: 23.5 },
  '9': { x: 78.5, y: 29.5 },
  '8': { x: 78, y: 35.5 },
  '6': { x: 78, y: 42.5 },
  '4': { x: 78, y: 48.5 },
  '3': { x: 77.5, y: 54.5 },
  '2': { x: 77, y: 60.5 },
  '1': { x: 77, y: 66.5 },
  // Banquetas da barra fria (sushi)
  '51': { x: 28.5, y: 48, pequena: true },
  '52': { x: 28.5, y: 51.5, pequena: true },
  '53': { x: 28.5, y: 55, pequena: true },
  '54': { x: 28.5, y: 58.5, pequena: true },
  '55': { x: 28.5, y: 62, pequena: true },
  // Centro (parte de baixo, ao lado da barra fria)
  '13': { x: 46, y: 49 },
  '12': { x: 46, y: 58 },
  // Varanda — coluna direita (sofá)
  '60': { x: 78, y: 75.5 },
  '62': { x: 78, y: 83 },
  '64': { x: 78, y: 91.5 },
  // Varanda — lado esquerdo
  '66': { x: 23, y: 79 },
  '65': { x: 19.5, y: 88.5 },
  // Lugares extras da varanda (não constam no PDF)
  'V1': { x: 47, y: 79 },
  'V2': { x: 47, y: 89 },
};

/** Ordem de desenho das mesas no mapa. */
export const ORDEM_MAPA = Object.keys(POSICAO_MESA);
