'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/src/utils/auth'

export type AutomationRule = {
  id: string
  name: string
  trigger_event: string
  action_type: string
  action_config: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export async function getAutomationRules(): Promise<AutomationRule[]> {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !['owner', 'admin'].includes(profile.role)) return []
  const { data, error } = await supabase.from('automation_rules').select('id, name, trigger_event, action_type, action_config, is_active, created_at').eq('company_id', profile.company_id).order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as AutomationRule[]
}

export async function createAutomationRule(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !['owner', 'admin'].includes(profile.role)) return { success: false, error: 'Apenas owners e administradores podem criar automações.' }
  const name = String(formData.get('name') || '').trim()
  const triggerEvent = String(formData.get('triggerEvent') || '')
  const actionType = String(formData.get('actionType') || '')
  const actionValue = String(formData.get('actionValue') || '').trim()
  if (name.length < 2) return { success: false, error: 'Dê um nome à automação.' }
  if (!['lead_created', 'lead_stage_changed', 'task_overdue', 'conversation_received'].includes(triggerEvent)) return { success: false, error: 'Gatilho inválido.' }
  if (!['create_task', 'assign_owner', 'send_notification'].includes(actionType)) return { success: false, error: 'Ação inválida.' }
  const { error } = await supabase.from('automation_rules').insert({ company_id: profile.company_id, name, trigger_event: triggerEvent, action_type: actionType, action_config: { value: actionValue }, created_by: user.id })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/automacoes')
  return { success: true }
}

export async function toggleAutomationRule(ruleId: string, isActive: boolean) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !['owner', 'admin'].includes(profile.role)) return { success: false, error: 'Não autorizado.' }
  const { error } = await supabase.from('automation_rules').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', ruleId).eq('company_id', profile.company_id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/automacoes')
  return { success: true }
}
