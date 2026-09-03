import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente do Supabase — usado apenas para autenticação.
 *
 * A plataforma não lê nem escreve dados de domínio por aqui: jogador, wallet
 * e ledger vivem no PostgreSQL próprio e são acessados pela API (ADR 0001, D3).
 *
 * A chave `anon` é pública por design e vai para o bundle. A `service_role`
 * não deve existir neste projeto — ela ignora RLS e daria acesso total.
 *
 * Ausência de configuração NÃO derruba a SPA. O site é público e a maior
 * parte dele não depende de login; se as variáveis não estiverem definidas,
 * a autenticação fica indisponível e o resto continua funcionando. Lançar no
 * carregamento do módulo apagaria a página inteira por causa de um recurso
 * que a maioria das rotas nem usa.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Cliente garantido, para os caminhos que exigem autenticação. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Autenticação indisponível: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}

if (!isAuthConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Login e cadastro ficam desabilitados; o restante do site funciona normalmente.',
  );
}
