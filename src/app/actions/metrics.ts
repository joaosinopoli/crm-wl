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