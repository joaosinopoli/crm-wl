import Link from 'next/link'
import { ArrowLeft, CalendarDays, CheckSquare2, CircleDollarSign, Mail, Phone, Plus, Sparkles, UserRound } from 'lucide-react'
import { getLeadWorkspace } from '@/src/app/actions/leads'
import { getWorkspaceSettings } from '@/src/app/actions/workspace'

// Fieldwork OS: o detalhe do lead é o lugar onde identidade, contexto e próximo movimento se encontram.
export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const workspace = await getWorkspaceSettings()
  const data = await getLeadWorkspace(params.id)

  if (!data) {
    return (
      <div className="fieldwork-panel mx-auto max-w-2xl p-10 text-center">
        <p className="fieldwork-page-kicker">Contacto não encontrado</p>
        <h1 className="fieldwork-page-title !text-4xl">Este registo não está disponível.</h1>
        <Link href="/dashboard/leads" className="fieldwork-primary-button mt-6">
          Voltar para contactos
        </Link>
      </div>
    )
  }

  const { lead, tasks, appointments } = data
  const owner = Array.isArray(lead.owner) ? lead.owner[0] : lead.owner
  const step = Array.isArray(lead.step) ? lead.step[0] : lead.step
  const formatCurrency = (value: number) => new Intl.NumberFormat(workspace?.locale || 'pt-BR', {
    style: 'currency',
    currency: workspace?.currency || 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
  const createdAt = new Intl.DateTimeFormat(workspace?.locale || 'pt-BR', { dateStyle: 'medium' }).format(new Date(lead.created_at))
  const pendingTask = tasks.find((task) => task.status === 'pending')

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <Link href="/dashboard/leads" className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[var(--ink-soft)] hover:text-[var(--brand-primary)]">
        <ArrowLeft size={14} /> Contactos
      </Link>

      <div className="fieldwork-lead-hero fieldwork-panel">
        <div className="fieldwork-lead-hero-main">
          <div className="fieldwork-lead-avatar">{lead.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="fieldwork-page-kicker">Lead / {step?.title || 'Sem etapa'}</p>
            <h1 className="fieldwork-page-title !text-5xl">{lead.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[var(--ink-soft)]">
              <span className="inline-flex items-center gap-1"><Mail size={13} /> {lead.email || 'Sem e-mail'}</span>
              <span className="inline-flex items-center gap-1"><Phone size={13} /> {lead.phone || 'Sem telefone'}</span>
            </div>
          </div>
        </div>
        <div className="fieldwork-lead-hero-actions">
          <span className="fieldwork-status-pill">{lead.status || 'open'}</span>
          <Link href={`/dashboard/leads/${lead.id}/edit`} className="fieldwork-secondary-button">Editar lead</Link>
        </div>
        <div className="fieldwork-lead-stats">
          <div><span>Valor previsto</span><strong>{formatCurrency(Number(lead.lead_value || 0))}</strong></div>
          <div><span>Responsável</span><strong><UserRound size={14} /> {owner?.full_name || 'Sem responsável'}</strong></div>
          <div><span>Entrou no CRM</span><strong>{createdAt}</strong></div>
          <div><span>Próxima ação</span><strong className="text-[var(--brand-primary)]">{pendingTask?.title || 'Definir agora'}</strong></div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_330px]">
        <section className="fieldwork-panel p-6 md:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="fieldwork-page-kicker">Linha do tempo</p>
              <h2 className="text-2xl font-black tracking-[-.04em] text-[var(--ink)]">O contexto completo.</h2>
            </div>
            <button type="button" className="fieldwork-secondary-button"><Plus size={14} /> Registar atividade</button>
          </div>
          <div className="fieldwork-timeline">
            <div className="fieldwork-timeline-item is-current">
              <span className="fieldwork-timeline-icon"><Sparkles size={14} /></span>
              <div><span className="fieldwork-kicker">AGORA / ETAPA</span><h3>Lead em {step?.title || 'pipeline'}</h3><p>O negócio está na etapa atual do pipeline. O próximo movimento deve ser uma atividade clara para a equipa.</p></div>
            </div>
            {tasks.map((task) => (
              <div key={task.id} className="fieldwork-timeline-item">
                <span className="fieldwork-timeline-icon"><CheckSquare2 size={14} /></span>
                <div><span className="fieldwork-kicker">TAREFA / {task.status}</span><h3>{task.title}</h3><p>{task.description || 'Sem nota adicional.'}</p><small>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(task.due_at))}</small></div>
              </div>
            ))}
            {appointments.map((appointment) => (
              <div key={appointment.id} className="fieldwork-timeline-item">
                <span className="fieldwork-timeline-icon"><CalendarDays size={14} /></span>
                <div><span className="fieldwork-kicker">AGENDA / COMPROMISSO</span><h3>{appointment.title}</h3><p>{appointment.appointment_date} às {appointment.appointment_time}</p></div>
              </div>
            ))}
            {!tasks.length && !appointments.length && <div className="fieldwork-empty-timeline"><Sparkles size={20} /><p>A timeline começa quando uma tarefa, conversa ou compromisso for ligado a este lead.</p></div>}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="fieldwork-panel p-6">
            <p className="fieldwork-page-kicker">Próximo movimento</p>
            <h2 className="mt-2 text-xl font-black tracking-[-.03em] text-[var(--ink)]">Transforme o contexto em ação.</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">Não deixe este lead depender de memória. Crie a atividade que define o avanço.</p>
            <Link href={`/dashboard/tasks?leadId=${lead.id}`} className="fieldwork-primary-button mt-5 w-full justify-center">Criar follow-up <ArrowLeft size={14} className="rotate-180" /></Link>
          </section>
          <section className="fieldwork-panel p-6">
            <div className="mb-4 flex items-center justify-between"><span className="fieldwork-page-kicker !mb-0">Dados do negócio</span><CircleDollarSign size={16} className="text-[var(--moss)]" /></div>
            <dl className="space-y-4 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-soft)]">Etapa</dt><dd className="font-bold text-[var(--ink)]">{step?.title || '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-soft)]">Estado</dt><dd className="font-bold text-[var(--ink)]">{lead.status || 'open'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[var(--ink-soft)]">Valor</dt><dd className="font-bold text-[var(--moss)]">{formatCurrency(Number(lead.lead_value || 0))}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
