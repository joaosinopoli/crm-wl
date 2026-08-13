# Evolução da navegação do CRM

- [x] Auditar a navbar atual, as rotas protegidas e os módulos já existentes.
- [x] Definir grupos de navegação por operação, inteligência e gestão.
- [x] Acrescentar a aba Relatórios sem expor rotas administrativas a vendedores.
- [x] Validar estados ativos, responsividade, navegação por teclado e build de produção.
- [x] Executar lint/build e publicar a alteração numa branch do GitHub.

## Integração final na main

- [x] Verificar o estado remoto de `main` e `feature/report-site`.
- [x] Integrar a implementação validada na `main` sem perder histórico.
- [x] Executar lint/build diretamente na `main` atualizada.
- [x] Confirmar que a plataforma final aponta para a `main` com as novas rotas.

## Remodelação SaaS white-label multi-nicho

- [x] Auditar isolamento multi-tenant, schema, server actions, permissões e dependências externas.
- [x] Definir entidades de workspace, branding, nicho, papéis, permissões e configurações flexíveis.
- [ ] Remodelar onboarding, convites, recuperação de conta e experiência de conta ponta a ponta.
- [x] Implementar a fundação de CRM multi-nicho com pipelines, campos, contactos, atividades e relatórios compatíveis.
- [x] Adicionar importação/exportação de leads, extensibilidade inicial e documentação operacional.
- [x] Validar lint/build, preservar RLS na migration e publicar a fundação na `main`.

### Próxima fase SaaS

- [ ] Adicionar importação CSV com deduplicação e mapeamento de campos.
- [ ] Criar UI de múltiplos pipelines e permissões por capability.
- [ ] Convergir agenda, tarefas e notas numa timeline unificada.
- [ ] Adicionar convites por e-mail, auditoria, billing por plano e integrações oficiais.

## Reestruturação completa do frontend SaaS

- [ ] Definir a nova direção visual, tokens, componentes e arquitetura do shell.
- [ ] Substituir a sidebar e o header por uma experiência SaaS nova, responsiva e white-label.
- [ ] Redesenhar dashboard, funil, leads, tarefas, agenda e relatórios com nova composição visual.
- [ ] Redesenhar onboarding, equipa, configurações, login, signup e estados de conta.
- [ ] Validar visualmente desktop/mobile, acessibilidade, rotas e build.
- [ ] Publicar a nova experiência na `main` e atualizar documentação visual.

## Plataforma de leads e conversas

- [ ] Mapear os fluxos de inbox, lead, pipeline, timeline, atividade e automação.
- [ ] Criar o shell operacional novo com navegação por contexto e comando rápido.
- [ ] Implementar inbox de conversas, detalhe do lead e timeline unificada.
- [ ] Redesenhar pipeline, cadências, tarefas, relatórios e segmentação.
- [ ] Validar estados vazios, loading, erros, permissões e experiência mobile.

## Revisão visual crítica — Fieldwork OS

- [ ] Auditar desktop e mobile das páginas públicas e autenticadas, identificando quebras de layout e zonas de baixa legibilidade.
- [ ] Corrigir tipografia, contraste, largura de leitura, densidade de informação e hierarquia dos componentes principais.
- [ ] Normalizar botões, inputs, tabelas, painéis, modais e estados vazios num sistema visual único.
- [ ] Rever o rail, topbar e shell responsivo para evitar cortes, overflow e perda de contexto em ecrãs pequenos.
- [ ] Validar visualmente dashboard, pipeline, inbox, leads, tarefas, agenda, relatórios, settings, login e signup antes de publicar.
- [ ] Corrigir o modal de leads que aparece cortado no viewport, com scroll interno inadequado e fundo da página ainda excessivamente presente.
- [ ] Aumentar a escala mínima de texto, labels, inputs e navegação; o shell não pode depender de microtipografia para caber no ecrã.
- [ ] Rever a largura útil da área autenticada e a relação rail/conteúdo para que títulos, métricas e filtros não fiquem comprimidos.
