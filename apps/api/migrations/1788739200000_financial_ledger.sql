-- Fase 3 — schema financeiro: wallets, ledger_operations, wallet_entries.
--
-- POLÍTICA (ADR 0002, P5): o domínio financeiro é FORWARD-ONLY. A partir do
-- momento em que existir lançamento real, correções acontecem por NOVAS
-- migrations e por lançamentos compensatórios — nunca por rollback, nunca por
-- UPDATE em lançamento existente. O `down` desta migration se recusa a rodar se
-- houver qualquer dado financeiro, e essa recusa é o que torna a política
-- executável em vez de um parágrafo de documentação.
--
-- Depende de 1788652800000_roles_and_ownership: as tabelas abaixo nascem com
-- dono migration_role, e o append-only só é real porque a aplicação não é dona.
--
-- Dinheiro é BIGINT em centavos. Nunca NUMERIC em reais, nunca float
-- (ADR 0001; ADR 0002, D6).

-- Up Migration

-- ---------------------------------------------------------------------------
-- wallets — saldo corrente
-- ---------------------------------------------------------------------------
-- O saldo aqui é cache derivado do ledger, mantido na MESMA transação que os
-- lançamentos. Existe para leitura barata; a verdade é wallet_entries. É por
-- isso que o teste de reconciliação (soma das entries = balance_cents) é
-- obrigatório: sem ele, uma divergência passaria despercebida.

CREATE TABLE wallets (
  id            uuid        NOT NULL,
  player_id     uuid        NOT NULL,
  kind          text        NOT NULL,
  currency      text        NOT NULL DEFAULT 'BRL',
  balance_cents bigint      NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_player_id_fkey FOREIGN KEY (player_id) REFERENCES players (id),
  CONSTRAINT wallets_player_kind_currency_key UNIQUE (player_id, kind, currency),
  CONSTRAINT wallets_kind_check     CHECK (kind IN ('CASH', 'BONUS')),
  CONSTRAINT wallets_currency_check CHECK (currency IN ('BRL')),
  -- Rede de segurança, não mecanismo primário: quem impede saldo negativo é o
  -- UPDATE atômico com a condição no WHERE. Se esta CHECK disparar, houve bug
  -- no serviço — e é melhor a transação abortar do que persistir saldo inválido.
  CONSTRAINT wallets_balance_non_negative_check CHECK (balance_cents >= 0),
  CONSTRAINT wallets_balance_range_check        CHECK (balance_cents <= 100000000000)
);

COMMENT ON TABLE  wallets IS 'Saldo corrente por jogador/tipo/moeda. Derivado de wallet_entries, mantido na mesma transação.';
COMMENT ON COLUMN wallets.balance_cents IS 'Centavos inteiros. Nunca reais, nunca float.';

CREATE TRIGGER wallets_set_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- ledger_operations — a operação lógica e a barreira de idempotência
-- ---------------------------------------------------------------------------

CREATE TABLE ledger_operations (
  id           uuid        NOT NULL,
  player_id    uuid        NOT NULL,
  source       text        NOT NULL,
  reference_id text        NOT NULL,
  reason       text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT ledger_operations_pkey PRIMARY KEY (id),
  CONSTRAINT ledger_operations_player_id_fkey FOREIGN KEY (player_id) REFERENCES players (id),

  -- IDEMPOTÊNCIA (ADR 0002, P1 / DIV-1 aprovada).
  -- A chave é (source, reference_id) e NÃO inclui reason. Duas razões para
  -- isso, ambas medidas na análise do ADR:
  --   1. `reason` diz O QUE aconteceu, não QUEM informou. Sem `source`, duas
  --      origens distintas emitindo a mesma referência colidiriam, e a segunda
  --      seria tratada como retentativa já processada — crédito engolido em
  --      silêncio, que é pior que crédito duplicado porque não aparece em
  --      reconciliação nenhuma.
  --   2. Com `reason` na chave, o mesmo evento chegando duas vezes com razões
  --      divergentes passaria duas vezes: crédito em dobro, exatamente o que a
  --      idempotência existe para impedir.
  CONSTRAINT ledger_operations_idempotency_key UNIQUE (source, reference_id),

  CONSTRAINT ledger_operations_source_check CHECK (source IN ('platform', 'vertex', 'backoffice')),
  CONSTRAINT ledger_operations_reason_check CHECK (reason IN (
    'deposit.settled', 'adjustment.credit', 'game.purchase', 'prize.credit',
    'bonus.granted', 'bonus.expired', 'bonus.converted'
  )),
  CONSTRAINT ledger_operations_reference_id_not_blank_check CHECK (btrim(reference_id) <> '')
);

