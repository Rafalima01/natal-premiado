# ADR 0002 — Domínio financeiro: wallets e ledger (Fase 3)

- **Status:** **Accepted**
- **Data do rascunho:** 2026-09-04
- **Data da aprovação:** 2026-09-09
- **Commit base da inspeção:** `4a3bd7f`
- **Estende:** [ADR 0001](0001-fase-0-decisoes-fundacionais.md) — não o substitui
- **Encerra:** nada. Define a Fase 3.
- **Depende de:** Fase 2 (identidade do jogador) — concluída

Este documento define a arquitetura do domínio financeiro. Todos os pontos em
aberto do rascunho (**P1** a **P6**) foram decididos, e três decisões novas
(**A1**, **B3**, **C**) surgiram da inspeção de ambiente. O registro está na
seção [Decisões aprovadas](#decisões-aprovadas-p1p6-a1-b3-c).

As divergências e a análise que levaram a cada decisão foram **mantidas
integralmente** — um ADR que apaga o raciocínio depois de decidir vira ata, não
registro arquitetural.

---

## Contexto

A Fase 2 entregou identidade: `players.id` (UUID v7) é hoje o identificador
estável da plataforma, provisionado de forma idempotente a partir do `sub` do
provedor de autenticação. O domínio financeiro continua inexistente.

A inspeção do repositório em `4a3bd7f` encontrou fundação instalada
antecipadamente e sem nenhum consumidor:

| Peça | Estado | Onde |
| --- | --- | --- |
| `withTransaction` | existe, **zero chamadores** | `apps/api/src/db/tx.ts` |
| `Cents`, `toCents`, `MAX_CENTS`, `formatCents` | existe, **zero consumidores** | `packages/contracts/src/money.ts` |
| BIGINT devolvido como string pelo driver | decisão consciente, comentada | `apps/api/src/db/pool.ts` |
| `Executor = Pool \| PoolClient` | já permite operar dentro de transação | `apps/api/src/modules/players/repository.ts` |
| `set_updated_at()` | gatilho compartilhado já instalado | `migrations/1788480000000_init.sql` |

Cinco comentários no código apontam a Fase 3 como o momento do schema financeiro.
Este ADR ocupa esse espaço.

---

## Escopo da Fase 3

### Dentro do escopo

- Schema financeiro: `wallets`, `ledger_operations`, `wallet_entries`
- Papéis de banco e separação de propriedade (`migration_role`, `app_role`, `readonly_role`)
- Atomicidade, concorrência e idempotência garantidas pelo banco
- Serviços **internos** de crédito e débito
- Leitura de saldo e de extrato por rota HTTP autenticada
- Provisionamento automático das wallets junto com o player

### Fora do escopo — explicitamente

- Endpoints externos de depósito
- Integração com o Vertex, webhooks, assinatura HMAC
- Ajustes administrativos
- Qualquer rota HTTP pública que movimente dinheiro
- Funcionalidades de Back Office
- Regras de produto do BONUS (rollover, wagering, expiração, prioridade de consumo)

### Consequência honesta deste escopo

Nenhum `reason` da matriz tem, hoje, uma origem aprovada e implementável dentro da
Fase 3 (ver **D9**). Os serviços de escrita existirão, serão corretos e serão
verificados — **mas seu único consumidor durante a Fase 3 será a suíte de testes.**

Isso não é um defeito do plano: é o que significa construir fundação antes da
porta. Registrar isso evita a expectativa equivocada de que a Fase 3 entrega um
fluxo de dinheiro funcionando ponta a ponta. Ela entrega a capacidade de fazê-lo
com segurança na fase seguinte.

---

## Decisões

### D1 — A Fase 3 não abre porta externa para movimentação

As únicas rotas HTTP da fase são de leitura:

```
GET /v1/me/wallets
GET /v1/me/ledger
```

Ambas autenticadas pelo `requireAuth` existente e escopadas ao jogador do token.
Crédito e débito existem como serviços do domínio, chamáveis apenas de dentro do
processo. Não há rota, não há webhook, não há fila.

**Motivo:** o contrato de integração com o Vertex (ADR 0001, D5) está bloqueado
aguardando o proprietário do Vertex. Construir a porta antes do contrato significa
construí-la duas vezes — ou pior, mantê-la aberta com um contrato provisório.

### D2 — Histórico de migrations: `pgmigrations` é a fonte da verdade

**Diagnóstico verificado no binário instalado** (`node-pg-migrate@7.9.1`):

| Fato | Evidência |
| --- | --- |
| Config só é lida via `--config-file` explícito | `bin/node-pg-migrate.js:403-406` |
| Não há descoberta automática de `.node-pg-migraterc` | ausente em `bin/` e `dist/`; deps são só `glob` e `yargs` |
| `migrations-table` já tem `pgmigrations` como padrão | `bin/node-pg-migrate.js:420` |
| `check-order` já tem `true` como padrão | `bin/node-pg-migrate.js:125` |
| `migrations-dir` já tem `migrations` como padrão | idem |

O arquivo `apps/api/.node-pg-migraterc` **nunca foi lido e nunca será** pela versão
instalada. O suporte a arquivos `rc` foi removido na v7. Das três chaves que ele
declara, duas já coincidem com o padrão efetivo e a terceira (`schema_migrations`)
simplesmente nunca teve efeito.

Estado real do banco, confirmado por consulta:

```
tabela: pgmigrations (id, name, run_on)
  1  1788480000000_init
  2  1788566400000_players
```

**Decisão:** `pgmigrations` permanece a única tabela de histórico. Nenhum segundo
histórico será criado.

**Plano recomendado — remover o arquivo inerte:**

1. Excluir `apps/api/.node-pg-migraterc`.
2. Não passar `--migrations-table` em nenhum script.
3. Confirmar com `npm run migrate:up` que a saída indica "No migrations to run".

Como todas as chaves do arquivo já são o padrão efetivo, **a exclusão é uma
mudança de comportamento nula**. É remoção de documentação enganosa, não
reconciliação.

**O que NÃO fazer, e por quê:**

| Ação | Consequência |
| --- | --- |
| Passar `--migrations-table schema_migrations` | Cria tabela vazia; o runner conclui que nada rodou e tenta reexecutar `init` e `players`; `CREATE TABLE players` falha e o estado fica ambíguo |
| Renomear `pgmigrations` para casar com o arquivo | Mesmo efeito prático, com o agravante de mexer em histórico aplicado sem necessidade |

**Válvula de escape documentada, não planejada:** se algum dia a tabela precisar
mudar de nome, o caminho seguro é `ALTER TABLE pgmigrations RENAME TO <novo>`
seguido de verificação, ou `node-pg-migrate up --fake` para remarcar migrations já
aplicadas sem executá-las (`bin/node-pg-migrate.js:194`). Nenhum dos dois é
necessário agora.

**Prazo:** resolver **antes** da primeira migration financeira. Não porque quebre
algo hoje, mas porque um arquivo de configuração que mente é exatamente o tipo de
coisa que alguém "conserta" no pior momento possível.

### D3 — Papéis, propriedade e append-only

#### O problema, medido

```
current_user ........................ natal   (não é superusuário)
dono das tabelas players, pgmigrations  natal
dono do schema public ............... natal
dono do banco natal_dev ............. natal
papéis existentes ................... natal, postgres, helijump
```

O Ajuste C do ADR 0001 identificou que o dono da tabela ignora `REVOKE`. **A
inspeção mostra que o problema é maior do que o Ajuste C descreve:** o papel da
aplicação também é dono do schema e do banco.

Um dono de schema pode executar `DROP SCHEMA public CASCADE`, apagando o ledger
inteiro sem jamais esbarrar em uma permissão de tabela. Proteger tabelas e deixar
o schema exposto é trancar a gaveta e deixar a porta aberta.

#### Modelo aprovado

| Papel | Tipo | Responsabilidade |
| --- | --- | --- |
| `migration_role` | `NOLOGIN`, papel de grupo | **Dono** do schema e de todas as tabelas. Executa DDL e migrations. |
| `app_role` | `NOLOGIN`, papel de grupo | Papel de execução da aplicação. Não é dono de nada. |
| `readonly_role` | `NOLOGIN`, papel de grupo | `SELECT` para relatório e reconciliação. |

Papéis de login concretos são membros desses grupos. A aplicação conecta com um
login que é membro de `app_role` **e de mais nada**.

#### Matriz de privilégios

| Objeto | `app_role` | `readonly_role` | `migration_role` |
| --- | --- | --- | --- |
| `players` | SELECT, INSERT, UPDATE | SELECT | dono |
| `wallets` | SELECT, INSERT, UPDATE | SELECT | dono |
| `ledger_operations` | SELECT, **INSERT** | SELECT | dono |
| `wallet_entries` | SELECT, **INSERT** | SELECT | dono |
| schema `public` | USAGE | USAGE | dono |

**Proibido a `app_role`, sem exceção:** `UPDATE` e `DELETE` em `ledger_operations`
e `wallet_entries`; `TRUNCATE` em qualquer tabela financeira; qualquer DDL.

`wallets.balance_cents` é atualizável **por definição** — é saldo corrente, não
histórico. O histórico imutável são as duas outras tabelas. Correção financeira se
faz por lançamento compensatório, nunca por edição (ADR 0001, Ajuste C).

#### Como o append-only é garantido de fato

Três camadas, em ordem de força:

1. **Não-propriedade** — `app_role` não é dono das tabelas nem do schema. É esta
   camada que faz o `REVOKE` valer alguma coisa. Sem ela, as outras duas são
   teatro.
2. **Privilégio** — `GRANT SELECT, INSERT` explícito; nenhum `UPDATE`/`DELETE`
   concedido. Inclui `ALTER DEFAULT PRIVILEGES` para que tabelas futuras nasçam
   com o mesmo regime, em vez de depender de alguém lembrar.
3. **Gatilho** — `BEFORE UPDATE OR DELETE` que levanta exceção. Defesa em
   profundidade e mensagem de erro legível; **não** é a proteção principal, já que
   o dono pode desativá-lo.

**Requisito explícito:** uma proteção baseada apenas em `REVOKE UPDATE` com o mesmo
papel continuando proprietário é rejeitada por este ADR.

#### Ordem obrigatória de implementação

```
1. criar migration_role, app_role, readonly_role
2. transferir propriedade do schema public → migration_role
3. transferir propriedade de players e pgmigrations → migration_role
4. conceder privilégios conforme a matriz; ALTER DEFAULT PRIVILEGES
5. mover o login da aplicação para app_role e validar que ele perdeu a propriedade
6. SÓ ENTÃO criar wallets, ledger_operations, wallet_entries
7. aplicar gatilho de append-only
```

Inverter os passos 5 e 6 produz tabelas financeiras nascidas com o dono errado — e
consertar propriedade depois de haver dado dentro é mais arriscado do que fazer na
ordem.

#### Propriedade do banco

Transferir a propriedade do **banco** exige superusuário. Localmente existe
`postgres` e isso é viável. Em provedor gerenciado, o usuário fornecido
frequentemente é o dono do banco e não há superusuário disponível.

**Invariante mínima, portável:** o papel com que a aplicação conecta não é
superusuário, não é dono de tabela e não é dono do schema. A propriedade do banco
é desejável mas fica registrada como **ponto em aberto P3**, dependente do que o
provedor permitir. O desenho não pode depender de algo que o Railway talvez não
ofereça (ADR 0001, D2 — portabilidade é requisito).

### D4 — Wallets nascem com o player

O estado `player existe / wallet não existe` fica proibido. O fluxo passa a ser:

```
autentica → JWT validado → player resolvido → wallets garantidas
```

#### Como implementar depois, com correção

Hoje `resolvePlayer(getPool(), claims)` recebe um `Executor` — que já é
`Pool | PoolClient`. Isso significa que a mudança **não exige refatorar
assinaturas**: basta a rota passar a chamar dentro de `withTransaction`, e o
mesmo `client` atravessar player e wallets.

**Idempotência:** mesmo padrão já provado na Fase 2 —
`INSERT ... ON CONFLICT (player_id, kind, currency) DO UPDATE SET updated_at = now() RETURNING`.
`DO UPDATE` em vez de `DO NOTHING` porque `DO NOTHING` não devolve linha em
conflito, obrigando a um `SELECT` extra e reabrindo exatamente a janela de corrida
que o upsert fecha.

**Concorrência:** duas requisições simultâneas do mesmo jogador disputam a mesma
linha; o índice único serializa e ambas terminam com o mesmo conjunto de wallets.

**Atomicidade:** player e wallets na mesma transação. Ou os dois existem, ou
nenhum. Um `COMMIT` do player seguido de falha nas wallets recria o estado
inconsistente que esta decisão elimina.

**Risco não óbvio — deadlock:** inserir várias wallets em ordens diferentes em
transações concorrentes pode travar em deadlock. Mitigação obrigatória: **inserir
as wallets sempre em ordem determinística** (um único `INSERT` multi-linha com
ordem fixa por `kind`), nunca em laço com ordem variável.

**Custo:** `/v1/me` passa a abrir transação. Como o caso comum é "já provisionado",
recomenda-se o caminho rápido: `SELECT` do player e das wallets fora de transação;
só quando faltar algo é que se abre a transação e roda o upsert. A correção não
depende disso — o upsert é idempotente de qualquer forma —, mas evita transação em
toda requisição autenticada.

### D5 — Tipos de wallet: CASH e BONUS desde a Fase 3

`wallets.kind ∈ { 'CASH', 'BONUS' }`, com `CHECK` no banco.

`CASH` é o saldo monetário principal. `BONUS` é saldo promocional em carteira
separada (ADR 0001, D4).

**Criar a estrutura não é criar as regras.** Continuam fora da Fase 3 e pertencem à
Fase 8: rollover, wagering, expiração, regras de saque, prioridade de consumo entre
CASH e BONUS, e qualquer regra promocional.

Na Fase 3 a carteira BONUS existe, aceita lançamento pelos serviços internos, e é
exibida na leitura de saldo. Nada mais.

### D6 — Dinheiro em centavos inteiros, ponta a ponta

```
BANCO      BIGINT em centavos
   ↓
API        centavos inteiros
   ↓
CONTRACTS  Cents (branded)
   ↓
FRONTEND   centavos inteiros
   ↓
UI         formatCents()
```

`13750` representa `R$ 137,50`. Ponto flutuante não entra em nenhuma camada do
domínio. A arquitetura rejeitada explicitamente é
`banco em centavos → API em reais → frontend em float`.

#### O risco do fator 100 e como ele é barrado

Hoje convivem dois formatadores incompatíveis:

| Função | Onde | Entrada esperada |
| --- | --- | --- |
| `money(value)` | `apps/web/src/lib/format.ts:14` | reais, ponto flutuante |
| `formatCents(value)` | `packages/contracts/src/money.ts` | `Cents` |

O mock `player.balance = 137.5` alimenta `money()`. Se um valor em centavos chegar
a `money()`, a tela mostra **R$ 13.750,00** — cem vezes o valor real, sem erro,
sem aviso, com aparência plausível.

Barreiras, da mais forte para a mais fraca:

1. **Tipagem que já existe.** `Cents` é branded: `formatCents(137.5)` **não
   compila**. A direção perigosa é a inversa — `money(13750)` compila.
2. **Proibição de importação cruzada.** A tela de carteira, ao passar a consumir
   saldo real, importa **apenas** `formatCents`. `money` não pode aparecer no mesmo
   arquivo.
3. **Conversão validada na borda do driver.** O `pg` devolve BIGINT como string
   (decisão registrada em `pool.ts`). A conversão para `number` acontece uma única
   vez, no repositório do módulo wallet, passando por `toCents` — que rejeita
   não-inteiro e valor acima de `MAX_CENTS`.
4. **`CHECK` no banco** limitando `amount_cents` e `balance_cents` à faixa de
   `MAX_CENTS`.
5. **Eliminação do legado.** O mock financeiro do frontend é dívida a remover, não
   a manter em paralelo. Enquanto os dois coexistirem, o risco existe.

**Ordem recomendada:** trocar a origem dos dados **e** o formatador no mesmo passo,
por tela. Uma tela meio migrada — dados novos, formatador velho — é precisamente o
estado que produz o erro de fator 100.

### D7 — Modelo de dados

Três tabelas, com papéis distintos e não sobrepostos.

#### `wallets` — saldo corrente

Uma linha por `(player_id, kind, currency)`. `balance_cents BIGINT NOT NULL`.
Índice único em `(player_id, kind, currency)`. `CHECK` de `kind` e de faixa de
valor. Gatilho `set_updated_at` já existente.

Saldo corrente é **cache derivado do ledger**, mantido na mesma transação que os
lançamentos. Ele existe para leitura barata; a verdade é o ledger. Isso torna
possível — e obrigatório — um teste de reconciliação: soma dos `wallet_entries` de
uma carteira é igual ao `balance_cents` dela.

#### `ledger_operations` — a operação lógica

Representa **um fato financeiro**, com N pernas. É a barreira de idempotência.
Carrega o `reason`, a referência de origem, o `player_id` e o instante.

#### `wallet_entries` — as pernas

Cada linha é um lançamento em uma carteira: `amount_cents BIGINT` com sinal,
`balance_after_cents BIGINT`, FK para a operação e para a carteira.

**Ordenação:** `created_at` não basta — duas pernas da mesma operação podem
compartilhar o instante. Cada entrada carrega um `seq` explícito, único dentro da
operação (`UNIQUE (operation_id, seq)`). Sem isso, "a ordem dos lançamentos" fica
indefinida no extrato e no teste de coerência de saldo.

#### Invariantes do modelo

- Toda `wallet_entry` pertence a exatamente uma `ledger_operation`
- Operação de transferência interna: **soma das pernas igual a zero**, mesmo
  player, mesma moeda, atomicidade total (ADR 0001, Ajuste B)
- `balance_after_cents` de uma perna é o saldo da carteira **após aquela perna**
- Nenhum sistema externo informa saldo. Externos informam **operações**; a
  plataforma calcula o saldo

### D8 — Chave de idempotência: divergência registrada

A proposta recebida foi `UNIQUE (reason, reference_id)`. **A avaliação crítica
encontrou dois modos de falha, e o primeiro é silencioso.**

#### Falha 1 — colisão entre origens (silenciosa, e a mais grave)

`reason` descreve *o que aconteceu*, não *quem informou*. Nada impede que duas
origens diferentes produzam o mesmo `reference_id` para o mesmo `reason`.

Cenário concreto: `bonus.granted` com `reference_id = "campanha-natal-2026"`
emitido por um motor de campanha, e o mesmo par emitido depois por uma ferramenta
administrativa. A constraint trata o segundo como retentativa já processada.

O jogador **não recebe** o crédito. Nenhum erro é levantado — a operação parece
bem-sucedida, porque "já existe". Um crédito duplicado é detectável na
reconciliação; um crédito silenciosamente engolido não é.

#### Falha 2 — mesma referência com reason diferente

Se o mesmo evento externo chegar duas vezes com `reason` divergente — bug do
emissor, mudança de contrato, retentativa após deploy — a chave composta considera
os dois **distintos** e ambos passam. Resultado: **crédito em dobro**.

Este é o caso que a idempotência existia para impedir.

#### Alternativa recomendada

```
source          text NOT NULL   -- origem controlada: 'platform', 'vertex', ...
reference_id    text NOT NULL   -- id do evento, opaco, imutável entre retries
reason          text NOT NULL   -- descritivo, NÃO faz parte da chave

CONSTRAINT ledger_operations_idempotency_key UNIQUE (source, reference_id)
CONSTRAINT ledger_operations_source_check    CHECK (source IN (...))
```

Garantia obtida: **um evento de uma origem = exatamente uma operação financeira**,
independentemente do `reason` com que chegue.

**Objeção previsível:** e se uma origem legitimamente precisar de duas operações
com a mesma referência — por exemplo, um pagamento que gera crédito e taxa?

**Resposta:** pelo Ajuste A do ADR 0001, isso é **uma operação com duas pernas**,
não duas operações. O modelo já cobre o caso, e cobre melhor: as duas pernas ficam
atômicas entre si. Se surgir um caso real que não caiba nesse formato, ele merece
um ADR próprio, não um afrouxamento da chave de idempotência.

**Por que `player_id` não entra na chave:** incluí-lo permitiria que a mesma
referência externa fosse aplicada a jogadores diferentes, cada uma passando pela
barreira. A validação de que o `player_id` informado bate com o da operação
original é responsabilidade da camada de serviço, com erro explícito em caso de
divergência — não da chave.

**Status:** ✅ **APROVADA em 2026-09-09 (P1).** A alternativa recomendada é a
decisão vigente: `UNIQUE (source, reference_id)`, com `reason` fora da chave.
A análise acima permanece registrada como a justificativa da mudança.

#### Uso correto da constraint

A idempotência precisa **retornar a operação existente**, não estourar erro. O
caminho é o mesmo padrão já provado em `players`: `ON CONFLICT ON CONSTRAINT ...
DO UPDATE` com `RETURNING`, distinguindo inserção de conflito. A retentativa
devolve a operação original e o chamador recebe sucesso, não `409`.

### D9 — Matriz de reasons

A matriz é dado estruturado em `packages/contracts` (ADR 0001, Ajuste E), nunca
campo livre vindo do cliente. A plataforma deriva a carteira e a direção a partir
do `reason`.

| `reason` | Carteira | Direção | Origem | Situação |
| --- | --- | --- | --- | --- |
| `deposit.settled` | CASH | crédito | externa (Vertex) | Aprovado no ADR 0001. **Depende do D5, bloqueado.** Chega na Fase 4 |
| `adjustment.credit` | CASH | crédito | Back Office | Aprovado no ADR 0001. Depende de autenticação administrativa — fase futura |
| `adjustment.debit` | — | — | — | **NÃO APROVADO** (ADR 0001). Fora da v1 |
| `game.purchase` | CASH | débito | plataforma | Semântica depende da fase do jogo, **que não tem número atribuído** |
| `prize.credit` | CASH | crédito | plataforma | idem |
| `bonus.granted` | BONUS | crédito | plataforma / campanha | Estrutura aprovada (D4); **regras na Fase 8** |
| `bonus.expired` | BONUS | débito | plataforma | idem |
| `bonus.converted` | BONUS → CASH | transferência, 2 pernas | plataforma | Estrutura aprovada (D4, Ajuste B); regras na Fase 8 |

**Observação que não deve ser suavizada:** nenhum `reason` desta tabela tem, ao
mesmo tempo, semântica aprovada **e** origem implementável dentro da Fase 3. Os
dois aprovados no ADR 0001 dependem de integração externa, que a **D1** exclui. Os
demais dependem de fases que ainda não existem ou não foram numeradas.

Portanto: a Fase 3 implementa **o mecanismo da matriz** e os serviços genéricos que
a consomem. Quais entradas concretas nascem habilitadas é **ponto em aberto P2**.

### D10 — Concorrência, transações e ordem

#### Regra geral

Toda operação financeira roda dentro de `withTransaction`. Não existe escrita
financeira fora de transação. O helper já garante `COMMIT`/`ROLLBACK` e liberação
do cliente no `finally` — inclusive quando o callback lança.

#### Isolamento

`READ COMMITTED`, o padrão do PostgreSQL. A serialização vem do **lock de linha do
`UPDATE ... RETURNING`**, não do nível de isolamento — como já documentado em
`tx.ts`. Elevar para `SERIALIZABLE` traria erros de serialização e necessidade de
retry sem ganho para este desenho.

#### Atualização de saldo

```sql
UPDATE wallets
   SET balance_cents = balance_cents + $1
 WHERE id = $2
RETURNING balance_cents
```

O `UPDATE` lê e escreve sob o lock da linha. Créditos simultâneos serializam e o
saldo final é exato. **Nunca** `SELECT` seguido de `UPDATE` com o valor lido — é aí
que a atualização perdida acontece.

#### Débito com saldo insuficiente

```sql
UPDATE wallets
   SET balance_cents = balance_cents + $1     -- $1 negativo
 WHERE id = $2
   AND balance_cents + $1 >= 0
RETURNING balance_cents
```

Nenhuma linha retornada significa saldo insuficiente — a checagem e a escrita são o
mesmo comando, sem janela entre verificar e debitar. Um `CHECK (balance_cents >= 0)`
em `wallets` para CASH atua como rede de segurança, não como mecanismo primário.

#### Ordem de bloqueio em operações multi-perna

Transferências internas tocam duas carteiras. Duas transferências concorrentes em
sentidos opostos podem travar em deadlock. Mitigação obrigatória: **bloquear as
carteiras sempre em ordem determinística** (por `wallet_id` crescente), qualquer
que seja a direção lógica da operação.

#### Sequência dentro da transação

```
1. resolver/validar o player e as carteiras envolvidas
2. INSERT em ledger_operations com ON CONFLICT — a barreira de idempotência primeiro
   ├─ conflito  → devolve a operação existente e ENCERRA (retentativa)
   └─ inserido  → segue
3. para cada perna, em ordem determinística:
     UPDATE wallets ... RETURNING balance_cents
     INSERT em wallet_entries com seq e balance_after_cents
4. validar invariantes (soma zero quando aplicável)
5. COMMIT
```

A barreira vem **antes** de qualquer movimento de saldo. Invertido, uma retentativa
moveria saldo antes de descobrir que era duplicata.

#### Rollback

Qualquer falha aborta a transação inteira. Não existe operação parcial: uma
operação com duas pernas nunca deixa uma gravada. Consistência entre saldo e ledger
é consequência de estarem na mesma transação — não de rotina de correção posterior.

### D11 — Regras estruturais de CASH e BONUS

**CASH**

- Saldo principal
- Não pode ficar negativo em operação normal de consumo
- Origem de saque no futuro

**BONUS**

- Carteira separada, nunca somada a CASH em um "saldo total" persistido
- **Não é sacável.** A Fase 3 não inventa regra de saque; apenas se recusa a tratar
  BONUS como sacável por omissão
- Vira CASH somente por operação explícita e auditável, como transferência interna
  de duas pernas (ADR 0001, D4) — mecanismo estrutural, com as regras de quando na
  Fase 8
- Pode ser removido por operação explícita (ex.: expiração), nunca por alteração
  direta de saldo

Se a interface precisar exibir um total, ele é **calculado na apresentação**, com
os componentes visíveis. Persistir um "saldo total" recriaria em uma coluna a
mistura que a separação de carteiras existe para evitar.

### D12 — Contrato das rotas de leitura

#### `GET /v1/me/wallets`

Saldos do jogador do token. Uma entrada por carteira, cada uma com `kind`,
`currency` e `balanceCents`. Sem campo de total.

#### `GET /v1/me/ledger`

Extrato paginado. **Formato `entries[]`, conforme o Ajuste A do ADR 0001.**

Cada entrada carrega individualmente: `entryId`, `walletKind`, `currency`,
`amountCents` e `balanceAfterCents`, além do `reason` e do instante da operação.

**Proibido:** `balanceAfterCents` no nível principal da resposta. Saldo após o
lançamento é propriedade **de cada perna** — em uma operação de duas pernas, um
valor único no topo seria ambíguo ou simplesmente errado.

**Paginação:** por cursor, não por `offset`. O ledger é append-only e cresce sem
parar; `offset` degrada e produz resultado instável quando há inserção durante a
navegação. O cursor deriva da ordenação estável `(created_at, operation_id, seq)`.

Todos os valores monetários trafegam como **inteiros em centavos**. Formatação é
responsabilidade exclusiva da interface.

### D13 — Fronteira com o Back Office

```
player JWT  ≠  operador administrativo
```

A plataforma Natal Premiado é o app do jogador. O Back Office é outro projeto.

**Não será criado agora:** painel administrativo, login de operador, RBAC
administrativo, "modo admin", ajustes administrativos, relatórios administrativos,
KYC, gestão de campanhas.

**Regra que não pode ser relaxada por conveniência:** autenticação administrativa
será um mecanismo separado. Reaproveitar o JWT do jogador com uma claim de papel
transformaria o comprometimento de uma conta de jogador em comprometimento
administrativo. Um "só um endpoint admin protegido por uma flag" é exatamente como
essa fronteira costuma cair.

**Identificador de integração:** `players.id`. Nunca `auth_user_id` — ele é
referência ao provedor de autenticação, não sai da plataforma (ADR 0001, D3), e
hoje o código já respeita isso: `toIdentity()` o remove antes de qualquer
serialização.

**Nunca banco compartilhado.** Sistemas externos informam **operações**; a
plataforma valida, localiza o jogador, verifica idempotência, registra a operação,
registra os lançamentos e calcula o saldo. Nenhum sistema externo escreve saldo.

---

## Divergências registradas

Conforme a instrução de não alterar decisões silenciosamente:

| # | Proposta recebida | Achado | Recomendação | Status |
| --- | --- | --- | --- | --- |
| **DIV-1** | `UNIQUE (reason, reference_id)` | Dois modos de falha, um silencioso (**D8**) | `UNIQUE (source, reference_id)` com `reason` fora da chave | ✅ **Aprovada (P1)** |
| **DIV-2** | Reconciliar o histórico de migrations | Não há o que reconciliar: o arquivo nunca foi lido; nenhum histórico paralelo existe | Excluir o arquivo inerte (**D2**) | ✅ **Aprovada.** Arquivo removido |
| **DIV-3** | Ajuste C trata da propriedade das tabelas | Propriedade do **schema** e do **banco** também estão no papel da aplicação | Cobrir os três níveis (**D3**) | ✅ **Aprovada (P3)** |
| **DIV-4** | Cinco `reasons` de exemplo | Nenhum tem semântica aprovada **e** origem implementável na Fase 3 (**D9**) | Definir explicitamente o conjunto inicial | ✅ **Resolvida (P2)**: matriz estrutural sem porta pública |
| **DIV-5** | Modelo de papéis sem credencial de instalação | `natal` não tem `CREATEROLE`; a aplicação não consegue instalar o próprio modelo de segurança | `MIGRATION_DATABASE_URL` separada | ✅ **Aprovada (A1)** |
| **DIV-6** | Migration assumia que ser membro do papel bastava para transferir propriedade | No PostgreSQL 16+, um `CREATEROLE` não-superusuário que cria um papel recebe ADMIN **sem `SET`**. `pg_has_role(...,'MEMBER')` já responde `true`, o guard pulava o `GRANT`, e o `ALTER … OWNER TO` seguinte falhava com `42501 must be able to SET ROLE`. Invisível para superusuário — some no container local e aparece em **todo provedor gerenciado**, que é o alvo de produção | `GRANT … WITH INHERIT TRUE, SET TRUE` incondicional | ✅ **Corrigida.** Medida e validada em PostgreSQL 17.6 gerenciado |

---

## Riscos — classificação

### Bloqueadores da Fase 3

| # | Risco | Tratamento |
| --- | --- | --- |
| **R1** | Propriedade incorreta: aplicação é dona de tabelas, schema e banco | **D3.** Passos 1–5 antes de qualquer tabela financeira |

### A resolver antes da primeira migration financeira

| # | Risco | Tratamento |
| --- | --- | --- |
| **R2** | `.node-pg-migraterc` não corresponde à tabela real | ✅ **Resolvido.** Arquivo removido (**D2**); `pgmigrations` confirmada como fonte única |
| **R5** | `TEST_DATABASE_URL` aponta para PostgreSQL hospedado remoto e a suíte executa `TRUNCATE` | ✅ **Resolvido por B3/P4.** Testes financeiros migram para PostgreSQL efêmero controlado. Verificação adicional da inspeção: o projeto remoto tem `auth.users` vazio, ou seja, não guarda identidades reais |
| **R10** | `down` destrutivo | ✅ **Resolvido por P5.** Financeiro é forward-only a partir da entrada de dados reais |

### Dívida técnica não bloqueante

| # | Risco | Observação |
| --- | --- | --- |
| **R3** | Porta 5432 no compose versionado × 5433 no `.env` real | Ambiente não reproduzível a partir da documentação. Barato de corrigir; agrava-se ao introduzir CI |
| **R4** | Mocks em reais × domínio em centavos | Vira bloqueador no momento em que a tela de carteira consumir saldo real (**D6**) |
| **R6** | Ausência de CI | Sobe de prioridade com invariantes financeiras: os testes de append-only e concorrência só protegem se rodarem sempre |
| **R7** | README descreve estado anterior à Fase 2 | Correção documental |
| **R8** | Identidade duplicada no frontend (Header real, Perfil/Carteira mockados) | Naturalmente resolvido no passo de frontend da Fase 3 |

### Fase futura

| # | Risco | Observação |
| --- | --- | --- |
| **R9** | Ausência de auditoria de autoria | Só passa a importar quando existir ação administrativa. Pertence à fase do Back Office, junto com **D13** |

---

## Testes obrigatórios

Nenhum destes é opcional. A Fase 3 não se considera concluída sem todos
executados contra um PostgreSQL real, com os papéis de **D3** aplicados.

| # | Cenário | Critério |
| --- | --- | --- |
| 1 | **Idempotência** — mesma chave aplicada N vezes | Exatamente uma `ledger_operation`; saldo movido uma vez; chamadas seguintes devolvem a operação original **sem erro** |
| 2 | **Concorrência em crédito** — N créditos simultâneos | Saldo final exatamente igual à soma; N entradas no ledger |
| 3 | **Concorrência em débito** — N débitos simultâneos com saldo para poucos | CASH nunca negativo; débitos aceitos e recusados somam N; saldo consistente |
| 4 | **Atomicidade** — falha no meio de uma operação multi-perna | Rollback completo: nem operação, nem pernas, nem alteração de saldo |
| 5 | **Append-only** — `app_role` tentando `UPDATE` e `DELETE` | Erro de privilégio insuficiente (`42501`) em `wallet_entries` **e** em `ledger_operations` |
| 6 | **Coerência** — sequência de lançamentos | Cada `balance_after_cents` bate com o acumulado por `seq`; soma das entradas igual ao `balance_cents` da carteira |
| 7 | **BONUS** | Não é tratado como sacável por omissão; não é somado a CASH em campo persistido |
| 8 | **Ownership** | O papel da aplicação não é dono de nenhuma tabela financeira nem do schema; verificação via `pg_tables` e `pg_namespace`, não por inspeção manual |
| 9 | **Soma zero** — transferência interna | Pernas somam zero; mesmo player; mesma moeda |
| 10 | **Provisionamento** — acessos simultâneos de jogador novo | Um player, um conjunto de wallets, sem duplicata e sem deadlock |

O teste 8 merece destaque: sem ele, os testes 5 podem passar por acidente em um
ambiente onde o papel de teste não é o mesmo da aplicação. Verificar a propriedade
é o que garante que o teste de append-only está medindo o que promete.

---

## Sequência de implementação futura

Nenhum passo começa antes da aprovação deste ADR e das decisões em aberto.

```
 1. Resolver R2 — remover .node-pg-migraterc, confirmar "no migrations to run"
 2. Migration de papéis: criar roles, transferir schema e tabelas, privilégios
 3. Validar: aplicação conecta por app_role e não é dona de nada
 4. Contratos: WalletKind, LedgerReason, matriz, tipos de resposta, tudo em Cents
 5. Migration financeira: wallets, ledger_operations, wallet_entries + append-only
 6. Repositórios e serviços internos de crédito, débito e transferência
 7. Wallets no provisionamento do player, dentro de withTransaction
 8. Rotas de leitura GET /v1/me/wallets e GET /v1/me/ledger
 9. Testes 1–10
10. Frontend: carteira consumindo saldo real, formatCents, remoção do mock (R4/R8)
```

Os passos 1–3 são pré-requisito estrutural: executá-los depois do passo 5 significa
tabelas financeiras nascidas com dono errado.

---

## Decisões aprovadas (P1–P6, A1, B3, C)

Aprovadas em 2026-09-09. Esta seção é normativa: onde ela e o corpo do ADR
divergirem, ela prevalece.

### P1 — Chave de idempotência: `UNIQUE (source, reference_id)` ✅

A divergência **DIV-1** foi **aprovada**. `ledger_operations` carrega `source`,
`reference_id` e `reason`; a chave de idempotência é `(source, reference_id)`, e
`reason` **não faz parte dela**.

Semântica normativa: *um evento de uma origem corresponde a exatamente uma
operação financeira.* Uma repetição devolve a operação existente, sem duplicar
saldo nem lançamento. `UNIQUE (reason, reference_id)` fica proibido.

### P2 — Reasons: infraestrutura sim, porta pública não ✅

A Fase 3 entrega a **matriz estruturada**, a validação de `reason` e os serviços
internos de crédito, débito e transferência. Não cria fluxo financeiro público
para "usar" o ledger.

A matriz é centralizada em `packages/contracts` e separa quatro eixos:
`reason`, `source`, `walletKind` e direção. **O cliente nunca informa carteira
nem direção** — a plataforma as deriva da matriz. Uma requisição do tipo
`{ "wallet": "CASH", "amount": 100000 }` não é confiável e não existe rota que a
aceite.

Rotas HTTP permitidas: `GET /v1/me/wallets` e `GET /v1/me/ledger`, ambas
autenticadas e escopadas ao jogador do token.

### P3 — Ownership: mínimo obrigatório ✅

`app_login` **nunca** pode ser: superusuário; dono do schema `public`; dono de
qualquer tabela financeira ou de ledger; portador de privilégio de DDL.

A propriedade do **banco** depende do ambiente e **não bloqueia** a
implementação quando o provedor gerenciado não a permitir. O modelo
`migration_role` / `app_role` / `readonly_role` permanece obrigatório.

### P4 — Testes financeiros em PostgreSQL controlado ✅

Ownership, papéis e append-only **não** são validados contra Supabase
gerenciado. O ambiente de referência é o PostgreSQL efêmero da decisão **B3**.

### P5 — Financeiro é forward-only ✅

A partir da existência de dados financeiros reais, migrations financeiras são
**forward-only**:

- nenhum `down` destrutivo capaz de apagar ledger histórico
- nenhuma remoção automática de tabela financeira
- correções por **novas migrations**, nunca por reversão

A migration inicial, aplicada em ambiente sem dados, pode ter `down` para
desenvolvimento — mas o ledger deixa de ser schema descartável no instante em que
recebe dado real. O `down` das migrations financeiras carrega essa política
escrita no próprio arquivo.

### P6 — Identidade de aplicação separada da de migration ✅

`natal` **não** é reaproveitado como login operacional final. A arquitetura
separa:

```
migration identity          application identity
  MIGRATION_DATABASE_URL      DATABASE_URL
  membro de migration_role    app_login, membro de app_role
  dono dos objetos, faz DDL   sem ownership, sem DDL
```

`app_login` tem `LOGIN`, é membro de `app_role`, e não tem `CREATEROLE`,
`CREATEDB` nem superusuário. O nome é parametrizável por ambiente. **A senha
nunca aparece em código, migration, git, log ou documentação versionada.**

### A1 — `MIGRATION_DATABASE_URL` separada ✅

**A lacuna que motivou esta decisão:** a inspeção de 2026-09-09 mediu que o papel
`natal` — o único alcançado por `DATABASE_URL`, e o que o `node-pg-migrate`
usava — tem apenas `LOGIN`. **Não tem `CREATEROLE` nem `CREATEDB`.**

Consequência: a credencial da aplicação **não consegue instalar o modelo de
papéis** descrito em **D3**. `CREATE ROLE` exige `CREATEROLE`; `ALTER … OWNER TO`
exige ser membro do papel de destino. Sem uma credencial privilegiada, não há
não-propriedade; sem não-propriedade, o append-only é decorativo — e o próprio
ADR rejeita `REVOKE` isolado como proteção.

O ADR original descrevia o modelo de papéis sem dizer **com qual credencial ele é
instalado**. Esta decisão fecha a lacuna.

`MIGRATION_DATABASE_URL` passa a existir e é usada **exclusivamente** para:
migrations, bootstrap de papéis, DDL, transferência de ownership e operações
administrativas de schema. **A aplicação não a utiliza em runtime.**

`DATABASE_URL` continua sendo a credencial da aplicação e, após a migração de
segurança, aponta para `app_login` — sem ownership.

### B3 — PostgreSQL efêmero via Docker para testes financeiros ✅

Testes financeiros destrutivos rodam em PostgreSQL controlado, descartável e
reproduzível, na porta `5432` (verificada livre). O ambiente precisa ser capaz de
testar papéis, ownership e privilégios reais.

O Supabase remoto deixa de ser fonte de verdade para testes financeiros
destrutivos. Pode permanecer para outros testes.

Motivo de recusar o gerenciado para esta finalidade: o único login disponível lá é
dono dos objetos. Um teste de append-only conectado como dono **passaria por
acidente ou falharia pelo motivo errado** — mediria outra coisa.

### B3-a — Ambiente externo dedicado como alternativa ao Docker ✅

**Emenda a B3, aprovada em 2026-09-09.** Registrada porque a decisão original
dizia "Docker" e a execução real usou outro caminho — mudar isso sem escrever
seria exatamente o silêncio que este ADR proíbe.

**Motivo:** na máquina de desenvolvimento o Docker Desktop não sobe. Causa raiz
medida: o WSL não tem nenhuma distribuição instalada, então o engine Linux não
tem onde executar. Não é configuração do projeto.

**O que muda:** o ambiente de teste pode ser um PostgreSQL dedicado já
existente, informado por `TEST_DATABASE_URL`. O orquestrador escolhe o modo pelo
ambiente: com `TEST_DATABASE_URL` definida usa o externo, senão sobe o Docker.

**O que NÃO muda — e é o ponto:** as garantias exigidas continuam sendo provadas,
não presumidas. As duas identidades seguem separadas, `app_login` segue sem
ownership e sem DDL, e os testes 5 e 8 seguem conectando como `app_login` para
provar append-only e propriedade. O modo escolhe **onde**, nunca **o quê**.

**Verificado empiricamente antes de adotar** (sondagens em `BEGIN … ROLLBACK`,
sem persistir nada): criação dos três papéis ✔ · criação de login com senha ✔ ·
transferência de propriedade do schema e das tabelas ✔ · `REVOKE`/`GRANT` ✔ ·
`ALTER DEFAULT PRIVILEGES` ✔ · gatilho `BEFORE TRUNCATE` ✔ · **autenticação de
papel customizado pelo pooler** ✔ (formato `<role>.<project-ref>`; sem o sufixo
o Supavisor recusa com "no tenant identifier provided").

**Duas limitações do ambiente gerenciado, documentadas porque afetam a suíte:**

1. **Sessões limitadas.** O pooler em modo sessão impõe `pool_size: 15` por
   tenant. Os pools da suíte foram reduzidos e os arquivos passam a rodar um por
   vez (`--test-concurrency=1`). A concorrência que os testes 2, 3 e 10
   exercitam é **dentro** de cada arquivo, com `Promise.all` — essa permanece
   intacta. O que serializou foi a execução dos arquivos entre si.
2. **OID de papel em cache.** Apagar e recriar `app_login` a cada execução troca
   o OID; o pooler serve o antigo e a execução seguinte falha com
   `42704 invalid role OID`. Por isso o papel é criado uma vez e apenas tem a
   senha rotacionada — ao final da execução ela é trocada por um valor aleatório
   descartado, de modo que nenhuma credencial usável sobrevive.

**Preferência mantida:** o Docker efêmero continua sendo o modo preferido, por
ser descartável por construção. O externo é fallback, e exige um banco dedicado
a teste — a suíte escreve nele.

### C — Duas conexões no ambiente de teste ✅

| Variável | Uso |
| --- | --- |
| `TEST_DATABASE_URL` | setup, migrations, fixtures, `TRUNCATE`, teardown, inspeção administrativa |
| `TEST_APP_DATABASE_URL` | conexão como `app_login`, para provar privilégios reais |

Os testes de `UPDATE`/`DELETE`/`TRUNCATE` no ledger e a validação de ownership
usam **obrigatoriamente** `TEST_APP_DATABASE_URL`.

**Se `TEST_APP_DATABASE_URL` não estiver configurada, os testes de segurança
falham com erro explícito de configuração. Não são pulados em silêncio.** Um
teste de append-only que se auto-pula é pior que nenhum: reporta verde sobre uma
garantia não verificada.

---

## Pontos em aberto

Nenhum. **P1** a **P6** foram decididos acima; **A1**, **B3** e **C** cobrem a
lacuna encontrada na inspeção de ambiente.

---

## Consequências

**Positivas**

- O append-only deixa de ser intenção e passa a ser garantido por privilégio, com a
  não-propriedade sustentando o `REVOKE`
- A idempotência vive no banco: um sistema externo pode repetir chamadas à vontade
  na Fase 4 sem que ninguém precise confiar no comportamento dele
- `player existe / wallet não existe` deixa de ser representável
- Centavos inteiros ponta a ponta eliminam a classe de erro que aparece como valor
  cem vezes maior e não levanta exceção
- A Fase 4 encontra a wallet pronta: resta a porta, não a fundação

**Negativas, assumidas conscientemente**

- A Fase 3 não entrega fluxo de dinheiro visível ao usuário. Entrega capacidade
- `/v1/me` fica mais caro, salvo o caminho rápido descrito em **D4**
- A separação de papéis torna o setup local e o de produção mais elaborados, e
  exige um passo de migração de propriedade sobre um banco que já tem dados
- O saldo corrente é derivado e mantido junto ao ledger: sem o teste de
  reconciliação, uma divergência passaria despercebida

**Reversibilidade**

O schema financeiro **não** é reversível como o de `players` foi. A partir da
primeira operação registrada, `down` destrutivo deixa de ser aceitável — a própria
migration da Fase 2 já antecipa isso. Daí a exigência de decidir **P5** antes, e
não depois.
