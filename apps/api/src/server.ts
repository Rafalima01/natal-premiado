import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';
import { closePool, createPool } from './db/pool.js';

async function main(): Promise<void> {
  const env = loadEnv();
  createPool(env);

  const app = buildApp(env);

  // Encerramento gracioso: para de aceitar conexões novas, termina as em voo,
  // então fecha o pool. Sem isso, um deploy derruba requisições no meio —
  // e no caminho financeiro isso vira timeout no chamador e retry evitável.
  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'encerrando');
    try {
      await app.close();
      await closePool();
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'falha ao encerrar');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((error: unknown) => {
  // Falha na subida: sem logger ainda, imprime e sai com código de erro para
  // o provedor marcar o deploy como falho em vez de deixar um serviço morto.
  // eslint-disable-next-line no-console
  console.error('[api] falha ao iniciar:', error instanceof Error ? error.message : error);
  process.exit(1);
});
