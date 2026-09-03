import type { FastifyInstance } from 'fastify';
import { pingDatabase } from '../../db/pool.js';

/**
 * Dois probes, com propósitos diferentes:
 *
 * `/health`       liveness  — o processo está vivo? Não toca no banco.
 *                 É o que o provedor usa para decidir reiniciar o container;
 *                 se consultasse o banco, uma queda momentânea do Postgres
 *                 viraria um loop de reinício da API.
 *
 * `/health/ready` readiness — dá para atender request? Consulta o banco.
 *                 É o que o load balancer usa para decidir mandar tráfego.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'natal-premiado-api',
    uptimeSeconds: Math.floor(process.uptime()),
  }));

  app.get('/health/ready', async (_request, reply) => {
    try {
      await pingDatabase();
      return { status: 'ready', database: 'up' };
    } catch (error) {
      app.log.error({ err: error }, 'readiness: banco indisponível');
      return reply.code(503).send({ status: 'not_ready', database: 'down' });
    }
  });
}
