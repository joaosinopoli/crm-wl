# CRM White Label — Delivery Report Site

Website estático e responsivo para partilhar com a equipa o relatório do primeiro incremento do CRM White Label. A experiência segue a direção visual **Editorial Systems Briefing**, com rail de evidência, tipografia editorial, estados de validação e próximos passos operacionais.

## Executar localmente

```bash
pnpm install
pnpm dev
```

O website usa React 19, Vite, Tailwind CSS 4 e os componentes shadcn/ui do template. Os assets visuais são referenciados pelas URLs de armazenamento do website gerado e não devem ser substituídos por ficheiros pesados no repositório.

## Validação

```bash
pnpm check
pnpm build
```

A página principal é `client/src/pages/Home.tsx`, o sistema visual está em `client/src/index.css` e a identidade está documentada em `ideas.md`.

## Deploy automático

No Vercel, crie um projeto separado para o website e defina **Root Directory** como `report-site`. A configuração `report-site/vercel.json` instala as dependências dentro da pasta, executa `pnpm check && pnpm build` e publica `dist/public`. Não use a raiz do repositório como Root Directory para este subsite; a raiz é a aplicação Next.js do CRM.

O erro de módulos ausentes (`lucide-react`, `wouter`, `vite`, `express` e componentes `@/`) ocorre quando o verificador usa o `tsconfig.json` da aplicação raiz para analisar a pasta. O pacote está agora autocontido e o `tsconfig.json` raiz exclui `report-site`.
