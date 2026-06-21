/**
 * Média real de refeições por dia da semana no TATÁ House.
 * Calculada a partir de todos os registros diários enviados pela equipe
 * via WhatsApp (set/2023 – jun/2026) — mais de 1.400 amostras.
 * O total inclui almoço, jantar e marmitas Pinheiros quando houver.
 */

export interface MediaDia {
  total: number;   // refeições totais preparadas na cozinha
  almoco: number;
  jantar: number;
}

// Índice segue Date.getDay(): 0 = Domingo, 1 = Segunda … 6 = Sábado
export const MEDIA_POR_DIA: MediaDia[] = [
  { total: 82, almoco: 27, jantar: 28 }, // 0 Domingo
  { total: 63, almoco: 33, jantar: 28 }, // 1 Segunda
  { total: 58, almoco: 34, jantar: 26 }, // 2 Terça
  { total: 65, almoco: 38, jantar: 28 }, // 3 Quarta
  { total: 68, almoco: 38, jantar: 31 }, // 4 Quinta
  { total: 70, almoco: 38, jantar: 33 }, // 5 Sexta
  { total: 65, almoco: 32, jantar: 32 }, // 6 Sábado
];

const NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function mediaDiaAtual(): MediaDia & { nome: string } {
  const d = new Date().getDay();
  return { ...MEDIA_POR_DIA[d], nome: NOMES[d] };
}
