'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext, isReadOnly, isSales } from '@/src/utils/auth'
import type { TaskFormResult, TaskPriority, TaskStatus } from '@/src/types/crm'

const allowedPriorities = new Set<TaskPriority>(['low', 'medium', 'high'])

function isValidDate(value: string) {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime())
}

export async function getTasks(status: TaskStatus | 'all' = 'pending') {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return []

  let query = supabase
    .from('tasks')
    .select(`
      id, company_id, lead_id, assigned_to, created_by, title, description,
      due_at, priority, status, completed_at, created_at, updated_at,
      lead:lead_id (id, name),
      assignee:assigned_to (full_name)
    `)
    .eq('company_id', profile.company_id)
    .order('due_at', { ascending: true })

  if (status !== 'all') query = query.eq('status', status)
  if (isSales(profile.role)) query = query.eq('assigned_to', user.id)

  const { data, error } = await query
  if (error) {
    console.error('Erro ao carregar tarefas:', error.message)
    return []
  }

  return data || []
}

export async function createTask(formData: FormData): Promise<TaskFormResult> {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }
  if (isReadOnly(profile.role)) return { success: false, error: 'O seu perfil tem acesso apenas de leitura.' }

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const dueAt = String(formData.get('dueAt') || '')
  const priority = String(formData.get('priority') || 'medium') as TaskPriority
  const leadId = String(formData.get('leadId') || '').trim() || null
  const assignedToInput = String(formData.get('assignedTo') || '').trim()

  if (title.length < 2) return { success: false, error: 'Descreva a tarefa com pelo menos 2 caracteres.' }
  if (!isValidDate(dueAt)) return { success: false, error: 'Informe uma data e hora válidas.' }
  if (!allowedPriorities.has(priority)) return { success: false, error: 'Prioridade inválida.' }

  const assignedTo = isSales(profile.role) ? user.id : (assignedToInput || user.id)
  const { data: assignee } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', assignedTo)
    .eq('company_id', profile.company_id)
    .maybeSingle()
  if (!assignee) return { success: false, error: 'Responsável inválido para esta empresa.' }

  if (leadId) {
    let leadQuery = supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('company_id', profile.company_id)
    if (isSales(profile.role)) leadQuery = leadQuery.eq('assigned_to', user.id)
    const { data: lead } = await leadQuery.maybeSingle()
    if (!lead) return { success: false, error: 'Lead inválido ou sem acesso.' }
  }

  const { error } = await supabase.from('tasks').insert({
    company_id: profile.company_id,
    lead_id: leadId,
    assigned_to: assignedTo,
    created_by: user.id,
    title,
    description: description || null,
    due_at: new Date(dueAt).toISOString(),
    priority,
    status: 'pending',
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: Exclude<TaskStatus, 'cancelled'>): Promise<TaskFormResult> {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }
  if (isReadOnly(profile.role)) return { success: false, error: 'O seu perfil tem acesso apenas de leitura.' }
  if (status !== 'pending' && status !== 'completed') return { success: false, error: 'Estado inválido.' }

  let query = supabase
    .from('tasks')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) query = query.eq('assigned_to', user.id)

  const { error } = await query
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}
