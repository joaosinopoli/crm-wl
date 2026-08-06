import type { Metadata } from 'next'
import './globals.css' // Importação vital para a formatação voltar

export const metadata: Metadata = {
  title: 'CRM White Label',
  description: 'Gestão inteligente de leads e follow-up',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* O {children} é onde o Next.js vai injetar o page.tsx atual (Login, Dashboard, etc) */}
        {children}
      </body>
    </html>
  )
}