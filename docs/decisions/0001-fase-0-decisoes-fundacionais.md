# ADR 0001 — Decisões fundacionais da Fase 0

- **Status:** Aprovado
- **Data da aprovação:** 2026-09-03
- **Aprovado por:** proprietário do projeto
- **Commit base da auditoria:** `0f14302`
- **Encerra:** Fase 0 — Definição arquitetural
- **Autoriza:** Fases 1, 2 e 3

Este documento é o marco formal de encerramento da Fase 0. Ele registra o que foi
decidido, o que ficou adiado e o que segue bloqueado. Alterações a estas decisões
exigem um novo ADR — não a edição deste.

---

## Contexto

A auditoria arquitetural sobre `0f14302` constatou que a plataforma era uma SPA
puramente visual: sem backend, banco, autenticação, jogador persistido, wallet,
ledger ou qualquer integração. Todo o conteúdo financeiro na interface vinha de
constantes literais em `src/data/`.

A partir daí foi produzida a especificação do backend e do contrato de integração
com o **Vertex Backoffice**, sistema administrativo independente. O princípio que
governa a separação:

> O Vertex é dono do **Payment**. A plataforma é dona do **Player**, da **Wallet**,
> do **Ledger** e do **Saldo**. Os dois se comunicam por API com contrato explícito,
> **nunca** por banco compartilhado.

---

## Decisões aprovadas

### D1 — Monorepo npm workspaces

Estrutura-alvo:

```
/
├── apps/
│   ├── web/          # a SPA atual
│   └── api/          # backend Fastify
├── packages/
│   └── contracts/    # schemas e tipos compartilhados
├── package.json
├── package-lock.json
└── README.md
```

Regras obrigatórias:

- A primeira alteração é **exclusivamente estrutural**. Nenhuma refatoração
  funcional no mesmo commit.
- Usar `git mv` sempre que aplicável.
- Validar localmente antes do merge.
- **Sequência obrigatória com a Vercel:** criar e validar a branch → configurar o
  Root Directory como `apps/web` → validar um deployment Preview → só então merge
  na `main` → confirmar o deployment de produção.
- O deploy atual não deve ser colocado em risco deliberadamente.

### D2 — Infraestrutura

| Camada   | Provedor                  |
| -------- | ------------------------- |
| Frontend | Vercel (estático)         |
| Backend  | Railway + Fastify         |
| Banco    | PostgreSQL (Railway)      |

Ambientes: `development` (local) → `staging` (Railway) → `production` (Railway).

Cada ambiente possui banco, variáveis, segredos, credenciais e chave HMAC
independentes. **Dados de produção nunca são usados em staging.**

**Portabilidade é requisito:** o código não pode depender de funcionalidade
proprietária do Railway. A aplicação deve permanecer um serviço Fastify padrão,
executável em outro provedor.

### D3 — Autenticação

**Supabase Auth exclusivamente para autenticação e identidade.**

| Supabase Auth                                          | Plataforma (Fastify)                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Login, senha, recuperação, MFA, provedores sociais      | Verificar JWT: assinatura, `iss`, `aud`, `exp`                       |
| Emissão e renovação do JWT                              | Traduzir `sub` → `players.id`; provisionar player                    |
|                                                         | Autorização, RBAC, regras financeiras, wallet, ledger, jogo          |

Regra oficial:

> **O Supabase identifica quem é o usuário. A plataforma decide o que ele pode fazer.**

Nenhuma regra financeira ou autorização de domínio é delegada ao Supabase. O domínio
financeiro permanece inteiramente fora do banco usado pelo Supabase Auth.

### D4 — BONUS (estrutura)

Quatro propriedades estruturais aprovadas:

1. BONUS é uma **carteira separada**.
2. BONUS **não pode ser sacado** diretamente.
3. BONUS vira CASH **apenas por operação explícita e auditável**.
4. BONUS pode ser removido por **operação explícita** (ex.: expiração).

A conversão BONUS → CASH é uma transferência interna atômica com **duas entradas no
ledger**. Nunca pela simples alteração de um saldo.

### D6 — Homologação

`development` local → `staging` **obrigatório antes da integração real com o Vertex**
→ `production` somente após validação completa.

