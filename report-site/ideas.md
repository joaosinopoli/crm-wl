# Direção visual — CRM White Label: Relatório de Entrega

## Abordagens consideradas

### Abordagem 1 — Editorial Systems Briefing

Uma publicação interna com linguagem de revista de negócios e rigor de painel operacional: tipografia expressiva, grelha assimétrica e informação tratada como evidência. A experiência deve parecer um documento que ganhou vida, não um dashboard genérico.

**Probabilidade:** 0,07

### Abordagem 2 — Quiet SaaS Ledger

Uma interface muito clara e silenciosa, com foco em leitura rápida, cartões suaves e hierarquia funcional. A emoção é confiança e previsibilidade, aproximando o relatório de um manual premium de operações.

**Probabilidade:** 0,04

### Abordagem 3 — Signal Room

Uma sala de comando escura, com superfícies de grafite, linhas de telemetria e acentos luminosos para sinalizar progresso. O tom é mais tecnológico e urgente, adequado a um update de produto com ritmo de lançamento.

**Probabilidade:** 0,08

## Abordagem escolhida — Editorial Systems Briefing

### Design Movement

**Neo-editorial suíço**, combinando a precisão modular do International Typographic Style com a materialidade de um caderno de operações. A interface trata cada secção como uma página de briefing, com evidências, decisões e próximos movimentos claramente separados.

### Core Principles

1. **A informação tem uma coluna vertebral.** Uma rail lateral persistente funciona como índice vivo e mantém a equipa orientada enquanto percorre o documento.
2. **O contraste cria prioridade.** Grandes títulos em serif display enfrentam labels monoespaçados e texto de leitura confortável, sem transformar tudo em cartões iguais.
3. **A prova vem antes do entusiasmo.** Números de validação, estado de branch e ação Supabase aparecem como factos visíveis, enquanto a narrativa explica o impacto.
4. **A assimetria dá autoria.** O layout alterna uma composição editorial larga com blocos estreitos de anotação, evitando o dashboard perfeitamente centralizado.

### Color Philosophy

O fundo base é um **papel mineral quente** (`#F4F0E8`) para tornar o relatório convidativo e humano. O texto usa **ink quase preto** (`#17212B`) para parecer impresso e aumentar a legibilidade. **Signal Cobalt** (`#2F5BFF`) é a cor proprietária da ação: aparece em ligações, números de progresso e estados importantes. Um **coral de revisão** (`#F06B4D`) marca atenção sem sugerir erro, enquanto o **sage de passagem** (`#A9C5B0`) indica validações concluídas.

### Layout Paradigm

Uma página longa com rail lateral fixa em desktop e índice compacto no topo em mobile. O hero ocupa duas colunas: narrativa à esquerda e um objeto visual editorial à direita. Depois, cada bloco alterna entre uma faixa de título vertical, texto e uma área de evidência. As tabelas do relatório tornam-se módulos de decisão com linhas de leitura rápida, não tabelas administrativas densas.

### Signature Elements

1. **Rail de evidência:** índice vertical com pequenos marcadores de estado e a secção ativa.
2. **Carimbos de execução:** labels monoespaçados como `SHIP / 22DC38C` e `CHECK / PASS` em cápsulas quadradas, lembrando folhas de operações carimbadas.
3. **Linhas de ligação:** hairlines pontilhadas e pequenos nós azuis conectam resultado, validação e próximo passo.

### Interaction Philosophy

As interações devem parecer ações editoriais: clicar no índice leva a uma secção com scroll suave; links de GitHub abrem em contexto seguro; o botão de copiar commit confirma a ação com uma pequena troca de estado; filtros de entregas funcionam como uma lente, nunca como uma modal pesada. Tudo deve ser navegável por teclado, com focus ring visível em Signal Cobalt.

### Animation

As entradas usam apenas `opacity` e `transform`, com deslocamento curto e easing `cubic-bezier(0.23, 1, 0.32, 1)`. O hero revela a rail, o título e a evidência em três passos com 60 ms de diferença. As linhas de ligação podem desenhar-se uma vez ao entrar no viewport, mas não devem repetir em cada scroll. Hover em cards desloca-os 3 px e aumenta a sombra; botões confirmam com `scale(0.97)` durante 140 ms. Todas as animações não essenciais ficam desligadas em `prefers-reduced-motion`.

### Typography System

**DM Serif Display** para o hero, títulos de secção e números heroicos; **Manrope** para parágrafos, labels e UI; **IBM Plex Mono** para commits, estados, metadados e valores técnicos. A hierarquia usa uma frase hero de 72/0.94 em desktop, títulos de secção de 44/1.0, corpo de 17/1.65 e microcopy de 11/1.1 com tracking de 0.14em. Não usar Inter.

### Brand Essence

**Um briefing operacional do CRM para equipas que precisam de ver o que foi entregue, o que foi validado e qual é o próximo movimento — sem ruído de apresentação.**

Personalidade: **preciso, editorial, confiante**.

### Brand Voice

Headlines são diretas e com ritmo de decisão; CTAs usam verbos concretos; microcopy explica consequências e não repete o título. O texto evita entusiasmo vazio e fala como uma equipa que acabou de enviar software para produção.

Exemplos:

> **A base ficou mais segura. Agora podemos acelerar.**

> **Ver a branch, aplicar a migration, fechar o ciclo.**

### Wordmark & Logo

O símbolo é um **par de colchetes abertos com um ponto de sinal no centro**, representando documentação que enquadra uma decisão e um evento que acabou de ser validado. O wordmark usa `CRM / FIELD NOTE` em IBM Plex Mono com uma barra vertical Signal Cobalt; não é texto em fonte default.

### Signature Brand Color

**Signal Cobalt — `#2F5BFF`**. É suficientemente vivo para funcionar como acento em papel mineral, mas suficientemente sério para ligar o relatório a operações reais de produto.

## Regras de aplicação

Cada página ou componente deverá começar com um comentário curto lembrando a sua função dentro da direção **Editorial Systems Briefing**. O site deve manter a rail de evidência, o papel mineral, os carimbos monoespaçados e a alternância entre narrativa e prova. Se uma escolha parecer apenas decorativa, a pergunta é: **isto clarifica o estado do produto ou apenas enfeita a página?**
