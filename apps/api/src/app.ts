import { randomUUID } from 'node:crypto';
import cors from '@fastify/cors';
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import type { Env } from './config/env.js';
import { createSupabaseJwtVerifier, type VerifyAccessToken } from './modules/auth/jwt.js';
import { registerAuth } from './modules/auth/plugin.js';
import { healthRoutes } from './modules/health/routes.js';
import { playerRoutes } from './modules/players/routes.js';
import { walletRoutes } from './modules/wallets/routes.js';

export interface BuildAppOptions {
  /**
   * Permite injetar um verificador nos testes, evitando rede.
   * Em produção fica ausente e o verificador vem do JWKS do Supabase.
   */
  verifyAccessToken?: VerifyAccessToken;
}

/**
 * Monta a instância do Fastify. Separado de `server.ts` para que teste de
 * integração possa levantar o app sem abrir porta.
 */
export function buildApp(env: Env, options: BuildAppOptions = {}): FastifyInstance {
  const isDev = env.NODE_ENV === 'development';

  const logger: FastifyServerOptions['logger'] = {
    level: env.LOG_LEVEL,
    // Redação de segredos no log. A lista cresce conforme surgem rotas —
    // a de assinatura HMAC entra na Fase 4.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-vertex-signature"]',
        'res.headers["set-cookie"]',
      ],
      censor: '[redigido]',
    },
    // Espalhado condicionalmente: com `exactOptionalPropertyTypes`, passar
    // `transport: undefined` não é o mesmo que omitir a chave.
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
          },
        }
      : {}),
  };

  const app = Fastify({
    logger,
    // O provedor gerenciado fica atrás de proxy; sem isso o IP do cliente
    // no log é sempre o do balanceador.
    trustProxy: true,
    // Um requestId por requisição, propagado para o log e para a resposta de
    // erro — é o que liga um relato de problema à linha certa do log.
    genReqId: () => randomUUID(),
  });

  // Origem explícita, nunca `*`: a API responde a requisições autenticadas e
  // uma origem curinga com credenciais é recusada pelo próprio navegador.
  app.register(cors, {
    origin: env.CORS_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
  });

  const verifyAccessToken =
    options.verifyAccessToken ??
    createSupabaseJwtVerifier({
      supabaseUrl: env.SUPABASE_URL,
      audience: env.SUPABASE_JWT_AUDIENCE,
    });

  registerAuth(app, verifyAccessToken);

  app.register(healthRoutes);
  app.register(playerRoutes);
  app.register(walletRoutes);

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada', requestId: request.id },
    });
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const status = error.statusCode ?? 500;

    // 5xx: loga o erro completo, devolve mensagem genérica. Detalhe interno
    // não vai para o cliente, e o corpo recebido nunca é ecoado.
    if (status >= 500) {
      request.log.error({ err: error }, 'erro não tratado');
      return reply.code(status).send({
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno', requestId: request.id },
      });
    }

    return reply.code(status).send({
      error: { code: error.code ?? 'BAD_REQUEST', message: error.message, requestId: request.id },
    });
  });

  return app;
}
