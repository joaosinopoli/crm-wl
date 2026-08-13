# Blueprint SaaS White-Label do CRM

## Visão do produto

O CRM deixa de ser um sistema centrado em “leads de vendas” e passa a ser um workspace operacional configurável. Cada empresa é um tenant isolado, com identidade própria, vocabulário adaptável, pipeline(s), campos personalizados, membros, regras de acesso e preferências regionais.

> **Princípio do produto:** o núcleo é comum; o processo, a linguagem e a marca pertencem a cada workspace.

## Modelo de tenancy

| Entidade | Responsabilidade | Isolamento |
|---|---|---|
| `companies` | Tenant comercial e dono dos dados | Identificador obrigatório em todas as entidades de negócio |
| `workspace_settings` | Branding, slug, nicho, moeda, timezone, labels e flags | Uma linha por tenant |
| `workspace_memberships` | Relação utilizador–workspace e papel efetivo | Chave única `(company_id, user_id)` |
| `workspace_pipelines` | Pipelines independentes por workspace | Chave única `(company_id, pipeline_key)` |
| `funnel_steps` | Etapas ordenadas de um pipeline | `pipeline_id` e `company_id` |
| `leads`, `tasks`, `appointments` | Operação CRM | `company_id` e RLS |

## Papéis

O campo legado `profiles.role` continua compatível com `admin` e `sales`, mas a autorização evolui para o membership do workspace.

| Papel | Escopo recomendado |
|---|---|
| `owner` | Gestão global do tenant, billing e transferência de propriedade |
| `admin` | Branding, configurações, equipa, pipelines e dados do tenant |
| `manager` | Operação da equipa, relatórios e distribuição de trabalho |
| `sales` | Leads, tarefas e atividades atribuídas ao próprio utilizador |
| `viewer` | Leitura sem mutações |

## Configuração white-label

`workspace_settings` centraliza o que antes ficava espalhado pelo frontend: nome do portal, slug, cores, logo, favicon, timezone, locale, currency e vocabulário de leads, clientes e pipeline. O frontend utiliza defaults seguros quando a migration ainda não foi aplicada, e a migration cria settings e pipeline padrão para tenants existentes e futuros.

Os presets iniciais cobrem negócio geral, serviços profissionais, imobiliário, saúde e bem-estar, educação, comércio, tecnologia/SaaS e outro nicho. Preset é ponto de partida, não limite: os campos, labels e etapas permanecem editáveis.

## Regras de segurança

Toda leitura e mutação deve obter o tenant a partir da sessão atual, nunca a partir de um `company_id` enviado pelo cliente. As tabelas novas têm RLS; server actions devem validar sessão, membership, papel e pertença do alvo ao mesmo tenant antes da escrita. O service role fica restrito à criação de utilizadores e nunca deve ser enviado ao browser.

## Estado implementado nesta ronda

Esta remodelação já adiciona a migration `20260814090000_white_label_workspace_foundation.sql`, a consulta e atualização de workspace, branding dinâmico na navbar, labels configuráveis no dashboard, membership-based auth context, papéis `manager` e `viewer`, painel administrativo de identidade e contexto do negócio, além de importação/exportação CSV com deduplicação e escopo de tenant.

## Próximas fases

O próximo incremento recomendado é convergir agenda e tarefas numa entidade de atividades, criar pipelines múltiplos na UI e acrescentar uma camada de permissões por capability. Em seguida, devem ser implementados convites por e-mail, billing por plano, auditoria de alterações, integrações e testes automatizados cross-tenant.

## Aplicação da migration

Aplicar a migration no projeto Supabase antes de utilizar o formulário de branding, memberships granulares ou pipelines múltiplos. Depois da aplicação, repetir o onboarding de um workspace de teste e verificar a criação de `workspace_settings`, `workspace_memberships`, `workspace_pipelines` e a associação de `funnel_steps` ao pipeline padrão.
