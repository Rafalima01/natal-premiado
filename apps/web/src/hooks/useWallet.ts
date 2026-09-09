import { useEffect, useState } from 'react';
import type { LedgerPageResponse, WalletBalance, WalletsResponse } from '@natal/contracts';
import { apiRequest } from '@/lib/api';
import { useSession } from '@/auth/useSession';

/**
 * Dados financeiros reais da conta.
 *
 * Tudo que trafega aqui é centavo inteiro. A conversão para texto acontece
 * apenas na renderização, com `formatCents` — e `Cents` é branded, então um
 * valor em reais não chega nestes tipos sem o compilador reclamar.
 */

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAuthenticatedResource<T>(path: string, enabled: boolean): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    apiRequest<T>(path, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Falha ao carregar',
        });
      });

    return () => controller.abort();
  }, [path, enabled]);

  return state;
}

/** Saldos por carteira. Sem total agregado: ver ADR 0002, D11. */
export function useWallets() {
  const { session } = useSession();
  const state = useAuthenticatedResource<WalletsResponse>('/v1/me/wallets', Boolean(session));

  const find = (kind: WalletBalance['kind']): WalletBalance | undefined =>
    state.data?.wallets.find((wallet) => wallet.kind === kind);

  return { ...state, cash: find('CASH'), bonus: find('BONUS') };
}

/** Primeira página do extrato. A paginação por cursor entra quando a tela pedir. */
export function useLedger() {
  const { session } = useSession();
  return useAuthenticatedResource<LedgerPageResponse>('/v1/me/ledger?limit=20', Boolean(session));
}
