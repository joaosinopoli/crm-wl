'use server'

import { createClient } from '@/src/utils/supabase/server'

export async function getDashboardMetrics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Busca todos os leads da empresa
  let query = supabase
    .from('leads')
    .select('id, status, lead_value, assigned_to')
    .eq('company_id', profile.company_id)

  // Vendedor só vê as métricas dele. Admin vê da empresa toda.
  if (profile.role === 'sales') {
    query = query.eq('assigned_to', user.id)
  }

  const { data: leads, error } = await query
  if (error || !leads) return null

  let totalWon = 0
  let totalPipeline = 0
  let wonCount = 0
  let lostCount = 0
  let openCount = 0

  leads.forEach(lead => {
    const value = Number(lead.lead_value) || 0

    if (lead.status === 'won') {
      totalWon += value
      wonCount++
    } else if (lead.status === 'lost') {
      lostCount++
    } else {
      totalPipeline += value
      openCount++
    }
  })

  const totalClosed = wonCount + lostCount
  const conversionRate = totalClosed > 0 ? ((wonCount / totalClosed) * 100).toFixed(1) : '0.0'

  return {
    totalWon,
    totalPipeline,
    wonCount,
    lostCount,
    openCount,
    conversionRate
  }
}

type ReportLead = {
  status: string | null
  lead_value: number | string | null
  step_id: string | null
  assigned_to: string | null
  funnel_steps?: { title: string; color: string | null } | { title: string; color: string | null }[] | null
}

type ReportTask = {
  status: string
  due_at: string | null
}

export async function getReportsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  let leadsQuery = supabase
    .from('leads')
    .select('status, lead_value, step_id, assigned_to, funnel_steps(title, color)')
    .eq('company_id', profile.company_id)

  if (profile.role === 'sales') leadsQuery = leadsQuery.eq('assigned_to', user.id)

  const [{ data: leadData, error: leadsError }, { data: taskData, error: tasksError }] = await Promise.all([
    leadsQuery,
    supabase.from('tasks').select('status, due_at').eq('company_id', profile.company_id),
  ])

  if (leadsError) return null

  const leads = (leadData || []) as ReportLead[]
  const tasks = tasksError ? [] : (taskData || []) as ReportTask[]
  const stepMap = new Map<string, { title: string; color: string; count: number; value: number }>()

  leads.forEach((lead) => {
    const relation = Array.isArray(lead.funnel_steps) ? lead.funnel_steps[0] : lead.funnel_steps
    const key = lead.step_id || 'unassigned'
    const current = stepMap.get(key) || { title: relation?.title || 'Sem etapa', color: relation?.color || '#94a3b8', count: 0, value: 0 }
    current.count += 1
    current.value += Number(lead.lead_value) || 0
    stepMap.set(key, current)
  })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const overdueTasks = tasks.filter((task) => task.status === 'pending' && task.due_at && new Date(task.due_at) < startOfToday).length
  const completedTasks = tasks.filter((task) => task.status === 'completed').length
  const openTasks = tasks.filter((task) => task.status === 'pending').length

  return {
    leadsByStep: Array.from(stepMap.values()).sort((a, b) => b.value - a.value),
    totalLeads: leads.length,
    totalPipeline: leads.filter((lead) => lead.status !== 'won' && lead.status !== 'lost').reduce((sum, lead) => sum + (Number(lead.lead_value) || 0), 0),
    totalWon: leads.filter((lead) => lead.status === 'won').reduce((sum, lead) => sum + (Number(lead.lead_value) || 0), 0),
    wonCount: leads.filter((lead) => lead.status === 'won').length,
    lostCount: leads.filter((lead) => lead.status === 'lost').length,
    totalTasks: tasks.length,
    openTasks,
    completedTasks,
    overdueTasks,
  }
}
