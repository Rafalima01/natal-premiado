-- Fase 3 — papéis de banco e separação de propriedade (ADR 0002, D3 / P3 / P6).
--
-- Esta migration vem ANTES das tabelas financeiras, e a ordem não é estética.
-- No PostgreSQL o dono de um objeto ignora REVOKE: ele pode reconceder a si
-- mesmo o que quiser, e o dono de um schema pode executar
-- `DROP SCHEMA public CASCADE`, que apaga o ledger inteiro sem esbarrar em
-- nenhuma permissão de tabela. Criar as tabelas financeiras antes de mover a
-- propriedade produziria tabelas nascidas com o dono errado — e consertar
-- propriedade depois de haver dinheiro dentro é mais arriscado do que fazer na
-- ordem certa.
--
-- CREDENCIAL: esta migration exige CREATEROLE e a propriedade atual dos
-- objetos. Roda sob MIGRATION_DATABASE_URL (ADR 0002, A1), nunca sob a
-- credencial da aplicação — que, por decisão, não pode ter esses privilégios.
--
-- SENHAS: nenhuma. Os três papéis abaixo são NOLOGIN. O login operacional
-- (app_login) é criado fora daqui, por `scripts/create-app-login.mjs`, que lê
-- a senha do ambiente. Senha em migration é senha em git.

-- Up Migration

-- ---------------------------------------------------------------------------
-- 1. Papéis de grupo
-- ---------------------------------------------------------------------------
-- NOLOGIN: são papéis de autorização, não identidades de conexão. Quem conecta
-- é um login que herda deles. Isso permite trocar a credencial de um ambiente
-- sem tocar em nenhum GRANT.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'migration_role') THEN
    CREATE ROLE migration_role NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_role') THEN
    CREATE ROLE app_role NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_role') THEN
    CREATE ROLE readonly_role NOLOGIN;
  END IF;
END;
$$;

COMMENT ON ROLE migration_role IS 'Dono do schema e das tabelas. Executa DDL e migrations. Ver ADR 0002, D3.';
COMMENT ON ROLE app_role        IS 'Runtime da aplicação. Nunca proprietário, nunca DDL. Ver ADR 0002, D3.';
COMMENT ON ROLE readonly_role   IS 'Somente leitura, para reconciliação e relatório. Ver ADR 0002, D3.';

-- O papel que executa esta migration precisa poder SET ROLE para migration_role,
-- porque `ALTER ... OWNER TO` exige isso de quem transfere.
--
-- Cuidado com PostgreSQL 16+: quando um papel CREATEROLE não-superusuário cria
-- outro papel, ele recebe ADMIN OPTION mas **sem SET e sem INHERIT**. Um guard
-- do tipo `IF NOT pg_has_role(..., 'MEMBER')` não protege — medido: logo após o
-- CREATE ROLE, pg_has_role(...,'MEMBER') já responde true, o GRANT é pulado, e o
-- ALTER OWNER seguinte falha com 42501 "must be able to SET ROLE".
--
-- Isso não aparece quem roda como superusuário (o container local, por exemplo),
-- e aparece em todo provedor gerenciado — que é justamente o alvo de produção.
-- Por isso o GRANT é incondicional e explícito quanto a SET.
DO $$
BEGIN
  EXECUTE format('GRANT migration_role TO %I WITH INHERIT TRUE, SET TRUE', current_user);
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Propriedade do schema
-- ---------------------------------------------------------------------------
-- Sem este passo, proteger as tabelas é trancar a gaveta e deixar a porta
-- aberta: quem é dono do schema derruba tudo o que está dentro dele.

ALTER SCHEMA public OWNER TO migration_role;

-- ---------------------------------------------------------------------------
-- 3. Propriedade das tabelas existentes
-- ---------------------------------------------------------------------------
-- pgmigrations inclusa: é o histórico de migrations, e o runner precisa
-- continuar conseguindo inserir nela. Ele roda sob MIGRATION_DATABASE_URL, cujo
-- papel é membro de migration_role e portanto herda a propriedade — o INSERT
-- de cada migration aplicada continua funcionando. A aplicação não a acessa.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['players', 'pgmigrations'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I OWNER TO migration_role', t);
    END IF;
  END LOOP;
END;
$$;

ALTER FUNCTION set_updated_at() OWNER TO migration_role;

-- ---------------------------------------------------------------------------
-- 4. Privilégios
-- ---------------------------------------------------------------------------
-- Princípio do menor privilégio. Os GRANTs abaixo só valem porque o passo 2 e
-- o 3 tiraram a propriedade do papel da aplicação — um REVOKE sobre o próprio
-- dono é decorativo, e o ADR 0002 rejeita explicitamente essa forma de
-- "proteção".

-- Ninguém além do dono cria objetos no schema. A aplicação recebe só USAGE:
-- sem CREATE ela não consegue criar tabela, view nem função.
--
-- REVOKE de CREATE apenas, e não de ALL: retirar USAGE de PUBLIC derrubaria o
-- acesso de papéis que o provedor gerenciado mantém no schema (no Supabase,
-- anon/authenticated/service_role), quebrando a camada REST do projeto sem
-- ganho de segurança nenhum. A garantia que P3 exige é a ausência de CREATE —
-- é ela que impede a aplicação de criar um objeto do qual seria dona.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_role, readonly_role;

-- players: domínio comum, a aplicação escreve.
GRANT SELECT, INSERT, UPDATE ON TABLE players TO app_role;
GRANT SELECT                  ON TABLE players TO readonly_role;

-- O histórico de migrations não é assunto da aplicação.
REVOKE ALL ON TABLE pgmigrations FROM app_role, readonly_role;

-- ---------------------------------------------------------------------------
-- 5. Privilégios padrão para objetos futuros
-- ---------------------------------------------------------------------------
-- ALTER DEFAULT PRIVILEGES é indexado pelo papel QUE CRIA o objeto, não pelo
-- dono final. As tabelas financeiras são criadas pela conexão de migration e
-- só depois têm o dono ajustado, então esta cláusula sozinha não as cobriria.
-- Ela é rede de segurança para objetos futuros criados diretamente por
-- migration_role; os privilégios que realmente valem são os GRANTs explícitos
-- de cada migration.

ALTER DEFAULT PRIVILEGES FOR ROLE migration_role IN SCHEMA public
  GRANT SELECT ON TABLES TO readonly_role;

-- Deliberadamente NÃO há default privilege de INSERT/UPDATE para app_role:
-- uma tabela financeira futura deve nascer inacessível e receber apenas o que
-- sua migration conceder explicitamente. O padrão seguro é o mais restrito.

-- Down Migration

-- Reverter a separação de papéis devolveria a propriedade ao papel da
-- aplicação, ou seja, desligaria a garantia de append-only. Como a política
-- financeira é forward-only (ADR 0002, P5), o down aqui apenas devolve a
-- propriedade ao papel que executa a migration e remove os grants — ele NÃO
-- apaga papéis, porque outros objetos podem depender deles.

REVOKE ALL ON TABLE players FROM app_role, readonly_role;
REVOKE USAGE ON SCHEMA public FROM app_role, readonly_role;
ALTER DEFAULT PRIVILEGES FOR ROLE migration_role IN SCHEMA public
  REVOKE SELECT ON TABLES FROM readonly_role;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['players', 'pgmigrations'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I OWNER TO %I', t, current_user);
    END IF;
  END LOOP;
END;
$$;

ALTER SCHEMA public OWNER TO CURRENT_USER;
