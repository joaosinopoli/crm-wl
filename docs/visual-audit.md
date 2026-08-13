# Auditoria visual — Fieldwork OS

## Primeira observação

Em 13 de agosto de 2026, a rota pública publicada em `https://crm-wl-theta.vercel.app` carregou os elementos da nova landing (`fieldwork.`, navegação, CTAs Google/e-mail), mas a captura visual não foi disponibilizada na primeira navegação. A segunda visualização abriu uma página `about:blank` com canvas branco, pelo que a auditoria publicada precisa ser complementada com o preview local ou com uma nova captura após o servidor ser reiniciado.

## Hipóteses de problemas a verificar

- Contraste insuficiente entre texto suave, fundos claros e elementos sobrepostos.
- Títulos serifados demasiado grandes ou com largura de linha desconfortável em mobile.
- Classes utilitárias antigas coexistindo com tokens Fieldwork OS dentro de tabelas, modais e componentes importados.
- Shell e superfícies com densidade elevada, especialmente no rail, topbar, pipeline, inbox e calendários.
- Elementos públicos e autenticação possivelmente a carregar CSS antigo em componentes compartilhados, como o botão Google.

## Capturas publicadas

A landing apresenta uma direção visual mais forte, mas ainda há problemas de produto: a navegação no topo é demasiado pequena para a importância dos destinos; o mockup domina a composição e tem textos internos mais legíveis do que alguns microcopy reais; os dois CTAs têm pesos e larguras diferentes; e o hero usa um título muito grande que ocupa quase todo o primeiro ecrã sem uma segunda camada clara de prova ou ação.

Na autenticação, o painel lateral escuro ocupa quase metade do ecrã e deixa a área do formulário com demasiado espaço vazio. O formulário fica visualmente pequeno, com labels e microcopy em escala reduzida, enquanto o botão Google tem mais presença do que a ação principal por e-mail. A composição é funcional, mas não transmite a densidade e o acabamento de um produto SaaS premium.

O acesso direto a `/dashboard` redirecionou corretamente para `/login`, portanto não existe sessão persistente disponível para auditar as superfícies internas publicadas através do browser atual. A revisão interna será feita pelo código e pela validação local, com atenção especial às regras globais que misturam classes antigas e novas.

## Segunda auditoria local

Com variáveis placeholder apenas para renderização, o preview local mostrou que a autenticação ganhou melhor equilíbrio entre o botão Google, os campos e o CTA de e-mail. A landing também ficou mais coesa: os CTAs agora têm alturas e pesos próximos, o hero não está tão dominante e a hierarquia principal é compreensível no primeiro ecrã.

O problema estrutural permanece nas páginas autenticadas, que não puderam ser capturadas sem uma sessão válida. A próxima correção deve concentrar-se no sistema interno: reduzir o uso de microtipografia em tabelas e rails, remover estilos legados dos componentes importados, assegurar que tabelas não criam overflow inesperado e estabelecer um ritmo de espaçamento que não dependa de dezenas de classes utilitárias concorrentes.

No cadastro local, a medição confirmou `scrollWidth = clientWidth = 1280`, portanto não existe overflow horizontal no desktop. O formulário tem cerca de 735 px de altura dentro de uma página de 1100 px, o que é aceitável desde que o scroll vertical permaneça natural e não seja escondido pelo shell de autenticação.

Após o portal de modais e o ajuste de escala, o login local permaneceu sem overflow horizontal (`scrollWidth = clientWidth = 1280`) e o cartão de autenticação passou a medir aproximadamente 577 px de altura, contra cerca de 735 px no cadastro. A captura ainda não representa a página autenticada porque o preview local usa dados placeholder, mas confirma que a base pública não ficou mais larga nem mais alta por causa das correções.

## Evidência enviada pelo utilizador

O screenshot da workspace de contactos mostrou um modal de edição renderizado dentro da coluna de conteúdo, com a parte superior do formulário fora do viewport, a parte inferior cortada e o restante da tabela visível através de um backdrop acinzentado. O rail ocupava uma largura razoável, mas os índices, descrições, badges e ações estavam pequenos demais para leitura confortável. O título da página também aparecia cortado no topo, evidenciando que o scroll da área interna estava a competir com o overlay.

Correções aplicadas para este caso: os modais de leads, notas, finalização, histórico e equipa passaram a usar `ModalPortal` no `document.body`; o body fica sem scroll enquanto o modal está aberto; o card tem altura máxima baseada no viewport, scroll interno, cabeçalho e ações sticky; a área autenticada passou a ter rail fixo e apenas o main faz scroll; e a workspace de leads recebeu tipografia e sinais com classes próprias, em vez de microtexto Tailwind espalhado.

Na validação local da landing, `scrollWidth = clientWidth = 1265`, sem overflow horizontal. O hero ocupa 694 px de altura e os CTAs partilham uma largura de 430 px, confirmando que o passe de escala não causou uma quebra estrutural na superfície pública.
