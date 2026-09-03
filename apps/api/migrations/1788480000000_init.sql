-- Migration inicial. Não cria nenhuma tabela de domínio.
--
-- Objetivo desta migration: validar o pipeline (conexão, tabela de controle,
-- up e down) e instalar a única peça de infraestrutura que todas as tabelas
-- futuras vão usar. Schema de players entra na Fase 2; schema financeiro na
-- Fase 3, com os papéis de banco do ADR 0001 (Ajuste C).

-- Up Migration

-- Mantém updated_at correto sem depender de a aplicação lembrar de setá-lo.
-- Um UPDATE que esquece o updated_at é invisível; este gatilho remove a
-- possibilidade de esquecer.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_updated_at() IS
  'Gatilho BEFORE UPDATE: atualiza updated_at. Usado por players, wallets e demais tabelas com auditoria temporal.';

-- Down Migration

DROP FUNCTION IF EXISTS set_updated_at();
