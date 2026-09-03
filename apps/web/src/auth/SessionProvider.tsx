import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { MeResponse, PlayerIdentity } from '@natal/contracts';
import { apiRequest } from '@/lib/api';
import { isAuthConfigured, requireSupabase } from '@/lib/supabase';

/**
 * Estado de autenticação da SPA.
 *
 * Duas identidades distintas, de propósito:
 *   `session` — quem o Supabase diz que é. Chega rápido, do armazenamento local.
 *   `player`  — quem a plataforma reconhece. Vem de `GET /v1/me`, que é onde
 *               o provisionamento acontece.
 *
 * A interface deve exibir `player` quando precisar de identidade da
 * plataforma. `session` serve para saber se há alguém logado.
 */

export interface SignUpResult {
  /** true quando o Supabase exige confirmação por e-mail antes da sessão. */
  needsEmailConfirmation: boolean;
}

export interface SessionState {
  session: Session | null;
  player: PlayerIdentity | null;
  /** true enquanto a sessão inicial ainda não foi resolvida. */
  loading: boolean;
  /** Erro ao resolver o player na API. Não impede o uso do site. */
  playerError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

export const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<PlayerIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    // Sem configuração de autenticação a SPA continua funcionando: resolve
    // como 'ninguém logado' e nunca chama o provedor.
    if (!isAuthConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    const client = requireSupabase();

    client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setPlayer(null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Resolve o player sempre que houver sessão. É esta chamada que provisiona
  // o jogador no primeiro acesso — nunca o cadastro no Supabase sozinho.
  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();
    setPlayerError(null);

    apiRequest<MeResponse>('/v1/me', { signal: controller.signal })
      .then((result) => setPlayer(result.player))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPlayerError(error instanceof Error ? error.message : 'Falha ao carregar o jogador');
      });

    return () => controller.abort();
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<SignUpResult> => {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: displayName.trim() } },
      });
      if (error) throw new Error(error.message);

      // Com confirmação de e-mail ligada, o Supabase devolve `user` mas não
      // devolve `session`. É esse o sinal de que ainda não há identidade
      // autenticada — e portanto nenhum player deve ser criado ainda.
      return { needsEmailConfirmation: data.session === null && data.user !== null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (isAuthConfigured) await requireSupabase().auth.signOut();
    setPlayer(null);
  }, []);

  const value = useMemo<SessionState>(
    () => ({ session, player, loading, playerError, signIn, signUp, signOut }),
    [session, player, loading, playerError, signIn, signUp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