COMMENT ON TABLE ledger_operations IS 'Operação financeira lógica com N pernas. Append-only. Barreira de idempotência por (source, reference_id).';
COMMENT ON CONSTRAINT ledger_operations_idempotency_key ON ledger_operations IS
  'Um evento de uma origem = exatamente uma operação financeira. ADR 0002, P1.';

-- Suporta a paginação por cursor do extrato: ordenação estável e total por
-- (created_at, id), filtrada por jogador.
CREATE INDEX ledger_operations_player_created_idx
  ON ledger_operations (player_id, created_at DESC, id DESC);

-- ---------------------------------------------------------------------------
-- wallet_entries — as pernas do lançamento
-- ---------------------------------------------------------------------------

CREATE TABLE wallet_entries (
  id                  uuid        NOT NULL,
  operation_id        uuid        NOT NULL,
  wallet_id           uuid        NOT NULL,
  -- Ordem explícita dentro da operação. created_at não basta: duas pernas da
  -- mesma operação compartilham o instante, e sem `seq` a ordem do extrato e o
  -- teste de coerência de saldo ficariam indefinidos.
  seq                 smallint    NOT NULL,
  amount_cents        bigint      NOT NULL,
  balance_after_cents bigint      NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT wallet_entries_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_entries_operation_id_fkey FOREIGN KEY (operation_id) REFERENCES ledger_operations (id),
  CONSTRAINT wallet_entries_wallet_id_fkey    FOREIGN KEY (wallet_id)    REFERENCES wallets (id),
  CONSTRAINT wallet_entries_operation_seq_key UNIQUE (operation_id, seq),

  CONSTRAINT wallet_entries_seq_positive_check   CHECK (seq >= 1),
  -- Lançamento de valor zero não representa fato financeiro nenhum.
  CONSTRAINT wallet_entries_amount_not_zero_check CHECK (amount_cents <> 0),
  CONSTRAINT wallet_entries_amount_range_check    CHECK (abs(amount_cents) <= 100000000000),
  CONSTRAINT wallet_entries_balance_after_check   CHECK (balance_after_cents >= 0 AND balance_after_cents <= 100000000000)
);

COMMENT ON TABLE  wallet_entries IS 'Append-only. Correção financeira se faz por lançamento compensatório, nunca por UPDATE ou DELETE.';
COMMENT ON COLUMN wallet_entries.amount_cents IS 'Com sinal: negativo é débito. Centavos inteiros.';
COMMENT ON COLUMN wallet_entries.balance_after_cents IS 'Saldo da carteira DEPOIS desta perna. Pertence à perna, nunca ao topo da operação (ADR 0002, D12).';

CREATE INDEX wallet_entries_operation_seq_idx ON wallet_entries (operation_id, seq);
CREATE INDEX wallet_entries_wallet_idx        ON wallet_entries (wallet_id);

-- ---------------------------------------------------------------------------
-- Append-only — camada 3 (ADR 0002, D3 e ETAPA 7)
-- ---------------------------------------------------------------------------
-- Defesa em profundidade, NÃO a garantia principal. A garantia principal é a
-- combinação de (1) a aplicação não ser dona das tabelas e (2) não receber
-- UPDATE/DELETE/TRUNCATE. O gatilho existe para dar erro legível e para cobrir
-- o caso de alguém conceder um privilégio por engano no futuro.
--
-- Usa o mesmo SQLSTATE do erro de privilégio (42501) de propósito: quem tenta
-- mutar o ledger recebe a mesma resposta, venha o bloqueio do privilégio ou do
-- gatilho. Um só caminho de erro, um só teste.

CREATE FUNCTION reject_ledger_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Tabela append-only: % em % não é permitido. Use lançamento compensatório.',
    TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

COMMENT ON FUNCTION reject_ledger_mutation() IS
  'Rejeita UPDATE/DELETE/TRUNCATE nas tabelas de ledger. Defesa em profundidade; a proteção primária é a não-propriedade + privilégios.';