Nenhuma primeira integração entre sistemas ocorre diretamente em produção. Staging
tem banco próprio, projeto de autenticação próprio, segredos próprios, chaves HMAC
próprias e **dados exclusivamente sintéticos**.

### Ajuste A — Respostas multi-wallet

A resposta do contrato usa `entries[]` desde a v1. **Não existe `balanceAfterCents`
no nível principal.** Cada lançamento carrega individualmente `entryId`,
`walletKind`, `currency`, `amountCents` e `balanceAfterCents`.

A v1 mantém uma carteira afetada por operação externa. Operações de múltiplas pernas
ficam reservadas ao que é intrinsecamente atômico — sobretudo transferências internas.

### Ajuste B — Transferências internas

Uma transferência é **uma única operação financeira** com N pernas. Invariantes
obrigatórias: soma zero, mesmo player, mesma moeda, atomicidade, saldo suficiente na
origem, direção autorizada.

Ou todas as pernas acontecem, ou nenhuma. **Nunca** duas operações independentes para
representar uma transferência.

### Ajuste C — Permissões do banco

A aplicação em execução **não é proprietária das tabelas** — no PostgreSQL o dono
ignora `REVOKE`, e sem essa separação o append-only é decorativo.

| Papel            | Responsabilidade                                          |
| ---------------- | --------------------------------------------------------- |
| `migration_role` | Migrations, DDL, propriedade das tabelas                   |
| `app_role`       | Execução: leitura, inserção, atualização só onde necessária |
| `readonly_role`  | Relatórios, reconciliação, consultas                       |

`ledger_operations` e `wallet_entries` são **append-only para a aplicação**: sem
`UPDATE`, sem `DELETE`. Correção financeira se faz por **lançamento compensatório**,
nunca alterando ou apagando histórico.

### Ajuste D — Normalização de e-mail

Normalização na escrita **+** `CHECK` no banco. O banco garante e-mail em minúsculas
e sem espaços extras; a aplicação normaliza antes de persistir. Mesma filosofia para
telefone, em formato E.164.

### Ajuste E — `walletKind` (aprovado parcialmente)

`walletKind` **não é campo livre enviado pelo cliente**. A plataforma determina a
carteira a partir de `reason`. A matriz vive em `packages/contracts`.

Matriz da v1:

| `reason`            | Carteira | Sinal   |
| ------------------- | -------- | ------- |
| `deposit.settled`   | CASH     | crédito |
| `adjustment.credit` | CASH     | crédito |

---

## Adiado

**Regras de produto do BONUS** — decidir antes da Fase 8, não bloqueiam as fases iniciais:

- BONUS pode ser usado no jogo
- ordem de consumo entre CASH e BONUS
- rollover e multiplicador
- expiração e prazo
- PROMOTIONAL como carteira própria
- PRIZE como carteira própria

---

## Não aprovado

**`adjustment.debit` fica fora da v1.** Permite retirar saldo do jogador; é a operação
de maior risco do contrato. Se vier a ser necessária, exigirá permissão RBAC
específica, justificativa obrigatória, auditoria e fluxo explícito de aprovação —
**nunca a mesma autorização usada para créditos**.

---

## Bloqueado

**D5 — Contrato com o Vertex.** Pendente de confirmação formal do proprietário do
Vertex sobre:

1. `referenceId = payment.id` imutável entre retries
2. Campos a adicionar ao `Payment`
3. `platform_player_id` capturado **na criação**, não no settle
4. `200` e `201` tratados como sucesso
5. Vertex **não** envia `walletKind`
6. Confirmação de que `amount_cents` já usa **centavos inteiros** — se usar decimal,
   a conversão é corrigida na origem antes da integração
7. Tratamento dos Payments antigos sem `platform_player_id`

**Nenhuma integração com o Vertex será implementada antes desta aprovação bilateral.**

---

## Consequências

- Fases 1, 2 e 3 podem ser executadas sem depender do Vertex nem das regras de
  produto do bônus.
- O schema financeiro nasce em `BIGINT` de centavos, com barreira de idempotência em
  `ledger_operations` e histórico append-only garantido por permissão de banco.
- A escolha do provedor de autenticação permanece reversível: o acoplamento se limita
  à coluna `players.auth_user_id`, que nunca é exposta ao Vertex.
