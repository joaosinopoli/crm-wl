import Link from 'next/link'
import { createTask, getTasks, updateTaskStatus } from '@/src/app/actions/tasks'
import { getAllLeadsData } from '@/src/app/actions/kanban'
import type { Task } from '@/src/types/crm'

async function createTaskAction(formData: FormData) {
  'use server'
  await createTask(formData)
}

async function completeTaskAction(taskId: string) {
  'use server'
  await updateTaskStatus(taskId, 'completed')
}

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
} as const

const priorityClasses = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
} as const

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export default async function TasksPage() {
  const [tasksData, leadsData] = await Promise.all([
    getTasks('all'),
    getAllLeadsData(),
  ])
  const tasks = tasksData.map(task => ({
    ...task,
    lead: Array.isArray(task.lead) ? task.lead[0] ?? null : task.lead,
    assignee: Array.isArray(task.assignee) ? task.assignee[0] ?? null : task.assignee,
  })) as unknown as Task[]
  const today = startOfToday()
  const pending = tasks.filter(task => task.status === 'pending')
  const overdue = pending.filter(task => new Date(task.due_at).getTime() < today)
  const todayTasks = pending.filter(task => {
    const due = new Date(task.due_at)
    return due.getTime() >= today && due.toDateString() === new Date().toDateString()
  })
  const upcoming = pending.filter(task => !overdue.includes(task) && !todayTasks.includes(task))
  const completed = tasks.filter(task => task.status === 'completed').slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
            <Link href="/dashboard" className="hover:underline">Visão Geral</Link>
            <span>/</span>
            <span className="text-gray-500">Tarefas</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900">Tarefas e follow-ups</h2>
          <p className="text-sm text-gray-500 mt-1">Transforme cada negociação numa próxima ação clara e nunca deixe um retorno passar.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-gray-900">{pending.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Pendentes</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-red-700">{overdue.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">Atrasadas</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="text-2xl font-black text-green-700">{completed.length}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">Concluídas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 xl:sticky xl:top-6">
          <h3 className="text-lg font-bold text-gray-900">Nova tarefa</h3>
          <p className="text-xs text-gray-500 mt-1 mb-5">Agende a próxima ação de um lead ou uma atividade interna.</p>
          <form action={createTaskAction} className="space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Título</label>
              <input id="task-title" name="title" required minLength={2} maxLength={160} placeholder="Ex.: Ligar para confirmar proposta" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="task-lead" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Lead relacionado</label>
              <select id="task-lead" name="leadId" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tarefa interna / sem lead</option>
                {leadsData.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>{lead.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-due" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Prazo</label>
                <input id="task-due" name="dueAt" type="datetime-local" required className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="task-priority" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Prioridade</label>
                <select id="task-priority" name="priority" defaultValue="medium" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
            {leadsData.userRole === 'admin' && (
              <div>
                <label htmlFor="task-assignee" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Responsável</label>
                <select id="task-assignee" name="assignedTo" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Atribuir a mim</option>
                  {leadsData.members.map((member) => (
                    <option key={member.id} value={member.id}>{member.full_name || 'Sem nome'}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="task-description" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Notas</label>
              <textarea id="task-description" name="description" rows={3} maxLength={1000} placeholder="Contexto para executar esta tarefa..." className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">Criar tarefa</button>
          </form>
        </section>

        <section className="space-y-5">
          <TaskGroup title="Atrasadas" tasks={overdue} tone="red" emptyLabel="Nenhuma tarefa atrasada. Excelente trabalho." />
          <TaskGroup title="Para hoje" tasks={todayTasks} tone="blue" emptyLabel="Não há tarefas para hoje." />
          <TaskGroup title="Próximas" tasks={upcoming} tone="gray" emptyLabel="Não há tarefas futuras." />
          <TaskGroup title="Concluídas recentemente" tasks={completed} tone="green" emptyLabel="Ainda não há tarefas concluídas." completed />
        </section>
      </div>
    </div>
  )
}

function TaskGroup({ title, tasks, tone, emptyLabel, completed = false }: { title: string; tasks: Task[]; tone: 'red' | 'blue' | 'gray' | 'green'; emptyLabel: string; completed?: boolean }) {
  const headingClasses = {
    red: 'text-red-700',
    blue: 'text-blue-700',
    gray: 'text-gray-700',
    green: 'text-green-700',
  } as const

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className={`font-bold ${headingClasses[tone]}`}>{title}</h3>
        <span className="text-xs font-bold text-gray-400">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-400">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {tasks.map(task => (
            <article key={task.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${priorityClasses[task.priority]}`}>{priorityLabels[task.priority]}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {task.lead?.name ? `Lead: ${task.lead.name} · ` : ''}
                  {completed ? `Concluída em ${task.completed_at ? formatDate(task.completed_at) : 'data não disponível'}` : `Prazo: ${formatDate(task.due_at)}`}
                </p>
                {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
              </div>
              {!completed && (
                <form action={completeTaskAction.bind(null, task.id)}>
                  <button type="submit" className="shrink-0 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">Concluir</button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
