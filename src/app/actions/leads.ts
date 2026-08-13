'use server'

import { getAuthContext, isSales } from '@/src/utils/auth'

export async function getLeadWorkspace(leadId: string) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile || !leadId) return null

  let leadQuery = supabase.from('leads').select('id, name, email, phone, lead_value, observation, status, created_at, updated_at, step_id, assigned_to, custom_data, owner:assigned_to(full_name), step:funnel_steps(title, color)').eq('id', leadId).eq('company_id', profile.company_id)
  if (isSales(profile.role)) leadQuery = leadQuery.eq('assigned_to', user.id)
  const { data: lead, error } = await leadQuery.maybeSingle()
  if (error || !lead) return null

  const [{ data: tasks }, { data: appointments }] = await Promise.all([
    supabase.from('tasks').select('id, title, description, due_at, priority, status, completed_at').eq('company_id', profile.company_id).eq('lead_id', leadId).order('due_at', { ascending: true }),
    supabase.from('appointments').select('id, title, appointment_date, appointment_time').eq('company_id', profile.company_id).eq('lead_id', leadId).order('appointment_date', { ascending: true }).order('appointment_time', { ascending: true }),
  ])

  return { lead, tasks: tasks || [], appointments: appointments || [] }
}
