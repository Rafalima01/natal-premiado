import type { LedgerPageResponse } from '@natal/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getPool } from '../../db/pool.js';
import { unprocessable } from '../../shared/errors.js';
import { getAuth } from '../auth/plugin.js';
import { listEntriesPage, type LedgerCursor } from '../ledger/repository.js';
import { resolveIdentity, getWallets } from './service.js';

/**
 * Rotas financeiras — SOMENTE LEITURA (ADR 0002, D1 / P2).
 *
 * Não existe rota que movimente dinheiro nesta fase: sem depósito, sem
 * webhook, sem ajuste administrativo. Crédito, débito e transferência vivem em
 * `ledger/service.ts` e só são alcançáveis de dentro do processo.
 *
 * As duas rotas derivam o jogador do token. Nenhuma delas aceita `player_id`
 * do cliente — se aceitasse, qualquer jogador autenticado leria o extrato de
 * qualquer outro.
 */

const cursorSchema = z.object({
  createdAt: z.string().min(1),
  operationId: z.string().uuid(),
  seq: z.number().int().nonnegative(),
});

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
});

/** O cursor é opaco para o cliente: base64 de uma posição na ordenação. */
function decodeCursor(raw: string): LedgerCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch {
    throw unprocessable('INVALID_CURSOR', 'Cursor inválido.');
  }
  const result = cursorSchema.safeParse(parsed);
  if (!result.success) throw unprocessable('INVALID_CURSOR', 'Cursor inválido.');
  return result.data;
}

const encodeCursor = (cursor: LedgerCursor): string =>
  Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');

export async function walletRoutes(app: FastifyInstance): Promise<void> {
  /**
   * `GET /v1/me/wallets` — saldos do jogador.
   *
   * Resolve a identidade primeiro, o que garante as carteiras: um jogador
   * criado antes da Fase 3 recebe as dele aqui, em vez de ver lista vazia.
   */
  app.get('/v1/me/wallets', { preHandler: app.requireAuth }, async (request) => {
    const claims = getAuth(request);
    const { player } = await resolveIdentity(claims);
    return getWallets(getPool(), player.id);
  });

  /**
   * `GET /v1/me/ledger` — extrato paginado por cursor.
   *
   * Cada entrada carrega o próprio `balanceAfterCents`. Não existe esse campo
   * no topo da resposta: em uma operação de duas pernas ele seria ambíguo
   * (ADR 0002, D12).
   */
  app.get('/v1/me/ledger', { preHandler: app.requireAuth }, async (request): Promise<LedgerPageResponse> => {
    const claims = getAuth(request);
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      throw unprocessable('INVALID_QUERY', 'Parâmetros de paginação inválidos.');
    }

    const { player } = await resolveIdentity(claims);
    const cursor = parsed.data.cursor ? decodeCursor(parsed.data.cursor) : null;

    const page = await listEntriesPage(getPool(), player.id, parsed.data.limit, cursor);

    return {
      entries: page.entries,
      nextCursor: page.nextCursor ? encodeCursor(page.nextCursor) : null,
    };
  });
}
