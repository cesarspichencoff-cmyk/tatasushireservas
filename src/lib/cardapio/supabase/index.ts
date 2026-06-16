/* =====================================================================
   Camada Supabase (opcional, desacoplada). Ponto único de import.
   ===================================================================== */

export { supabaseConfig, supabaseHabilitado, ESPACO_DADOS } from './config';
export { getSupabase, resetSupabase, type ClienteSupabase } from './client';
export {
  armazenamentoLocal,
  armazenamentoSupabase,
  armazenamentoAtivo,
  type Armazenamento,
} from './armazenamento';
export { enviarTudo, baixarTudo, useSincronizacao, type EstadoSync } from './sync';
