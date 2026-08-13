# Redesign do CRM SaaS White-Label

## Three approaches

### Theme Name: Quiet Enterprise
Very Brief Intro: Uma plataforma de operações com superfícies neutras, contraste tipográfico e foco em previsibilidade. A sensação é de ferramenta sólida para equipas maduras.
Probability: 0.07

### Theme Name: Signal Console
Very Brief Intro: Um centro de comando escuro e expressivo, com estados de negócio tratados como sinais e uma linguagem visual de monitorização. A experiência é mais técnica e imediata.
Probability: 0.04

### Theme Name: Fieldwork OS
Very Brief Intro: Um CRM claro, humano e modular, inspirado em cadernos de campo, fichas de operação e etiquetas de processo. A sensação é de proximidade, ritmo e ação.
Probability: 0.06

## Chosen approach: Fieldwork OS

### Design Movement
Neo-brutalismo editorial aplicado a uma ferramenta de operações, com superfícies de papel quente, tipografia condensada para estados e cartões assimétricos para dar prioridade ao trabalho real.

### Core Principles
1. **O próximo movimento é sempre visível.** Cada tela deve responder ao que merece atenção agora.
2. **O workspace é uma marca, não apenas um tenant.** Nome, cor, vocabulário e contexto aparecem no shell.
3. **Densidade com hierarquia.** A informação pode ser rica, mas nunca deve competir no mesmo nível visual.
4. **Menos decoração, mais sinal.** Status, risco, valor e responsabilidade têm tratamento visual próprio.

### Color Philosophy
O fundo base é um branco mineral `#F7F7F3`, quase papel, para afastar o produto do azul SaaS genérico. A assinatura é **Cobalt Signal `#3158D4`**, usado apenas em ações e estados de decisão. Graphite `#15202B` ancora a leitura; coral `#F4775C` marca risco/atraso; moss `#4F8B70` marca avanço; lilac `#8F83D6` marca inteligência.

### Layout Paradigm
Shell com rail lateral persistente, header de contexto curto e conteúdo organizado como um painel de operações: uma coluna principal de trabalho e uma coluna lateral de “atenção agora”. A composição evita centralização total e usa cartões com alturas e densidades diferentes.

### Signature Elements
1. Rail de navegação com marcador vertical de secção e ícones em caixas quadradas.
2. Cartões de métrica com uma linha de cor e etiqueta monoespaçada de estado.
3. “Next move” cards que terminam em uma ação concreta, não em decoração.

### Interaction Philosophy
As interações devem confirmar responsabilidade. Hover revela contexto; active state mostra onde a pessoa está; ações críticas têm feedback textual; drawers e menus entram a partir da origem. Visualizadores veem claramente o que podem consultar e o que está bloqueado.

### Animation
Entradas de página usam fade + translate de 12px em 220ms. Cards de métricas entram com 50ms de stagger. Hover usa apenas transform/opacity. Drag and drop mantém a geometria e altera apenas elevação e outline. `prefers-reduced-motion` desativa movimentos não essenciais.

### Typography System
Títulos: `Georgia, Cambria, serif`, peso 700, com tracking negativo para uma voz editorial. Interface: `ui-sans-serif, system-ui`, peso 500–700. Labels e estados: `ui-monospace, SFMono-Regular, monospace`, uppercase, 10–11px, tracking 0.14em.

### Brand Essence
Um sistema de operação comercial white-label para equipas que precisam de saber o que fazer a seguir, em qualquer nicho de negócio. Personalidade: **preciso, atento, configurável**.

### Brand Voice
Headlines são diretas e orientadas à ação. CTAs dizem o que acontece a seguir. Microcopy reduz ansiedade e mostra contexto.

Exemplo de headline: “O teu negócio, em movimento.”

Exemplo de CTA: “Assumir próximo contacto”.

### Wordmark & Logo
O símbolo é um “F” modular formado por três barras cobalt que também sugerem etapas de pipeline. O wordmark usa `CRM / FIELDWORK` em monospace condensado, sempre acompanhado por um pequeno ponto de estado.

### Signature Brand Color
**Cobalt Signal `#3158D4`** — reconhecível, operacional e reservado às decisões que movem o negócio.
