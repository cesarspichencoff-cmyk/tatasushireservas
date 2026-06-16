/* =====================================================================
   Configuração do Supabase (camada opcional). Enquanto as variáveis de
   ambiente não estiverem definidas, o app continua 100% em localStorage.
   ===================================================================== */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function supabaseConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      '',
  };
}

export function supabaseHabilitado(): boolean {
  const { url, anonKey } = supabaseConfig();
  return Boolean(url && anonKey);
}

export const ESPACO_DADOS = process.env.NEXT_PUBLIC_TATA_ESPACO ?? 'tata-house';

export const PREFIXO_LOCAL = 'cardapio.v1.';
