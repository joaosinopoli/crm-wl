# CRM White Label — Auditoria e roadmap de evolução

**Autor:** Manus AI  
**Data:** 13 de agosto de 2026  
**Repositório auditado:** [joaosinopoli/crm-wl](https://github.com/joaosinopoli/crm-wl) [1]

## Síntese executiva

O projeto já possui uma base funcional de CRM multi-tenant em Next.js com Supabase: autenticação por e-mail e Google, onboarding de empresa, dashboard, funil kanban, leads ativos, histórico de leads encerrados, agenda, campos personalizados, gestão de equipa e configurações. A aplicação publicada apresenta uma landing page coerente com a proposta de valor do produto [1].

A base compila com sucesso em produção, mas ainda não está pronta para uma expansão segura sem uma etapa de fundação. O lint falha com **25 erros e 3 avisos**, o README continua no template inicial, não há testes automatizados nem migrations/schema Supabase versionados no repositório, e várias server actions de escrita não validam explicitamente autenticação, papel e pertença à empresa antes de alterar registos.

> **Recomendação principal:** priorizar isolamento multi-tenant e autorização no backend, contratos de dados/migrations e testes mínimos antes de adicionar automações, integrações e módulos financeiros.

## Inventário atual

| Área | Estado observado | Maturidade |
| --- | --- | --- |
| Autenticação | E-mail/senha, Google OAuth, logout e proteção de rotas | Inicial funcional |
| Multi-tenant | `companies`, `profiles.company_id` e provisionamento inicial | Parcial; RLS/schema não versionados |
| Leads | Criação, edição, atribuição, valor, observação e campos personalizados | Funcional inicial |
| Funil | Kanban, mudança de etapa e configuração de etapas | Funcional inicial |
| Agenda | Criação e listagem de compromissos por utilizador/perfil | Básica |
| Histórico | Fecho ganho/perdido, pesquisa, filtro por estado e datas | Funcional inicial |
| Equipa | Criação e edição de colaboradores via Service Role | Sensível; requer hardening |
| Relatórios | Total ganho, pipeline, conversão, ganhos/perdas | Muito básico |
| Qualidade | Build passa; lint falha; sem testes visíveis | Insuficiente para escala |
| Documentação | README padrão do create-next-app | Insuficiente |
| Dados | Sem migrations ou schema SQL no repositório | Risco operacional elevado |

## Lacunas críticas

### Segurança e autorização

As ações `updateLeadStep`, `updateLead`, `closeLead`, `updateFunnelStep`, `reorderFunnelStep`, `deleteCustomField`, `updateCustomFieldsOrder` e `updateArchivedLead` não fazem, no próprio backend, uma validação consistente da sessão, do papel do utilizador e da empresa do registo alvo. Algumas leituras filtram por `company_id`, mas várias escritas usam apenas o identificador do registo. A segurança pode estar parcialmente delegada ao RLS do Supabase, porém as políticas e funções SQL não estão versionadas no projeto; portanto, esta auditoria não consegue provar o isolamento entre tenants.

A ação `updateEmployee` usa a Service Role e atualiza um perfil por `employeeId` sem restringir a operação à empresa do administrador. O papel recebido do formulário também precisa de uma whitelist explícita. A criação de colaboradores deve impedir escalada acidental para administrador e tratar rollback caso a criação do utilizador Auth seja concluída mas a criação do perfil falhe.

### Consistência de onboarding

O cadastro tradicional chama a RPC `provision_new_tenant`, enquanto o callback Google contém uma segunda implementação inline que cria empresa, perfil e três etapas padrão. Estes caminhos podem divergir em defaults, idempotência e tratamento de falhas. O ideal é centralizar o provisionamento numa única função SQL ou serviço de domínio idempotente.

### Qualidade de código

O build de produção passa, mas `npm run lint` falha por uso extensivo de `any`, uma atualização de estado síncrona dentro de `useEffect` no calendário e imports/variáveis não utilizados. A ausência de tipos partilhados para `Lead`, `Profile`, `FunnelStep`, `CustomField` e `Appointment` torna mais provável a divergência entre páginas, componentes e actions.

### Operação e produto

Não existe no repositório uma camada de auditoria de alterações, sistema de tarefas/follow-ups, notificações, pesquisa global, paginação, importação/exportação, etiquetas, anexos, templates de comunicação, webhooks ou integrações de mensagens. O dashboard atual é útil como resumo, mas não oferece tendências por período, desempenho por vendedor, aging do pipeline, origem dos leads ou previsão ponderada.

## Roadmap recomendado

| Fase | Entrega | Prioridade | Critério de conclusão |
| --- | --- | --- | --- |
| 0. Fundação | README real, `.env.example`, migrations/schema, tipos partilhados, validação de inputs, lint limpo e testes de actions | P0 | Build e lint passam; schema reproduzível; testes cobrem autorização e fluxos críticos |
| 1. Segurança multi-tenant | Helpers de sessão/perfil, autorização centralizada, escopo por `company_id`, RLS documentado, hardening de equipa e onboarding idempotente | P0 | Nenhuma mutação crítica depende apenas de um ID; casos cross-tenant são rejeitados |
| 2. Produtividade comercial | Tarefas/follow-ups, timeline de atividade, notas múltiplas, etiquetas, pesquisa/filtros no leads ativos e notificações internas | P1 | Vendedor consegue saber o que fazer hoje e histórico por lead fica completo |
| 3. Pipeline avançado | Pipelines configuráveis, motivos de perda, probabilidade por etapa, aging, previsão ponderada, metas e relatórios por equipa | P1 | Dashboard permite análise temporal e por vendedor com filtros consistentes |
| 4. Entrada e saída de dados | CSV/XLSX import/export, deduplicação por telefone/e-mail, validação e relatório de erros | P1 | Importação segura e reversível com pré-visualização |
| 5. White label completo | Logo, cores, domínio/subdomínio, nome da empresa, templates de e-mail/WhatsApp e preferências de timezone/moeda | P1 | Cada tenant vê a sua marca e configurações sem fuga de dados |
| 6. Automação e integrações | Webhooks, API keys por tenant, automações de follow-up, e-mail, WhatsApp oficial e calendário externo | P2 | Eventos auditáveis, retries e revogação de credenciais implementados |
| 7. Escala e monetização | Planos, limites por recurso, billing, observabilidade, rate limiting, feature flags e onboarding guiado | P2 | Operação mensurável e planos aplicados no backend, não apenas na UI |

## Primeiro incremento recomendado

O primeiro incremento deve ser a **Fase 0 + Fase 1**, porque são pré-requisitos para qualquer funcionalidade que armazene mais dados ou integre serviços externos. Depois disso, a primeira funcionalidade visível de alto valor deve ser o módulo de **tarefas e follow-ups por lead**, ligado à agenda existente. Esse módulo ataca diretamente a promessa do produto de evitar esquecimentos sem exigir uma integração externa logo no início.

Para implementar a fundação com segurança, é necessário confirmar a disponibilidade do projeto Supabase usado pela aplicação ou receber o schema/migrations atuais. O repositório contém apenas o cliente e as chamadas às tabelas/RPCs, não a definição dessas tabelas e políticas.

## Próxima decisão

A implementação pode começar por uma destas opções:

1. **Fundação e segurança:** corrigir autorização, isolamento multi-tenant, tipos, lint, testes e documentação.
2. **Funcionalidade comercial:** implementar tarefas/follow-ups, timeline, etiquetas e pesquisa avançada, assumindo primeiro o schema Supabase atual.
3. **White label visual:** implementar branding por empresa, preferências e personalização da experiência.

A opção recomendada é a primeira. Se o schema Supabase estiver acessível no painel ou num projeto ligado, ele deve ser disponibilizado para que as migrations e políticas possam ser validadas em vez de inferidas.

## Referências

[1]: https://github.com/joaosinopoli/crm-wl — Repositório GitHub e documentação pública do CRM White Label.
