import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Ponto de entrada das migrations (ADR 0002, A1).
 *
 * Duas razões para existir em vez de chamar o binário direto do package.json:
 *
 * 1. Exigir MIGRATION_DATABASE_URL com uma mensagem útil. Sem este guard, o
 *    node-pg-migrate cai no destino padrão do driver (localhost:5432) e falha
 *    com ECONNREFUSED — que manda a pessoa depurar rede quando o problema é
 *    uma variável não definida.
 *
 * 2. Resolver o binário por caminho, porque o carregamento do .env precisa ser
 *    do Node nativo. A flag `--envPath` do node-pg-migrate depende do pacote
 *    `dotenv`, que não está instalado aqui, e falha em silêncio.
 *
 * Nunca imprime connection string nem senha.
 */

const here = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(here, '..');
const runner = resolve(apiDir, '../../node_modules/node-pg-migrate/bin/node-pg-migrate.js');

if (!process.env.MIGRATION_DATABASE_URL) {
  console.error(
    [
      'MIGRATION_DATABASE_URL não está definida.',
      '',
      'Migrations usam uma credencial SEPARADA da aplicação (ADR 0002, A1): elas',
      'precisam de CREATEROLE e da propriedade dos objetos, privilégios que o',
      'login da aplicação não pode ter — se tivesse, o append-only do ledger não',
      'valeria nada, porque no PostgreSQL o dono da tabela ignora REVOKE.',
      '',
      'Defina-a em apps/api/.env (veja .env.example) ou no ambiente.',
      'Para rodar a suíte financeira sem configurar nada: npm run test:financial',
    ].join('\n'),
  );
  process.exit(1);
}

if (!existsSync(runner)) {
  console.error(`Binário do node-pg-migrate não encontrado em ${runner}. Rode npm install.`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [runner, '--database-url-var', 'MIGRATION_DATABASE_URL', ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: apiDir },
);

process.exit(result.status ?? 1);
