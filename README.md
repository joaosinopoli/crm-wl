# CRM White Label

CRM multi-tenant para equipas comerciais, construído com Next.js, TypeScript, Supabase e Tailwind CSS. O produto inclui autenticação, onboarding de empresa, funil Kanban, leads, histórico de vendas, agenda, campos personalizados, equipa e tarefas de follow-up.

## Estado atual

A aplicação compila para produção e o lint passa sem erros. A implementação mais recente acrescenta uma fundação de autorização para as mutações críticas e o módulo de **Tarefas e Follow-ups**, que permite criar atividades ligadas a leads, atribuí-las a membros da empresa, definir prioridade e concluir tarefas.

> A aplicação depende de um projeto Supabase configurado. Antes de publicar o módulo de tarefas, aplique a migration existente em `supabase/migrations/20260813170000_create_tasks.sql`.

## Requisitos

É necessário Node.js 20 ou superior, npm e um projeto Supabase. O fluxo de gestão de equipa também requer a Service Role Key exclusivamente no servidor.

## Configuração local

Copie `.env.example` para `.env.local` e preencha as variáveis do projeto Supabase. Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no browser, num commit ou em variáveis `NEXT_PUBLIC_*`.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Utilização | Exposição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Pública no bundle |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon para SSR/browser | Pública no bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | Gestão de utilizadores no servidor | **Apenas servidor** |
| `NEXT_PUBLIC_SITE_URL` | URL base usada em OAuth e produção | Pública |

## Banco de dados

As tabelas base esperadas pelo código atual são `companies`, `profiles`, `funnel_steps`, `leads`, `appointments` e `custom_field_definitions`, além das RPCs de provisionamento já utilizadas pelo onboarding. O schema base ainda precisa de ser versionado no repositório para que um ambiente novo seja reproduzível.

O módulo de tarefas adiciona a tabela `tasks`, índices por empresa/responsável/prazo, atualização automática de `updated_at` e políticas RLS. Aplique a migration no SQL Editor do Supabase ou através do fluxo de migrations adotado pela equipa.

A remodelação SaaS white-label adiciona `supabase/migrations/20260814090000_white_label_workspace_foundation.sql`. Ela cria configurações por workspace, memberships com papéis granulares, pipelines múltiplos, branding, vocabulário de negócio, moeda, timezone e triggers de bootstrap para empresas e perfis novos. Aplique primeiro a migration de tarefas e depois a migration white-label.

## Scripts

| Comando | Objetivo |
| --- | --- |
| `npm run dev` | Iniciar o servidor de desenvolvimento |
| `npm run lint` | Executar ESLint |
| `npm run build` | Gerar o build de produção |
| `npm run start` | Servir o build de produção |

## Estrutura principal

`src/app` contém as rotas e server actions. `src/components` contém a interface interativa. `src/utils/supabase` centraliza os clientes Supabase SSR/browser. `src/utils/auth.ts` expõe o contexto autenticado e o perfil do tenant. `src/types/crm.ts` e `src/types/workspace.ts` concentram os contratos partilhados. `supabase/migrations` guarda migrations novas do produto. A arquitetura detalhada está em [`docs/saas-blueprint.md`](./docs/saas-blueprint.md).

## Segurança e autorização

As operações de escrita devem validar sessão, membership, papel e `company_id` no servidor. Vendedores ficam limitados aos leads e tarefas atribuídos a si; visualizadores não podem mutar dados; administradores e gestores ganham escopos operacionais adicionais conforme o módulo. Esta camada de aplicação complementa, mas não substitui, políticas RLS corretamente configuradas no Supabase.

## Próximas evoluções recomendadas

A próxima etapa deve versionar o schema base e adicionar testes automatizados para autorização cross-tenant. Depois disso, o produto pode evoluir com timeline unificada de atividades, etiquetas, pesquisa global, importação de leads com deduplicação, pipelines múltiplos na UI, billing por plano, auditoria, webhooks e integrações oficiais de e-mail/WhatsApp.

## Website do relatório de entrega

Foi acrescentado o website partilhável do relatório em `report-site/`. Para executá-lo localmente, consulte [`report-site/README.md`](./report-site/README.md). A versão visual está disponível no preview do projeto Manus e a branch de código correspondente é `feature/report-site`.

Para publicar o website separadamente, configure `report-site` como **Root Directory** no projeto de hosting. A aplicação CRM continua a usar a raiz do repositório; o `tsconfig.json` e o ESLint raiz ignoram o subsite para evitar que os dois toolchains sejam misturados.
