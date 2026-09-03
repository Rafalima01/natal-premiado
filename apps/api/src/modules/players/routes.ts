import type { FastifyInstance } from 'fastify';
import { getPool } from '../../db/pool.js';
import { getAuth } from '../auth/plugin.js';
import { resolvePlayer } from './service.js';

/**
 * `GET /v1/me` — ponto de entrada do provisionamento.
 *
 * Ordem deliberada: o JWT é validado ANTES de qualquer escrita. Nenhum player
 * é criado a partir de dado do frontend; ele nasce de uma identidade que o
 * backend verificou contra o JWKS do provedor.
 *
 * Idempotente: chamar N vezes devolve sempre o mesmo `players.id`.
 * Não cria wallet — player sem wallet é estado válido até a Fase 3.
 */
export async function playerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/me', { preHandler: app.requireAuth }, async (request) => {
    const claims = getAuth(request);
    const result = await resolvePlayer(getPool(), claims);

    if (result.provisioned) {
      request.log.info({ playerId: result.player.id }, 'player provisionado');
    }

    return result;
  });
}
