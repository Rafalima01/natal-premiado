import { v7 as uuidv7 } from 'uuid';

/**
 * Identificadores da plataforma.
 *
 * UUID v7 (ADR 0001, D3): ordenado por tempo, o que dá localidade de índice —
 * inserções caem no fim da árvore B-tree em vez de espalhar. Importa em
 * `wallet_entries`, que cresce sem parar.
 *
 * Gerado pela aplicação, não por DEFAULT no banco: assim o id é conhecido
 * antes do INSERT, o que facilita correlacionar log e, na Fase 5, a outbox.
 *
 * A implementação vem da biblioteca de propósito — v7 escrito à mão erra o
 * contador monotônico dentro do mesmo milissegundo e perde exatamente a
 * propriedade que motivou a escolha.
 */
export const newPlayerId = (): string => uuidv7();
