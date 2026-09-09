import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Orquestra a suíte financeira contra um PostgreSQL controlado.
 *
 * DOIS MODOS, e a escolha é do ambiente, não do código:
 *
 *   docker   (preferido, ADR 0002 B3) — sobe um PostgreSQL efêmero, aplica as
 *            migrations, cria app_login e destrói tudo. Reproduzível e
 *            descartável por construção.
 *
 *   externo  (fallback, ADR 0002 B3-a) — usa um PostgreSQL dedicado já
 *            existente, informado por TEST_DATABASE_URL. Serve para máquinas
 *            onde o Docker não sobe. Continua sendo controlado: as garantias de
 *            papel, ownership e privilégio são as mesmas, e são verificadas
 *            pelos testes 5 e 8 conectando como app_login.
 *
 * O que NÃO muda entre os modos: as duas identidades continuam separadas, o
 * app_login continua sem ownership e sem DDL, e os testes de segurança
 * continuam obrigatórios. O modo escolhe onde, nunca o quê.
 *
 * SEGREDOS: nunca imprime connection string nem senha. A senha do app_login é
 * sorteada a cada execução, vive só em memória e o papel é removido ao final.
 */

const here = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(here, '..');
const repoRoot = resolve(apiDir, '../..');
const composeFile = resolve(repoRoot, 'docker-compose.test.yml');
const require = createRequire(import.meta.url);

const APP_USER = 'app_login';
const APP_PASSWORD = randomUUID(); // sorteada por execução, nunca persistida

