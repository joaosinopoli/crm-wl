import { NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'

export const dynamic = 'force-dynamic'

function csvCell(value: unknown) {
  const normalized = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Não autorizado', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile?.company_id) return new NextResponse('Workspace não encontrado', { status: 403 })

  let query = supabase
    .from('leads')
    .select('name, email, phone, status, lead_value, created_at, assigned_to, custom_data')
    .eq('company_id', profile.company_id)
    .not('status', 'in', '(won,lost)')
    .order('created_at', { ascending: false })

  if (profile.role === 'sales') query = query.eq('assigned_to', user.id)

  const { data, error } = await query
  if (error) return new NextResponse('Não foi possível exportar os leads', { status: 500 })

  const header = ['Nome', 'E-mail', 'Telefone', 'Estado', 'Valor', 'Criado em', 'Dados personalizados']
  const rows = (data || []).map((lead) => [lead.name, lead.email, lead.phone, lead.status, lead.lead_value, lead.created_at, lead.custom_data].map(csvCell).join(','))
  const csv = `\uFEFF${header.map(csvCell).join(',')}\n${rows.join('\n')}`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
