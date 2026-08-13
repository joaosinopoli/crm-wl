// Fieldwork OS: o dashboard responde “o que merece atenção agora?” antes de mostrar métricas decorativas.
import { getDashboardMetrics } from '@/src/app/actions/metrics'
import Link from 'next/link'
import { getWorkspaceSettings } from '@/src/app/actions/workspace'
import { ArrowUpRight, CheckSquare2, CircleDollarSign, MessageSquareText, Plus, Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics()
  const workspace = await getWorkspaceSettings()

  if (!metrics) {
    return <div className="p-8 text-gray-500">Erro ao carregar métricas.</div>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(workspace?.locale || 'pt-BR', { style: 'currency', currency: workspace?.currency || 'BRL' }).format(value)
  }

  const openRate = metrics.openCount > 0 ? Math.min(100, Math.round((metrics.wonCount / Math.max(metrics.openCount + metrics.wonCount, 1)) * 100)) : 0

  return <div className="mx-auto w-full max-w-[1480px]">
    <div className="fieldwork-page-intro"><div><p className="fieldwork-page-kicker">01 / Command center</p><h1 className="fieldwork-page-title">O teu negócio,<br /><em className="not-italic text-[var(--brand-primary)]">em movimento.</em></h1><p className="fieldwork-page-copy">Uma leitura curta do que está a acontecer em {workspace?.portal_name || 'seu workspace'} — e do próximo contacto que pode mudar o resultado.</p></div><div className="flex flex-wrap items-center gap-2"><Link href="/dashboard/leads" className="fieldwork-secondary-button"><Plus size={14} /> Novo contacto</Link><Link href="/dashboard/conversas" className="fieldwork-primary-button"><MessageSquareText size={14} /> Abrir inbox</Link></div></div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--moss)' } as React.CSSProperties}><div className="flex items-start justify-between"><span className="fieldwork-metric-label">Receita ganha</span><CircleDollarSign size={17} className="text-[var(--moss)]" /></div><div className="fieldwork-metric-value">{formatCurrency(metrics.totalWon)}</div><p className="fieldwork-metric-note text-[var(--moss)]">{metrics.wonCount} fecho(s) confirmados</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--brand-primary)' } as React.CSSProperties}><div className="flex items-start justify-between"><span className="fieldwork-metric-label">Em movimento</span><ArrowUpRight size={17} className="text-[var(--brand-primary)]" /></div><div className="fieldwork-metric-value">{formatCurrency(metrics.totalPipeline)}</div><p className="fieldwork-metric-note text-[var(--brand-primary)]">{metrics.openCount} {workspace?.lead_label_plural?.toLowerCase() || 'leads'} ativos</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--lilac)' } as React.CSSProperties}><div className="flex items-start justify-between"><span className="fieldwork-metric-label">Conversão</span><Sparkles size={17} className="text-[#8f83d6]" /></div><div className="fieldwork-metric-value">{metrics.conversionRate}%</div><p className="fieldwork-metric-note text-[#7469b9]">Leitura de ganhos vs. perdas</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--coral)' } as React.CSSProperties}><div className="flex items-start justify-between"><span className="fieldwork-metric-label">Perdas para aprender</span><ArrowUpRight size={17} className="rotate-90 text-[var(--coral)]" /></div><div className="fieldwork-metric-value">{metrics.lostCount}</div><p className="fieldwork-metric-note text-[var(--coral)]">Negócios que pedem revisão</p></div>
    </div>

    <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <section className="fieldwork-panel p-6 md:p-7"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="fieldwork-page-kicker">Saúde do pipeline</p><h2 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">Onde está o atrito?</h2></div><Link href="/dashboard/relatorios" className="fieldwork-inline-link">Ver análise <ArrowUpRight size={14} /></Link></div><div className="grid gap-7 md:grid-cols-[.8fr_1.2fr] md:items-center"><div className="fieldwork-health-ring" style={{ '--ring-value': `${Math.max(openRate, 5)}%` } as React.CSSProperties}><div><strong>{openRate}%</strong><span>ganho sobre<br />base trabalhada</span></div></div><div className="space-y-5"><div><div className="mb-2 flex justify-between text-xs font-bold text-[var(--ink-soft)]"><span>Oportunidades abertas</span><span>{metrics.openCount}</span></div><div className="fieldwork-progress"><i style={{ width: `${Math.min(100, metrics.openCount > 0 ? 72 : 0)}%`, background: 'var(--brand-primary)' }} /></div></div><div><div className="mb-2 flex justify-between text-xs font-bold text-[var(--ink-soft)]"><span>Fechos confirmados</span><span>{metrics.wonCount}</span></div><div className="fieldwork-progress"><i style={{ width: `${Math.max(metrics.wonCount ? 22 : 0, openRate)}%`, background: 'var(--moss)' }} /></div></div><div><div className="mb-2 flex justify-between text-xs font-bold text-[var(--ink-soft)]"><span>Perdas a rever</span><span>{metrics.lostCount}</span></div><div className="fieldwork-progress"><i style={{ width: `${Math.min(100, metrics.lostCount * 10)}%`, background: 'var(--coral)' }} /></div></div></div></div></section>
      <section className="fieldwork-panel bg-[var(--ink)] p-6 text-white md:p-7"><div className="mb-7 flex items-start justify-between"><div><p className="fieldwork-page-kicker !text-[#8fa8ff]">Próximos movimentos</p><h2 className="text-2xl font-black tracking-[-0.04em]">Não deixe o contexto<br />ficar para depois.</h2></div><CheckSquare2 size={19} className="text-[#8fa8ff]" /></div><div className="space-y-3"><Link href="/dashboard/tasks" className="fieldwork-action-row"><span><b>01</b> Rever fila de follow-ups</span><ArrowUpRight size={14} /></Link><Link href="/dashboard/kanban" className="fieldwork-action-row"><span><b>02</b> Mover negócios parados</span><ArrowUpRight size={14} /></Link><Link href="/dashboard/conversas" className="fieldwork-action-row"><span><b>03</b> Responder conversas</span><ArrowUpRight size={14} /></Link></div><p className="mt-8 text-[11px] leading-5 text-[#a8b3b8]">O CRM funciona melhor quando cada número termina numa ação concreta.</p></section>
    </div>
  </div>
}