CREATE TRIGGER ledger_operations_append_only
  BEFORE UPDATE OR DELETE ON ledger_operations
  FOR EACH STATEMENT EXECUTE FUNCTION reject_ledger_mutation();

CREATE TRIGGER ledger_operations_no_truncate
  BEFORE TRUNCATE ON ledger_operations
  FOR EACH STATEMENT EXECUTE FUNCTION reject_ledger_mutation();

CREATE TRIGGER wallet_entries_append_only
  BEFORE UPDATE OR DELETE ON wallet_entries
  FOR EACH STATEMENT EXECUTE FUNCTION reject_ledger_mutation();

CREATE TRIGGER wallet_entries_no_truncate
  BEFORE TRUNCATE ON wallet_entries
  FOR EACH STATEMENT EXECUTE FUNCTION reject_ledger_mutation();

-- ---------------------------------------------------------------------------
-- Propriedade e privilégios
-- ---------------------------------------------------------------------------
-- Ownership explícito: as tabelas são criadas pela conexão de migration, então
-- ALTER DEFAULT PRIVILEGES sozinho não as cobriria (ele é indexado pelo papel
-- criador). Transferir aqui é o que garante que a aplicação não seja dona.

ALTER TABLE    wallets           OWNER TO migration_role;
ALTER TABLE    ledger_operations OWNER TO migration_role;
ALTER TABLE    wallet_entries    OWNER TO migration_role;
ALTER FUNCTION reject_ledger_mutation() OWNER TO migration_role;

-- wallets: o saldo corrente É atualizável por definição — é saldo, não
-- histórico. O que é imutável são as duas tabelas abaixo.
GRANT SELECT, INSERT, UPDATE ON TABLE wallets TO app_role;

-- Ledger: SELECT e INSERT, mais nada. Sem UPDATE, sem DELETE, sem TRUNCATE.
GRANT SELECT, INSERT ON TABLE ledger_operations TO app_role;
GRANT SELECT, INSERT ON TABLE wallet_entries    TO app_role;

GRANT SELECT ON TABLE wallets, ledger_operations, wallet_entries TO readonly_role;

-- Explícito para quem for auditar depois: a ausência destes privilégios é a
-- garantia, e deixá-la escrita evita que alguém "conserte" um erro de
-- permissão concedendo o que não devia.
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE ledger_operations FROM app_role, readonly_role;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE wallet_entries    FROM app_role, readonly_role;
REVOKE DELETE, TRUNCATE          ON TABLE wallets          FROM app_role, readonly_role;

-- Down Migration

-- FORWARD-ONLY (ADR 0002, P5).
--
-- Este bloco aborta se houver qualquer dado financeiro. Em desenvolvimento,
-- com as tabelas vazias, o down funciona e permite iterar no schema. Assim que
-- existir um único lançamento, ele passa a se recusar — porque apagar histórico
-- financeiro é irreversível, e um down que "só funciona" é como se perde um
-- ledger inteiro por engano.

DO $$
DECLARE
  n_ops    bigint := 0;
  n_entries bigint := 0;
BEGIN
  IF to_regclass('public.ledger_operations') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM ledger_operations' INTO n_ops;
  END IF;
  IF to_regclass('public.wallet_entries') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM wallet_entries' INTO n_entries;
  END IF;

  IF n_ops > 0 OR n_entries > 0 THEN
    RAISE EXCEPTION
      'Rollback recusado: existem % operações e % lançamentos financeiros. O domínio financeiro é forward-only (ADR 0002, P5) — corrija por nova migration e por lançamento compensatório.',
      n_ops, n_entries
      USING ERRCODE = 'raise_exception';
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS wallet_entries_no_truncate    ON wallet_entries;
DROP TRIGGER IF EXISTS wallet_entries_append_only    ON wallet_entries;
DROP TRIGGER IF EXISTS ledger_operations_no_truncate ON ledger_operations;
DROP TRIGGER IF EXISTS ledger_operations_append_only ON ledger_operations;
DROP FUNCTION IF EXISTS reject_ledger_mutation();

DROP TABLE IF EXISTS wallet_entries;
DROP TABLE IF EXISTS ledger_operations;
DROP TABLE IF EXISTS wallets;
