'use server'

import { createClient } from '@/src/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppointments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  let query = supabase
    .from('appointments')
    .select(`
      id, title, appointment_date, appointment_time, lead_id,
      leads (name),
      profiles (full_name)
    `)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  // Se for vendedor, vê só a agenda dele. Se for admin, vê de todos.
  if (profile.role === 'sales') {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query
  if (error) console.error(error)
  return data || []
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado' }

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
  if (!profile) return { success: false, error: 'Perfil não encontrado' }

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const leadId = formData.get('leadId') as string

  if (!title || !date || !time) return { success: false, error: 'Preencha título, data e hora.' }

  const { error } = await supabase.from('appointments').insert({
    company_id: profile.company_id,
    user_id: user.id,
    lead_id: leadId || null,
    title,
    appointment_date: date,
    appointment_time: time
  })

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/dashboard/agenda')
  return { success: true }
}