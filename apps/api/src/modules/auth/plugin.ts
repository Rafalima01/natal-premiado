import type { FastifyInstance, FastifyRequest, preHandlerHookHandler } from 'fastify';
import type { AuthClaims, VerifyAccessToken } from './jwt.js';
import { extractBearerToken } from './jwt.js';

/**
 * Camada 2 de 3: ponte entre HTTP e a verificação do token.
 *
 * Lê o header, chama o verificador, popula `request.auth`. Não consulta o
 * banco e não conhece `players` — quem traduz `sub` em jogador é o serviço
 * de players (camada 3).
 */

declare module 'fastify' {
  interface FastifyRequest {
    /** Preenchido pelo `requireAuth`. Ausente em rota pública. */
    auth?: AuthClaims;
  }
  interface FastifyInstance {
    /** preHandler que exige um JWT válido. */
    requireAuth: preHandlerHookHandler;
  }
}

export function registerAuth(app: FastifyInstance, verifyAccessToken: VerifyAccessToken): void {
  const requireAuth: preHandlerHookHandler = async (request) => {
    const token = extractBearerToken(request.headers.authorization);
    request.auth = await verifyAccessToken(token);
    // Só o `sub` vai para o log — nunca o token, nunca o e-mail.
    request.log.debug({ subject: request.auth.subject }, 'requisição autenticada');
  };

  app.decorate('requireAuth', requireAuth);
}

/**
 * Lê `request.auth` garantindo que o preHandler rodou.
 *
 * Se um handler chamar isto sem ter declarado `requireAuth`, o erro aparece
 * como falha de programação — e não como um 500 obscuro de leitura em undefined.
 */
export function getAuth(request: FastifyRequest): AuthClaims {
  if (!request.auth) {
    throw new Error('Rota sem requireAuth: request.auth não foi preenchido');
  }
  return request.auth;
}
