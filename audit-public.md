# Observações públicas da auditoria

Data: 13 de agosto de 2026.

## Repositório GitHub

O repositório público `joaosinopoli/crm-wl` está na branch `main`, tem três commits e apresenta uma base Next.js com TypeScript. A árvore pública inclui `src/app`, `src/components`, `src/utils/supabase`, ações de servidor para autenticação, agenda, kanban, métricas e equipa, além de páginas de dashboard, leads, agenda, arquivados, form builder, configurações e equipa. O README ainda é o template inicial do create-next-app. O repositório também aponta para a aplicação publicada em `https://crm-wl-theta.vercel.app`.

## Aplicação publicada

A página pública apresenta a marca CRMPro, login com Google, ligação para login tradicional e contacto por WhatsApp. A proposta de valor é organizada em funil, controlo financeiro e setup rápido. A interface usa um layout minimalista em fundo claro, com azul como cor principal e verde associado ao WhatsApp. Não foram feitas ações de login, submissão ou alteração de dados.

## Implicações iniciais

A base já tem o esqueleto de um CRM multi-tenant com Supabase, autenticação e módulos de leads. O README e a documentação de dados/schema parecem insuficientes no repositório. A auditoria seguinte deve validar proteção real por empresa/RLS, consistência entre fluxos de onboarding, robustez das server actions e cobertura de testes antes de acrescentar funcionalidades de negócio.
