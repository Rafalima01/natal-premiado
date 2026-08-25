# Natal Premiado — Etapa 01 (UI / UX / Frontend)

Maquete visual navegável de uma plataforma de raspadinhas com temática de Natal.
**Esta etapa é só interface**: não há backend, banco, autenticação, pagamento,
RNG, saldo ou prêmio real. Tudo que aparece na tela vem de dados mockados.

## Stack

| Camada | Escolha | Porquê |
| --- | --- | --- |
| Build | Vite 6 | dev server rápido, build simples |
| UI | React 19 + TypeScript (strict) | base para a Etapa 02 |
| Rotas | React Router 7 | rotas declarativas, sem SSR |
| Estilo | Tailwind CSS 4 (`@theme`) + CSS próprio | tokens em CSS puro, utilitários para layout |
| Animação | CSS (`@keyframes` + tokens `--animate-*`) | zero dependência extra; só `transform`/`opacity` |
| Assets | SVG escrito à mão | sem imagens externas até os assets finais chegarem |

Nenhuma biblioteca de UI, ícones ou animação foi instalada.

## Rodar

```bash
npm install
npm run dev
```

`npm run build` gera `dist/`. `npm run lint` roda o TypeScript em modo checagem.

## Design system

Tudo vive em `src/styles/`:

- **`tokens.css`** — fonte única de cor, tipografia, raio, sombra, glow, easing
  e animações. Exposto ao Tailwind via `@theme`, então cada token vira utilitário
  (`bg-gold`, `text-muted`, `rounded-xl`, `shadow-glow-red`, `animate-float`…).
- **`base.css`** — reset, o cenário de fundo em 3 camadas fixas (auroras +
  textura de tricô nórdico + poeira de estrelas), foco visível e
  `prefers-reduced-motion`.
- **`effects.css`** — vocabulário compartilhado: `.edge` (moldura de 1px em
  gradiente), `.glass`, `.shine`, `.text-gold-grad`, `.rail` (trilho com snap),
  `.ribbon`, `.snowcap`, `.light-string`.

Cada card recebe uma "família de cor" por meio da prop `accent`
(`gold | red | pine | ember | ice | royal | candy`). `accentStyle()` em
`src/lib/accents.ts` traduz o accent em 4 variáveis CSS (`--a-hi`, `--a-mid`,
`--a-deep`, `--a-glow`) que moldura, brilho, sombra e arte consomem.

> **Atenção ao editar classes:** utilitários conflitantes do Tailwind são
> resolvidos pela ordem da folha de estilo, não pela ordem na string. Por isso
> nenhum componente base declara `position` ou `display` que o `className` de
> quem usa precise sobrescrever — quando for preciso esconder/posicionar, use um
> elemento externo (ver `Header` e `LevelBadge`).

## Estrutura

```
src/
  components/
    art/            Logo, SantaScene, GiftBox, Coin, PrizeArt  (SVG próprio)
    layout/         Header, Footer, MobileTabBar, Layout, AuthShell
    home/           HeroBanner, RecentWins, FeaturedChristmas, CategoryGrid,
                    ScratchSection, DailyGift, ChristmasEvent, PackagesSection,
                    GamificationPanel
    scratch/        ScratchCard, ScratchGrid, ScratchCanvas
    rewards/        PrizeCard, PrizeGrid, PackageCard
    gamification/   XPBar, LevelBadge, MissionCard, EventProgress
    ui/             Button, Badge/Chip, SectionHeader, GlowCard, Countdown,
                    ProgressBar, Field, PageHero, Snowfall, LightString
  data/             mocks centralizados + tipos
  hooks/            useCountdown, useScrolled
  lib/              accents (paletas), format (BRL, cx)
  pages/            uma por rota
  styles/           tokens, base, effects
```

## Rotas

`/` · `/raspadinhas` · `/raspadinha/:id` · `/premios` · `/pacotes` · `/login` ·
`/cadastro` · `/carteira` · `/perfil`

## Assets

Não havia assets no projeto. Toda a arte é SVG escrito à mão (Papai Noel, caixa
de presente, moeda, logo, escudo de nível) ou composição gerada em CSS
(`PrizeArt`: raios + spotlight + ícone).

Para trocar por fotos de produto depois, basta preencher `image` no mock — o
`PrizeArt` usa a imagem no lugar do desenho **sem mexer no layout**:

```ts
{ id: 'loja-da-apple', /* … */ image: '/assets/cartelas/apple.webp' }
```

## O que é simulação

- **Raspadinha** (`ScratchCanvas`): raspagem real em canvas, mas o que está
  embaixo é markup fixo. Sem sorteio, sem resultado, sem rede.
- **Presente do dia**: abre com animação e revela um prêmio fixo.
- **Contagem regressiva**: parte de um valor fixo e decrementa no cliente.
- **Nível, XP, moedas, missões, ranking, saldo, extrato**: constantes em
  `src/data/`.
- **Login e cadastro**: os formulários não enviam, validam nem armazenam nada.
