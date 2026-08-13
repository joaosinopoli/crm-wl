import Link from 'next/link'
import { ArrowUpRight, CalendarClock, CheckCircle2, Clock3, Flame, Plus, Target } from 'lucide-react'
import { createTask, getTasks, updateTaskStatus } from '@/src/app/actions/tasks'
import { getAllLeadsData } from '@/src/app/actions/kanban'
import type { Task } from '@/src/types/crm'

// Fieldwork OS: tarefas são a camada que transforma pipeline em ritmo de execução.
async function createTaskAction(formData: FormData) { 'use server'; await createTask(formData) }
async function completeTaskAction(taskId: string) { 'use server'; await updateTaskStatus(taskId, 'completed') }

const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' } as const
const priorityClasses = { low: 'fieldwork-task-priority-low', medium: 'fieldwork-task-priority-medium', high: 'fieldwork-task-priority-high' } as const
function formatDate(date: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)) }
function startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date.getTime() }

export default async function TasksPage() {
  const [tasksData, leadsData] = await Promise.all([getTasks('all'), getAllLeadsData()])
  const tasks = tasksData.map((task) => ({ ...task, lead: Array.isArray(task.lead) ? task.lead[0] ?? null : task.lead, assignee: Array.isArray(task.assignee) ? task.assignee[0] ?? null : task.assignee })) as unknown as Task[]
  const today = startOfToday()
  const pending = tasks.filter((task) => task.status === 'pending')
  const overdue = pending.filter((task) => new Date(task.due_at).getTime() < today)
  const todayTasks = pending.filter((task) => { const due = new Date(task.due_at); return due.getTime() >= today && due.toDateString() === new Date().toDateString() })
  const upcoming = pending.filter((task) => !overdue.includes(task) && !todayTasks.includes(task))
  const completed = tasks.filter((task) => task.status === 'completed').slice(0, 8)

  return <div className="mx-auto w-full max-w-[1480px]">
    <div className="fieldwork-page-intro"><div><p className="fieldwork-page-kicker">04 / Cadência comercial</p><h1 className="fieldwork-page-title">O ritmo acontece<br /><em className="not-italic text-[var(--brand-primary)]">entre contactos.</em></h1><p className="fieldwork-page-copy">Organize a próxima ação, proteja os follow-ups e dê à equipa uma fila de execução que não depende de memória.</p></div><div className="fieldwork-page-stamp"><span>HOJE</span><strong>{todayTasks.length} movimento(s)</strong><small>{overdue.length ? `${overdue.length} atrasado(s) pedem atenção` : 'Nenhum atraso crítico'}</small></div></div>

    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--brand-primary)' } as React.CSSProperties}><span className="fieldwork-metric-label">Fila total</span><div className="fieldwork-metric-value">{pending.length}</div><p className="fieldwork-metric-note">Ações em aberto</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--coral)' } as React.CSSProperties}><span className="fieldwork-metric-label">Atrasadas</span><div className="fieldwork-metric-value">{overdue.length}</div><p className="fieldwork-metric-note text-[var(--coral)]">Requerem decisão</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--moss)' } as React.CSSProperties}><span className="fieldwork-metric-label">Concluídas</span><div className="fieldwork-metric-value">{completed.length}</div><p className="fieldwork-metric-note text-[var(--moss)]">Últimas atividades</p></div>
      <div className="fieldwork-metric" style={{ '--metric-color': 'var(--lilac)' } as React.CSSProperties}><span className="fieldwork-metric-label">Alta prioridade</span><div className="fieldwork-metric-value">{pending.filter((task) => task.priority === 'high').length}</div><p className="fieldwork-metric-note">Ações de impacto</p></div>
    </div>

    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
      <section className="space-y-4"><TaskGroup title="Atrasadas — recuperar contexto" tasks={overdue} tone="red" emptyLabel="Nenhuma tarefa atrasada. O ritmo está protegido." /><TaskGroup title="Para hoje — foco da equipa" tasks={todayTasks} tone="blue" emptyLabel="Não há tarefas para hoje. Aproveite para preparar a próxima cadência." /><TaskGroup title="Próximas — manter o compromisso" tasks={upcoming} tone="gray" emptyLabel="Não há tarefas futuras." /><TaskGroup title="Concluídas recentemente" tasks={completed} tone="green" emptyLabel="Ainda não há tarefas concluídas." completed /></section>
      <aside className="fieldwork-panel p-6 xl:sticky xl:top-5"><div className="mb-6 flex items-start justify-between"><div><p className="fieldwork-page-kicker">Nova atividade</p><h2 className="text-xl font-black tracking-[-.04em] text-[var(--ink)]">Definir próximo movimento.</h2></div><Plus size={18} className="text-[var(--brand-primary)]" /></div><form action={createTaskAction} className="space-y-4"><div><label htmlFor="task-title" className="fieldwork-form-label">Título da ação</label><input id="task-title" name="title" required minLength={2} maxLength={160} placeholder="Ex.: Confirmar proposta" className="fieldwork-form-input" /></div><div><label htmlFor="task-lead" className="fieldwork-form-label">Contexto relacionado</label><select id="task-lead" name="leadId" className="fieldwork-form-input"><option value="">Tarefa interna / sem lead</option>{leadsData.leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label htmlFor="task-due" className="fieldwork-form-label">Quando</label><input id="task-due" name="dueAt" type="datetime-local" required className="fieldwork-form-input" /></div><div><label htmlFor="task-priority" className="fieldwork-form-label">Prioridade</label><select id="task-priority" name="priority" defaultValue="medium" className="fieldwork-form-input"><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option></select></div></div>{leadsData.userRole === 'admin' && <div><label htmlFor="task-assignee" className="fieldwork-form-label">Responsável</label><select id="task-assignee" name="assignedTo" className="fieldwork-form-input"><option value="">Atribuir a mim</option>{leadsData.members.map((member) => <option key={member.id} value={member.id}>{member.full_name || 'Sem nome'}</option>)}</select></div>}<div><label htmlFor="task-description" className="fieldwork-form-label">Nota de execução</label><textarea id="task-description" name="description" rows={4} maxLength={1000} placeholder="O que a pessoa precisa saber para executar?" className="fieldwork-form-input resize-y" /></div><button type="submit" className="fieldwork-primary-button w-full justify-center"><Plus size={14} /> Criar atividade</button></form><div className="mt-6 flex items-start gap-2 border-t border-[var(--line)] pt-5 text-[11px] leading-5 text-[var(--ink-soft)]"><Target size={14} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" /> Uma atividade bem descrita reduz o tempo entre intenção e execução.</div></aside>
    </div>
  </div>
}

