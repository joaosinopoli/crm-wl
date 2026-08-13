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
- [x] Adicionar exportação de leads, extensibilidade inicial e documentação operacional.
- [x] Validar lint/build, preservar RLS na migration e publicar a fundação na `main`.

### Próxima fase SaaS

- [ ] Adicionar importação CSV com deduplicação e mapeamento de campos.
- [ ] Criar UI de múltiplos pipelines e permissões por capability.
- [ ] Convergir agenda, tarefas e notas numa timeline unificada.
- [ ] Adicionar convites por e-mail, auditoria, billing por plano e integrações oficiais.
