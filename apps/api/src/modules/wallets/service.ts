import {
  REQUIRED_WALLET_KINDS,
  type MeResponse,
  type WalletBalance,
  type WalletsResponse,
} from '@natal/contracts';
import type { Executor } from '../players/repository.js';
import { withTransaction } from '../../db/tx.js';
import { getPool } from '../../db/pool.js';
import type { AuthClaims } from '../auth/jwt.js';
import { findByAuthUserId } from '../players/repository.js';
import { resolvePlayer, toIdentity } from '../players/service.js';
import { ensureWallets, listByPlayer } from './repository.js';

/**
 * Composição identidade + carteiras.
 *
 * Este módulo depende de `players`; `players` não depende dele. A direção
 * importa: quem traduz `sub` em jogador continua sendo um só lugar.
 */

/** Saldos do jogador. Sem total agregado, de propósito (ADR 0002, D11). */
export async function getWallets(db: Executor, playerId: string): Promise<WalletsResponse> {
  const wallets = await listByPlayer(db, playerId);
  const balances: WalletBalance[] = wallets.map((wallet) => ({
    kind: wallet.kind,
    currency: wallet.currency,
    balanceCents: wallet.balanceCents,
  }));
  return { wallets: balances };
}

/**
 * Resolve o jogador e garante que as carteiras existam.
 *
 * O estado `player existe / wallet não existe` deixa de ser representável
 * (ADR 0002, D4): ou os dois existem ao fim da chamada, ou a transação inteira
 * é revertida.
 *
 * Caminho rápido: no caso comum — jogador já provisionado, carteiras
 * completas — resolve com dois SELECTs e sem abrir transação. `/v1/me` é
 * chamada em toda sessão autenticada, e o provisionamento acontece uma única
 * vez na vida do jogador.
 *
 * A correção não depende do caminho rápido: o upsert é idempotente de qualquer
 * forma. O caminho rápido só evita o custo.
 */
export async function resolveIdentity(claims: AuthClaims): Promise<MeResponse> {
  const pool = getPool();

  const existing = await findByAuthUserId(pool, claims.subject);
  if (existing) {
    const wallets = await listByPlayer(pool, existing.id);
    if (wallets.length >= REQUIRED_WALLET_KINDS.length) {
      return { player: toIdentity(existing), provisioned: false };
    }
    // Jogador de antes da Fase 3, ou provisionamento interrompido: cai no
    // caminho transacional abaixo, que completa o que faltar.
  }

  return withTransaction(async (client) => {
    const resolved = await resolvePlayer(client, claims);
    await ensureWallets(client, resolved.player.id);
    return resolved;
  });
}