function TaskGroup({ title, tasks, tone, emptyLabel, completed = false }: { title: string; tasks: Task[]; tone: 'red' | 'blue' | 'gray' | 'green'; emptyLabel: string; completed?: boolean }) {
  const toneClass = { red: 'fieldwork-task-group-red', blue: 'fieldwork-task-group-blue', gray: 'fieldwork-task-group-gray', green: 'fieldwork-task-group-green' }[tone]
  return <section className={`fieldwork-task-group ${toneClass}`}><header><div className="flex items-center gap-2">{tone === 'red' ? <Flame size={15} /> : tone === 'blue' ? <Clock3 size={15} /> : tone === 'green' ? <CheckCircle2 size={15} /> : <CalendarClock size={15} />}<h2>{title}</h2></div><span>{tasks.length}</span></header>{tasks.length === 0 ? <p className="fieldwork-task-empty">{emptyLabel}</p> : <div>{tasks.map((task) => <article key={task.id} className="fieldwork-task-row"><div className="fieldwork-task-check">{completed ? <CheckCircle2 size={16} /> : <span />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className={completed ? 'is-completed' : ''}>{task.title}</h3><span className={`fieldwork-task-priority ${priorityClasses[task.priority]}`}>{priorityLabels[task.priority]}</span></div><p>{task.lead?.name ? <Link href={`/dashboard/leads/${task.lead.id}`} className="fieldwork-task-lead">{task.lead.name}</Link> : 'Atividade interna'} · {completed ? `Concluída em ${task.completed_at ? formatDate(task.completed_at) : 'data não disponível'}` : `Prazo: ${formatDate(task.due_at)}`}</p>{task.description && <small>{task.description}</small>}</div>{!completed && <form action={completeTaskAction.bind(null, task.id)}><button type="submit" className="fieldwork-task-complete">Concluir</button></form>}<ArrowUpRight size={14} className="hidden shrink-0 text-[var(--ink-faint)] sm:block" /></article>)}</div>}</section>
}
