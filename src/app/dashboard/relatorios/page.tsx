// Editorial Systems Briefing: relatório operacional com prova de pipeline, conversão e follow-up.
import Link from 'next/link'
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Clock3, TrendingUp } from 'lucide-react'
import { getReportsData } from '@/src/app/actions/metrics'

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

export default async function ReportsPage() {
  const reports = await getReportsData()

  if (!reports) {
    return <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-sm text-red-700">Não foi possível carregar os relatórios deste workspace.</div>
  }

  const maxStepValue = Math.max(...reports.leadsByStep.map((step) => step.value), 1)
  const conversionRate = reports.wonCount + reports.lostCount > 0 ? Math.round((reports.wonCount / (reports.wonCount + reports.lostCount)) * 100) : 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600">Inteligência comercial</p>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Relatórios</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Veja onde o pipeline está concentrado, quanto já foi convertido e se a equipa está a acompanhar os próximos contactos.</p>
        </div>
        <Link href="/dashboard/tasks" className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 md:self-auto">Abrir follow-ups <ArrowRight size={15} /></Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-blue-500 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pipeline aberto</span><TrendingUp size={18} className="text-blue-600" /></div><p className="text-2xl font-black text-gray-900">{formatCurrency(reports.totalPipeline)}</p><p className="mt-2 text-xs font-medium text-gray-500">{reports.totalLeads} leads no workspace</p></div>
        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-green-500 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Vendas ganhas</span><CheckCircle2 size={18} className="text-green-600" /></div><p className="text-2xl font-black text-gray-900">{formatCurrency(reports.totalWon)}</p><p className="mt-2 text-xs font-medium text-green-600">{reports.wonCount} negócios convertidos</p></div>
        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-violet-500 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Conversão</span><BarChart3 size={18} className="text-violet-600" /></div><p className="text-2xl font-black text-gray-900">{conversionRate}%</p><p className="mt-2 text-xs font-medium text-gray-500">Ganhos sobre negócios fechados</p></div>
        <div className="rounded-2xl border border-gray-200 border-l-4 border-l-orange-500 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-gray-500">Follow-ups em aberto</span><ClipboardCheck size={18} className="text-orange-600" /></div><p className="text-2xl font-black text-gray-900">{reports.openTasks}</p><p className="mt-2 text-xs font-medium text-orange-600">{reports.overdueTasks} em atraso</p></div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
          <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-gray-400">Distribuição do pipeline</p><h3 className="mt-1 text-xl font-black text-gray-900">Valor por etapa do funil</h3></div><span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Atualizado agora</span></div>
          {reports.leadsByStep.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-sm text-gray-500">Ainda não há leads suficientes para desenhar a distribuição.</div> : <div className="space-y-5">{reports.leadsByStep.map((step) => <div key={step.title}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="font-bold text-gray-800">{step.title}</span><span className="font-semibold text-gray-500">{formatCurrency(step.value)} <span className="ml-1 text-xs text-gray-400">({step.count})</span></span></div><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max((step.value / maxStepValue) * 100, step.value > 0 ? 5 : 0)}%`, backgroundColor: step.color }} /></div></div>)}</div>}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm md:p-7">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Saúde da operação</p>
          <h3 className="mt-1 text-xl font-black">Tarefas e ritmo de execução</h3>
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><Clock3 size={18} className="text-orange-300" /><span className="text-sm text-gray-300">Em atraso</span></div><strong className="text-2xl text-orange-300">{reports.overdueTasks}</strong></div>
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><ClipboardCheck size={18} className="text-blue-300" /><span className="text-sm text-gray-300">Em aberto</span></div><strong className="text-2xl">{reports.openTasks}</strong></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-300" /><span className="text-sm text-gray-300">Concluídas</span></div><strong className="text-2xl text-green-300">{reports.completedTasks}</strong></div>
          </div>
          <div className="mt-9 rounded-xl bg-white/10 p-4 text-xs leading-5 text-gray-300">Mantenha as tarefas em atraso perto de zero para evitar que o valor do pipeline fique sem próximo passo.</div>
        </section>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:p-6"><div><p className="text-sm font-black text-blue-900">Quer transformar esta leitura em ação?</p><p className="mt-1 text-sm text-blue-700">Use o Kanban para mover negócios e a Agenda para reservar o próximo contacto.</p></div><div className="flex flex-wrap gap-3"><Link href="/dashboard/kanban" className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">Abrir funil</Link><Link href="/dashboard/agenda" className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100">Ver agenda</Link></div></div>
    </div>
  )
}
