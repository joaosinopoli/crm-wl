import { getDashboardMetrics } from '@/src/app/actions/metrics'
import Link from 'next/link'
import { getWorkspaceSettings } from '@/src/app/actions/workspace'

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  const workspace = await getWorkspaceSettings()

  if (!metrics) {
    return <div className="p-8 text-gray-500">Erro ao carregar métricas.</div>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(workspace?.locale || 'pt-BR', { style: 'currency', currency: workspace?.currency || 'BRL' }).format(value)
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900">Resumo Financeiro e Desempenho</h2>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o desempenho de {workspace?.portal_name || 'seu workspace'} e o valor projetado no {workspace?.pipeline_label?.toLowerCase() || 'funil'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Vendido (Ganho)</p>
          <h3 className="text-3xl font-black text-gray-900">{formatCurrency(metrics.totalWon)}</h3>
          <p className="text-xs font-medium text-green-600 mt-2 bg-green-50 w-fit px-2 py-1 rounded">
            {metrics.wonCount} negócios fechados
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pipeline (Em Aberto)</p>
          <h3 className="text-3xl font-black text-gray-900">{formatCurrency(metrics.totalPipeline)}</h3>
          <p className="text-xs font-medium text-blue-600 mt-2 bg-blue-50 w-fit px-2 py-1 rounded">
            {metrics.openCount} {workspace?.lead_label_plural?.toLowerCase() || 'leads'} ativos
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Taxa de Conversão</p>
          <h3 className="text-3xl font-black text-gray-900">{metrics.conversionRate}%</h3>
          <p className="text-xs font-medium text-purple-600 mt-2 bg-purple-50 w-fit px-2 py-1 rounded">
            Baseado em ganhos/perdas
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Negócios Perdidos</p>
          <h3 className="text-3xl font-black text-gray-900">{metrics.lostCount}</h3>
          <p className="text-xs font-medium text-red-600 mt-2 bg-red-50 w-fit px-2 py-1 rounded">
            Clientes que não fecharam
          </p>
        </div>
      </div>

      <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <h3 className="text-xl font-bold mb-2">Pronto para vender mais?</h3>
        <p className="text-blue-100 text-sm mb-6 max-w-xl">
          Acesse o seu funil de vendas, acompanhe as negociações em andamento e finalize os clientes ganhos para ver o saldo financeiro crescer.
        </p>
        <Link 
          href="/dashboard/kanban"
          className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors inline-block"
        >
          Ir para o Funil de Vendas →
        </Link>
      </div>
    </div>
  )
}
