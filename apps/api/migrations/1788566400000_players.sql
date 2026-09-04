-- Fase 2 — identidade do jogador.
--
-- players.id é o identificador da plataforma: imutável, gerado pela aplicação
-- (UUID v7) e usado por wallet, ledger, jogo e integração com o Vertex.
--
-- players.auth_user_id é o `sub` do provedor de autenticação. É referência
-- externa, nunca sai da plataforma e NUNCA é exposto ao Vertex (ADR 0001, D3).
-- Não há FOREIGN KEY porque `auth.users` vive em outro banco — consequência
-- aceita conscientemente no ADR.

-- Up Migration

CREATE TABLE players (
  id            uuid        NOT NULL,
  auth_user_id  uuid        NOT NULL,
  display_name  text        NOT NULL,
  email         text        NOT NULL,
  status        text        NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT players_pkey PRIMARY KEY (id),

  -- Nomes explícitos: o código identifica QUAL constraint estourou para
  -- distinguir "mesmo usuário, corrida de provisionamento" (ON CONFLICT)
  -- de "e-mail já pertence a outro player" (409). Sem nome estável, todo
  -- 23505 viraria a mesma coisa.
  CONSTRAINT players_auth_user_id_key UNIQUE (auth_user_id),
  CONSTRAINT players_email_key        UNIQUE (email),

  -- Ajuste D do ADR 0001: a aplicação normaliza, o banco garante. Com esta
  -- restrição, `WHERE email = $1` com o parâmetro normalizado é sempre
  -- correto — sem citext e sem lower() espalhado pelas consultas.
  CONSTRAINT players_email_normalized_check
    CHECK (email = lower(email) AND email = btrim(email) AND email <> ''),

  CONSTRAINT players_display_name_not_blank_check
    CHECK (btrim(display_name) <> ''),

  CONSTRAINT players_status_check
    CHECK (status IN ('active', 'suspended', 'closed'))
);

COMMENT ON TABLE  players IS 'Jogador da plataforma. Fonte da verdade da identidade; players.id é o identificador estável usado por todo o domínio.';
COMMENT ON COLUMN players.id IS 'UUID v7 gerado pela aplicação. Imutável.';
COMMENT ON COLUMN players.auth_user_id IS 'sub do provedor de autenticação. Referência externa — nunca exposta fora da plataforma.';
COMMENT ON COLUMN players.status IS 'active | suspended | closed. Suspenso ou encerrado bloqueia operação financeira.';

CREATE TRIGGER players_set_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Down Migration

-- Destrutivo por definição de rollback. Seguro nesta fase porque a tabela
-- nasce vazia. A partir da Fase 3 (tabelas financeiras) o down deixa de ser
-- aceitável em produção e a migration correspondente vai dizer isso.
DROP TABLE IF EXISTS players;
