import type { FastifyInstance } from 'fastify';
import { getAuth } from '../auth/plugin.js';
import { resolveIdentity } from '../wallets/service.js';

/**
 * `GET /v1/me` — ponto de entrada do provisionamento.
 *
 * Ordem deliberada: o JWT é validado ANTES de qualquer escrita. Nenhum player
 * é criado a partir de dado do frontend; ele nasce de uma identidade que o
 * backend verificou contra o JWKS do provedor.
 *
 * Idempotente: chamar N vezes devolve sempre o mesmo `players.id`.
 *
 * Desde a Fase 3 também garante as carteiras na mesma transação: o estado
 * "player existe, wallet não existe" deixou de ser representável (ADR 0002, D4).
 */
export async function playerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/me', { preHandler: app.requireAuth }, async (request) => {
    const claims = getAuth(request);
    const result = await resolveIdentity(claims);

    if (result.provisioned) {
      request.log.info({ playerId: result.player.id }, 'player provisionado');
    }

    return result;
  });
}
