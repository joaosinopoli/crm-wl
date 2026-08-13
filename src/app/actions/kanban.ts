'use server'

import { createClient } from '@/src/utils/supabase/server'
import { getAuthContext, isAdmin, isSales } from '@/src/utils/auth'
import { revalidatePath } from 'next/cache'

export async function getKanbanData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { steps: [], leads: [], members: [], userRole: 'sales', customFields: [], currentUserId: '' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { steps: [], leads: [], members: [], userRole: 'sales', customFields: [], currentUserId: '' }

  const { data: steps } = await supabase
    .from('funnel_steps')
    .select('*')
    .order('position', { ascending: true })

  const { data: customFields } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('position', { ascending: true })

  let leadsQuery = supabase
    .from('leads')
    .select(`
      id, step_id, name, email, phone, assigned_to, custom_data, observation, lead_value, status, created_at,
      profiles:assigned_to (full_name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (profile.role === 'sales') {
    leadsQuery = leadsQuery.eq('assigned_to', user.id)
  }

  const { data: leads } = await leadsQuery

  let members: { id: string; full_name: string; role: string }[] = []
  if (profile.role === 'admin' && profile.company_id) {
    const { data: membersData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('company_id', profile.company_id)
    members = membersData || []
  }

  return { 
    steps: steps || [], 
    leads: leads || [], 
    members, 
    userRole: profile.role,
    customFields: customFields || [],
    currentUserId: user.id
  }
}

export async function getAllLeadsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { leads: [], members: [], steps: [], userRole: 'sales', customFields: [], currentUserId: '' }

  const { data: profile } = await supabase.from('profiles').select('role, company_id').eq('id', user.id).single()
  if (!profile) return { leads: [], members: [], steps: [], userRole: 'sales', customFields: [], currentUserId: '' }

  let query = supabase
    .from('leads')
    .select(`
      id, name, email, phone, step_id, assigned_to, custom_data, observation, lead_value, status, created_at,
      funnel_steps (id, title, color),
      profiles:assigned_to (full_name)
    `)
    .order('created_at', { ascending: false })

  if (profile.role === 'sales') {
    query = query.eq('assigned_to', user.id)
  }

  const { data: leads } = await query
  const { data: steps } = await supabase.from('funnel_steps').select('id, title').order('position', { ascending: true })
  const { data: customFields } = await supabase.from('custom_field_definitions').select('*').eq('company_id', profile.company_id).order('position', { ascending: true })

  let members: { id: string; full_name: string; role: string }[] = []
  if (profile.role === 'admin' && profile.company_id) {
    const { data: membersData } = await supabase.from('profiles').select('id, full_name, role').eq('company_id', profile.company_id)
    members = membersData || []
  }

  return { leads: leads || [], members, steps: steps || [], userRole: profile.role, customFields: customFields || [], currentUserId: user.id }
}

export async function updateLeadStep(leadId: string, newStepId: string) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }

  const { data: step } = await supabase
    .from('funnel_steps')
    .select('id')
    .eq('id', newStepId)
    .eq('company_id', profile.company_id)
    .maybeSingle()
  if (!step) return { success: false, error: 'Etapa inválida para esta empresa.' }

  let query = supabase
    .from('leads')
    .update({ step_id: newStepId })
    .eq('id', leadId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) query = query.eq('assigned_to', user.id)

  const { error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateLead(formData: FormData) {
  const leadId = formData.get('leadId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const stepId = formData.get('stepId') as string
  const assignedTo = formData.get('assignedTo') as string
  const observation = formData.get('observation') as string
  const leadValue = formData.get('leadValue') as string

  if (!leadId || !name || !stepId) return { success: false, error: 'ID, Nome e Etapa são obrigatórios.' }

  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }

  const { data: step } = await supabase
    .from('funnel_steps')
    .select('id')
    .eq('id', stepId)
    .eq('company_id', profile.company_id)
    .maybeSingle()
  if (!step) return { success: false, error: 'Etapa inválida para esta empresa.' }

  const customData: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('custom_')) customData[key.replace('custom_', '')] = String(value)
  })

  const updatePayload: Record<string, string | number | null | Record<string, string>> = {
    name, email: email || null, phone: phone || null, step_id: stepId,
    observation: observation || null, lead_value: Number(leadValue) || 0, custom_data: customData
  }

  if (isSales(profile.role)) {
    updatePayload.assigned_to = user.id
  } else if (assignedTo) {
    const { data: assignee } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', assignedTo)
      .eq('company_id', profile.company_id)
      .maybeSingle()
    if (!assignee) return { success: false, error: 'Responsável inválido para esta empresa.' }
    updatePayload.assigned_to = assignedTo
  }

  let updateQuery = supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', leadId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) updateQuery = updateQuery.eq('assigned_to', user.id)
  const { error } = await updateQuery
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const stepId = formData.get('stepId') as string
  const assignedToInput = formData.get('assignedTo') as string
  const observation = formData.get('observation') as string
  const leadValue = formData.get('leadValue') as string

  if (!name || !stepId || !phone) return { success: false, error: 'Nome, Telefone e Etapa são obrigatórios.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado.' }

  const { data: profile } = await supabase.from('profiles').select('role, company_id').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Perfil não encontrado.' }

  const { data: step } = await supabase
    .from('funnel_steps')
    .select('id')
    .eq('id', stepId)
    .eq('company_id', profile.company_id)
    .maybeSingle()
  if (!step) return { success: false, error: 'Etapa inválida para esta empresa.' }

  let assignedTo = null
  if (profile.role === 'sales') assignedTo = user.id
  else if (profile.role === 'admin') assignedTo = assignedToInput ? assignedToInput : user.id

  if (assignedTo) {
    const { data: assignee } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', assignedTo)
      .eq('company_id', profile.company_id)
      .maybeSingle()
    if (!assignee) return { success: false, error: 'Responsável inválido para esta empresa.' }
  }

  const customData: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('custom_')) customData[key.replace('custom_', '')] = String(value)
  })

  const { error: insertError } = await supabase.from('leads').insert({
    company_id: profile.company_id, step_id: stepId, name, email: email || null, phone: phone || null,
    assigned_to: assignedTo, observation: observation || null, lead_value: Number(leadValue) || 0, custom_data: customData
  })

  if (insertError) return { success: false, error: insertError.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/kanban')
  return { success: true }
}

export async function closeLead(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }

  const leadId = formData.get('leadId') as string
  const status = formData.get('status') as string
  const leadValue = formData.get('leadValue') as string
  const observation = formData.get('observation') as string

  if (!leadId || !status) return { success: false, error: 'Dados incompletos.' }
  if (status !== 'won' && status !== 'lost' && status !== 'open') {
    return { success: false, error: 'Estado de lead inválido.' }
  }

  const updatePayload: Record<string, string | number | null> = {
    status: status,
    closed_at: new Date().toISOString()
  }

  if (status === 'won') {
    updatePayload.lead_value = Number(leadValue) || 0
  }
  if (observation) {
    updatePayload.observation = observation
  }

  let closeQuery = supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', leadId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) closeQuery = closeQuery.eq('assigned_to', user.id)
  const { error } = await closeQuery

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/arquivados')
  return { success: true }
}

export async function createFunnelStep(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  const title = formData.get('title') as string
  const color = (formData.get('color') as string) || 'bg-gray-100'

  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem alterar o funil.' }
  if (!title?.trim()) return { success: false, error: 'O título da etapa é obrigatório.' }

  const { count } = await supabase
    .from('funnel_steps')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.company_id)
  const nextPosition = count ?? 0

  const { error } = await supabase.from('funnel_steps').insert({
    company_id: profile.company_id,
    title: title.trim(),
    color,
    position: nextPosition,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updateFunnelStep(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  const stepId = formData.get('stepId') as string
  const title = formData.get('title') as string
  const color = formData.get('color') as string
  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem alterar o funil.' }
  if (!stepId || !title?.trim()) return { success: false, error: 'Título e etapa são obrigatórios.' }

  const { error } = await supabase
    .from('funnel_steps')
    .update({ title: title.trim(), color })
    .eq('id', stepId)
    .eq('company_id', profile.company_id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function reorderFunnelStep(stepId: string, direction: 'up' | 'down') {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem alterar o funil.' }
  if (direction !== 'up' && direction !== 'down') return { success: false, error: 'Direção inválida.' }

  const { data: steps } = await supabase
    .from('funnel_steps')
    .select('id, position')
    .eq('company_id', profile.company_id)
    .order('position', { ascending: true })
  if (!steps) return { success: false, error: 'Não foi possível carregar as etapas.' }

  const currentIndex = steps.findIndex(s => s.id === stepId)
  if (currentIndex === -1) return { success: false, error: 'Etapa não encontrada.' }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= steps.length) return { success: true }

  const currentStep = steps[currentIndex]
  const targetStep = steps[targetIndex]
  const firstUpdate = await supabase
    .from('funnel_steps')
    .update({ position: targetStep.position })
    .eq('id', currentStep.id)
    .eq('company_id', profile.company_id)
  if (firstUpdate.error) return { success: false, error: firstUpdate.error.message }

  const secondUpdate = await supabase
    .from('funnel_steps')
    .update({ position: currentStep.position })
    .eq('id', targetStep.id)
    .eq('company_id', profile.company_id)
  if (secondUpdate.error) return { success: false, error: secondUpdate.error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function createCustomField(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  const label = formData.get('fieldLabel') as string
  const type = (formData.get('fieldType') as string) || 'text'
  const allowedTypes = new Set(['text', 'number', 'money', 'date'])

  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem criar campos.' }
  if (!label?.trim()) return { success: false, error: 'O nome do campo é obrigatório.' }
  if (!allowedTypes.has(type)) return { success: false, error: 'Tipo de campo inválido.' }

  const key = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
  const { count } = await supabase
    .from('custom_field_definitions')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', profile.company_id)
  const { error } = await supabase.from('custom_field_definitions').insert({
    company_id: profile.company_id,
    field_key: key,
    field_label: label.trim(),
    field_type: type,
    position: count ?? 0,
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/form-builder')
  return { success: true }
}

export async function deleteCustomField(fieldId: string) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem apagar campos.' }

  const { error } = await supabase
    .from('custom_field_definitions')
    .delete()
    .eq('id', fieldId)
    .eq('company_id', profile.company_id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/form-builder')
  return { success: true }
}

export async function updateCustomFieldsOrder(fieldIds: string[]) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !isAdmin(profile.role)) return { success: false, error: 'Apenas administradores podem reordenar campos.' }

  for (let i = 0; i < fieldIds.length; i++) {
    const { error } = await supabase
      .from('custom_field_definitions')
      .update({ position: i })
      .eq('id', fieldIds[i])
      .eq('company_id', profile.company_id)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/form-builder')
  return { success: true }
}

export async function addQuickNote(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }
  const leadId = formData.get('leadId') as string
  const observation = formData.get('observation') as string
  const scheduleDate = formData.get('scheduleDate') as string
  const scheduleTime = formData.get('scheduleTime') as string
  if (!leadId) return { success: false, error: 'Lead obrigatório.' }

  let leadQuery = supabase
    .from('leads')
    .update({ observation: observation || null })
    .eq('id', leadId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) leadQuery = leadQuery.eq('assigned_to', user.id)
  const { error: leadError } = await leadQuery
  if (leadError) return { success: false, error: leadError.message }

  if (scheduleDate && scheduleTime) {
    const { error: appointmentError } = await supabase.from('appointments').insert({
      company_id: profile.company_id,
      user_id: user.id,
      lead_id: leadId,
      title: `Retorno/Nota: ${(observation || 'Follow-up agendado').slice(0, 30)}...`,
      appointment_date: scheduleDate,
      appointment_time: scheduleTime,
    })
    if (appointmentError) return { success: false, error: appointmentError.message }
  }
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard/agenda')
  return { success: true }
}

export async function getArchivedLeads(search?: string, statusFilter?: string, dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase.from('profiles').select('role, company_id').eq('id', user.id).single()
  if (!profile) return []

  let query = supabase
    .from('leads')
    .select(`
      id, name, email, phone, status, lead_value, observation, custom_data, closed_at, assigned_to,
      profiles:assigned_to (full_name)
    `)
    .neq('status', 'open') 
    .eq('company_id', profile.company_id)
    .order('closed_at', { ascending: false })

  if (profile.role === 'sales') {
    query = query.eq('assigned_to', user.id)
  }

  if (search) query = query.ilike('name', `%${search}%`)
  if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (dateFrom) query = query.gte('closed_at', `${dateFrom}T00:00:00.000Z`)
  if (dateTo) query = query.lte('closed_at', `${dateTo}T23:59:59.999Z`)

  const { data: leads } = await query
  return leads || []
}

// NOVA FUNÇÃO: Atualizar Arquivado
export async function updateArchivedLead(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }

  const leadId = formData.get('leadId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const status = formData.get('status') as string
  const assignedTo = formData.get('assignedTo') as string
  const observation = formData.get('observation') as string
  const leadValue = formData.get('leadValue') as string

  if (!leadId || !name || !status) return { success: false, error: 'Campos obrigatórios faltando.' }
  if (status !== 'won' && status !== 'lost' && status !== 'open') {
    return { success: false, error: 'Estado de lead inválido.' }
  }

  const customData: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (key.startsWith('custom_')) customData[key.replace('custom_', '')] = String(value)
  })

  const updatePayload: Record<string, string | number | null | Record<string, string>> = {
    name, email: email || null, phone: phone || null, status,
    observation: observation || null, custom_data: customData
  }

  if (status === 'won') {
    updatePayload.lead_value = Number(leadValue) || 0
  } else if (status === 'open') {
    updatePayload.lead_value = 0
    updatePayload.closed_at = null // Se reabrir, removemos a data de fechamento
  } else {
    updatePayload.lead_value = 0 // Se perdido, zera o valor
  }

  if (isSales(profile.role)) {
    updatePayload.assigned_to = user.id
  } else if (assignedTo) {
    const { data: assignee } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', assignedTo)
      .eq('company_id', profile.company_id)
      .maybeSingle()
    if (!assignee) return { success: false, error: 'Responsável inválido para esta empresa.' }
    updatePayload.assigned_to = assignedTo
  }

  let updateQuery = supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', leadId)
    .eq('company_id', profile.company_id)
  if (isSales(profile.role)) updateQuery = updateQuery.eq('assigned_to', user.id)
  const { error } = await updateQuery
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/arquivados')
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard')
  return { success: true }
}