const log = (message) => console.log(`[financial] ${message}`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

/** Descreve um destino sem revelar credencial. */
function describe(url) {
  const u = new URL(url);
  const user = u.username.includes('.')
    ? `${u.username.split('.')[0]}.<project-ref>`
    : u.username;
  return `${u.hostname}:${u.port || 5432}/${u.pathname.slice(1)} como ${user}`;
}

/**
 * Monta a URL de conexão do app_login a partir da URL administrativa.
 *
 * O pooler do Supabase (Supavisor) exige o formato `<role>.<project-ref>` no
 * usuário — sem o sufixo do projeto ele recusa com "no tenant identifier
 * provided". Fora do pooler, o nome do papel basta. Os parâmetros de query da
 * URL administrativa (sslmode etc.) são preservados.
 */
function appUrlFrom(adminUrl, password) {
  const u = new URL(adminUrl);
  const ref = u.username.includes('.') ? u.username.split('.').slice(1).join('.') : null;
  u.username = ref ? `${APP_USER}.${ref}` : APP_USER;
  u.password = password;
  return u.toString();
}

/**
 * Cria o login operacional da aplicação (ADR 0002, P6).
 *
 * Membro de app_role e de mais nada: sem CREATEROLE, sem CREATEDB, sem
 * superusuário. É este login que os testes 5 e 8 usam — se ele tivesse qualquer
 * um desses atributos, esses testes estariam medindo o nada.
 */
async function createAppLogin(adminUrl) {
  const pg = require('pg');
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_login') THEN
          CREATE ROLE app_login LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT;
        END IF;
      END;
      $$;
    `);
    // Senha por parâmetro não é aceita em CREATE/ALTER ROLE. O valor é um UUID
    // gerado aqui, sem entrada externa, então não há superfície de injeção.
    await client.query(`ALTER ROLE app_login WITH LOGIN PASSWORD '${APP_PASSWORD}'`);
    await client.query('GRANT app_role TO app_login');
    const db = new URL(adminUrl).pathname.slice(1);
    await client.query(`GRANT CONNECT ON DATABASE "${db}" TO app_login`);
  } finally {
    await client.end();
  }
}

/**
 * Invalida a senha do login operacional ao final da execução.
 *
 * NÃO apaga o papel, e isso é deliberado. Apagar e recriar troca o OID do papel
 * a cada execução; o pooler do Supabase (Supavisor) mantém o OID em cache e a
 * execução seguinte falha com `42704 invalid role OID`. Medido — foi
 * exatamente o que quebrou os testes 5 e 8 na primeira tentativa.
 *
 * Trocar a senha por um valor aleatório descartado em seguida deixa o papel
 * inutilizável, que é a propriedade que interessa: nenhuma credencial usável
 * sobrevive à execução, e nenhuma senha é escrita em disco, log ou git.
 */
async function expireAppLogin(adminUrl) {
  const pg = require('pg');
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(`ALTER ROLE app_login WITH PASSWORD '${randomUUID()}'`);
  } finally {
    await client.end();
  }
}

async function waitForPostgres(url, timeoutMs = 90_000) {
  const pg = require('pg');
  const deadline = Date.now() + timeoutMs;
  let lastCode;

  while (Date.now() < deadline) {
    const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      await client.query('select 1');
      await client.end();
      return;
    } catch (error) {
      lastCode = error.code;
      await client.end().catch(() => {});
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  // A mensagem do driver pode conter a connection string; só o código sai.
  throw new Error(`Banco não respondeu a tempo (${lastCode ?? 'sem código'})`);
}

function applyMigrations(adminUrl) {
  const status = run('node', [resolve(here, 'migrate.mjs'), 'up'], {
    cwd: apiDir,
    env: { ...process.env, MIGRATION_DATABASE_URL: adminUrl },
  });
  if (status !== 0) throw new Error('migrations falharam');
}

function runSuite(adminUrl, appUrl) {
  // --test-concurrency=1: um arquivo por vez. Sem isso, os três arquivos de
  // integração abrem seus pools simultaneamente e estouram o limite de sessões
  // do destino (no pooler do Supabase, 15). A concorrência que os testes 2, 3 e
  // 10 exercitam é DENTRO de cada arquivo, com Promise.all — essa continua
  // intacta; o que fica serializado é a execução dos arquivos entre si.
  return run('node', ['--import', 'tsx', '--test', '--test-concurrency=1', '"src/**/*.test.ts"'], {
    cwd: apiDir,
    env: {
      ...process.env,
      // Setup, fixtures e inspeção administrativa.
      TEST_DATABASE_URL: adminUrl,
      // Provas de privilégio real, como a aplicação (ADR 0002, decisão C).
      TEST_APP_DATABASE_URL: appUrl,
      // Impede que um DATABASE_URL local seja confundido com o banco de teste
      // pela trava de segurança da suíte.
      DATABASE_URL: '',
    },
  });
}

// --- seleção de modo ---------------------------------------------------------

const external = process.env.TEST_DATABASE_URL?.trim();
const mode = external ? 'externo' : 'docker';

let exitCode = 1;
let adminUrl;
let usedDocker = false;

try {
  if (mode === 'externo') {
    adminUrl = external;

    if (adminUrl === process.env.DATABASE_URL?.trim()) {
      throw new Error(
        'TEST_DATABASE_URL e DATABASE_URL apontam para o mesmo destino. A suíte escreve dados: use um banco dedicado a teste.',
      );
    }

    log(`modo EXTERNO — destino: ${describe(adminUrl)}`);
    log('o banco precisa ser dedicado a teste; a suíte escreve dados nele.');
    await waitForPostgres(adminUrl, 20_000);
  } else {
    const pgUrl = 'postgresql://migration_login:local-test-only@127.0.0.1:5432/natal_test';
    adminUrl = pgUrl;
    log('modo DOCKER — subindo PostgreSQL efêmero…');
    if (run('docker', ['compose', '-f', composeFile, 'up', '-d'], { cwd: repoRoot }) !== 0) {
      throw new Error('docker compose up falhou');
    }
    usedDocker = true;
    log('aguardando o banco aceitar conexão…');
    await waitForPostgres(adminUrl);
  }

  log('aplicando migrations (identidade de migration)…');
  applyMigrations(adminUrl);

  log('criando app_login (membro de app_role, sem ownership)…');
  await createAppLogin(adminUrl);

  // Valida a conexão da aplicação ANTES da suíte. Sem isso, uma falha aqui
  // aparece no meio dos testes 5 e 8 como se fosse defeito de append-only — e
  // um erro de infraestrutura disfarçado de falha de segurança é a pior forma
  // de ler um resultado.
  const appUrl = appUrlFrom(adminUrl, APP_PASSWORD);
  log('validando a conexão como app_login…');
  await waitForPostgres(appUrl, 30_000);

  log('executando a suíte…');
  exitCode = runSuite(adminUrl, appUrl);
} catch (error) {
  log(`ERRO: ${error.message}`);
  exitCode = 1;
} finally {
  if (mode === 'externo' && adminUrl) {
    log('invalidando a senha do app_login…');
    await expireAppLogin(adminUrl).catch((e) =>
      log(`falha ao invalidar app_login: ${e.code ?? e.message}`),
    );
  }
  if (usedDocker) {
    log('destruindo o ambiente efêmero…');
    run('docker', ['compose', '-f', composeFile, 'down', '-v'], { cwd: repoRoot });
  }
}

process.exit(exitCode);
