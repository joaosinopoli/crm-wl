'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext, isReadOnly } from '@/src/utils/auth'

const knownColumns = new Set(['name', 'nome', 'email', 'e-mail', 'phone', 'telefone', 'lead_value', 'valor', 'observation', 'observacao'])

function parseCsvLine(line: string) {
  const cells: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && line[index + 1] === '"' && quoted) {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += character
    }
  }
  cells.push(cell.trim())
  return cells
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function importLeads(formData: FormData) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return { success: false, error: 'Não autorizado.' }
  if (isReadOnly(profile.role)) return { success: false, error: 'O seu perfil tem acesso apenas de leitura.' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { success: false, error: 'Selecione um ficheiro CSV.' }
  if (file.size > 2 * 1024 * 1024) return { success: false, error: 'O ficheiro não pode ultrapassar 2 MB.' }

  const lines = (await file.text()).replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return { success: false, error: 'O CSV precisa de uma linha de cabeçalho e pelo menos um contacto.' }
  if (lines.length > 501) return { success: false, error: 'Importe no máximo 500 leads por ficheiro.' }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const nameIndex = headers.findIndex((header) => header === 'name' || header === 'nome')
  const phoneIndex = headers.findIndex((header) => header === 'phone' || header === 'telefone')
  const emailIndex = headers.findIndex((header) => header === 'email' || header === 'e-mail')
  if (nameIndex < 0 || (phoneIndex < 0 && emailIndex < 0)) return { success: false, error: 'O cabeçalho precisa de Nome e Telefone ou E-mail.' }

  const { data: step } = await supabase.from('funnel_steps').select('id').eq('company_id', profile.company_id).order('position', { ascending: true }).limit(1).maybeSingle()
  if (!step) return { success: false, error: 'Crie pelo menos uma etapa no funil antes de importar.' }

  const { data: existing } = await supabase.from('leads').select('email, phone').eq('company_id', profile.company_id)
  const existingEmails = new Set((existing || []).map((lead) => String(lead.email || '').trim().toLowerCase()).filter(Boolean))
  const existingPhones = new Set((existing || []).map((lead) => String(lead.phone || '').replace(/\D/g, '')).filter(Boolean))
  const seenEmails = new Set<string>()
  const seenPhones = new Set<string>()
  const rows: Array<Record<string, unknown>> = []
  let skipped = 0

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line)
    const name = cells[nameIndex]?.trim()
    const email = emailIndex >= 0 ? cells[emailIndex]?.trim().toLowerCase() : ''
    const phone = phoneIndex >= 0 ? cells[phoneIndex]?.trim() : ''
    const normalizedPhone = phone.replace(/\D/g, '')
    if (!name || (!email && !normalizedPhone) || (email && (existingEmails.has(email) || seenEmails.has(email))) || (normalizedPhone && (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)))) {
      skipped += 1
      continue
    }
    if (email) seenEmails.add(email)
    if (normalizedPhone) seenPhones.add(normalizedPhone)

    const customData: Record<string, string> = {}
    headers.forEach((header, index) => {
      if (header && !knownColumns.has(header) && cells[index]) customData[header] = cells[index]
    })
    rows.push({
      company_id: profile.company_id,
      step_id: step.id,
      name,
      email: email || null,
      phone: phone || null,
      assigned_to: user.id,
      observation: cells[headers.findIndex((header) => header === 'observation' || header === 'observacao')] || null,
      lead_value: Number(cells[headers.findIndex((header) => header === 'lead_value' || header === 'valor')]) || 0,
      custom_data: customData,
    })
  }

  if (!rows.length) return { success: false, error: `Nenhum lead novo para importar. ${skipped} linha(s) foram ignoradas por duplicidade ou dados incompletos.` }
  const { error } = await supabase.from('leads').insert(rows)
  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/kanban')
  revalidatePath('/dashboard')
  return { success: true, imported: rows.length, skipped }
}
