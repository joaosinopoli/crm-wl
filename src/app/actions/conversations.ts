'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext, isReadOnly, isSales } from '@/src/utils/auth'

export type ConversationThread = {
  id: string
  subject: string | null
  channel: string
  status: string
  last_message_at: string
  lead: { id: string; name: string; email: string | null; phone: string | null } | null
  assignee: { full_name: string | null } | null
}

export type ConversationMessage = {
  id: string
  body: string
  sender_type: string
  sender_id: string | null
  created_at: string
}

async function getThreadAccess(threadId: string) {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return null
  let query = supabase.from('conversation_threads').select('id, assigned_to, lead_id').eq('id', threadId).eq('company_id', profile.company_id)
  if (isSales(profile.role)) query = query.eq('assigned_to', user.id)
  const { data: thread } = await query.maybeSingle()
  return thread ? { supabase, user, profile, thread } : null
}

export async function getConversations(): Promise<ConversationThread[]> {
  const { supabase, user, profile } = await getAuthContext()
  if (!user || !profile) return []
  let query = supabase.from('conversation_threads').select('id, subject, channel, status, last_message_at, lead:lead_id(id, name, email, phone), assignee:assigned_to(full_name)').eq('company_id', profile.company_id).order('last_message_at', { ascending: false })
  if (isSales(profile.role)) query = query.eq('assigned_to', user.id)
  const { data, error } = await query
  if (error) return []
  return (data || []) as unknown as ConversationThread[]
}

export async function getConversationMessages(threadId: string): Promise<ConversationMessage[]> {
  const access = await getThreadAccess(threadId)
  if (!access) return []
  const { data, error } = await access.supabase.from('conversation_messages').select('id, body, sender_type, sender_id, created_at').eq('thread_id', threadId).eq('company_id', access.profile.company_id).order('created_at', { ascending: true })
  if (error) return []
  return (data || []) as ConversationMessage[]
}

export async function sendConversationMessage(formData: FormData) {
  const threadId = String(formData.get('threadId') || '')
  const body = String(formData.get('body') || '').trim()
  if (!threadId || body.length < 1) return { success: false, error: 'Escreva uma mensagem antes de enviar.' }
  const access = await getThreadAccess(threadId)
  if (!access) return { success: false, error: 'Conversa não encontrada ou sem acesso.' }
  if (isReadOnly(access.profile.role)) return { success: false, error: 'O seu perfil tem acesso apenas de leitura.' }
  const { error } = await access.supabase.from('conversation_messages').insert({ company_id: access.profile.company_id, thread_id: threadId, sender_id: access.user.id, sender_type: 'user', body })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/conversas')
  return { success: true }
}
