/* =====================================================================
   Stream de votos por dia — alimentado pela página /avaliar a cada voto.
   Armazenado em localStorage independente do índice de aceitação agregado,
   para não impactar a lógica existente. Chave: cardapio.v1.trm.AAAA-MM-DD

   Cada entrada tem o prato e o "horaMin" (hora*60+minuto) para calcular
   tendências em janelas de tempo (ex.: últimos 30 min do serviço).
   ===================================================================== */

export type VotoDia = {
  prato: string;
  voto: 'bom' | 'ok' | 'ruim';
  horaMin: number;
};

function chaveHoje(data?: string): string {
  return `cardapio.v1.trm.${data ?? new Date().toISOString().slice(0, 10)}`;
}

export function registrarVotoDia(prato: string, voto: 'bom' | 'ok' | 'ruim'): void {
  try {
    const chave = chaveHoje();
    const lista: VotoDia[] = JSON.parse(localStorage.getItem(chave) ?? '[]');
    const t = new Date();
    lista.push({ prato, voto, horaMin: t.getHours() * 60 + t.getMinutes() });
    localStorage.setItem(chave, JSON.stringify(lista));
  } catch {
    /* sem localStorage */
  }
}

export function lerVotosDia(data?: string): VotoDia[] {
  try {
    return JSON.parse(localStorage.getItem(chaveHoje(data)) ?? '[]');
  } catch {
    return [];
  }
}
