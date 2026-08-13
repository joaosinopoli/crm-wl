# Linha de base técnica

Data: 13 de agosto de 2026.

## Dependências

A instalação com `npm ci --no-audit --no-fund` foi concluída. O projeto usa Next.js 16.3, React 19, TypeScript 5, Supabase SSR/client, Tailwind CSS 4 e `@hello-pangea/dnd`.

## Lint

`npm run lint` falha com 25 erros e 3 avisos. Os problemas principais são o uso extensivo de `any` em páginas, ações e componentes; uma chamada de `setState` síncrona dentro de `useEffect` em `CalendarAgenda.tsx`; e imports/variáveis não utilizados em `settings/page.tsx` e `utils/supabase/server.ts`.

Como o comando estava encadeado com `&&`, o build não chegou a ser executado depois da falha do lint. É necessário correr o build isoladamente.

## Observação de qualidade

A aplicação parece estar num estágio funcional inicial, mas sem uma camada de tipos partilhados, sem testes automatizados visíveis no repositório e sem migrations/schema Supabase versionados. Esses pontos devem ser tratados antes de ampliar substancialmente o domínio funcional.
