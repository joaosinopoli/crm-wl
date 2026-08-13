'use client'

// Fieldwork OS: a inbox é uma superfície de trabalho; a conversa, o lead e o próximo movimento vivem no mesmo contexto.
import { useEffect, useState, useTransition } from 'react'
import { CheckCheck, ChevronRight, MessageSquareText, Send, UserRound } from 'lucide-react'
import { getConversationMessages, sendConversationMessage, type ConversationMessage, type ConversationThread } from '@/src/app/actions/conversations'

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export default function ConversationsBoard({ threads, readOnly = false }: { threads: ConversationThread[]; readOnly?: boolean }) {
  const [selectedId, setSelectedId] = useState(threads[0]?.id || '')
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [, startTransition] = useTransition()
  const selected = threads.find((thread) => thread.id === selectedId) || null

  useEffect(() => {
    if (!selectedId) return
    startTransition(() => setLoading(true))
    getConversationMessages(selectedId).then(setMessages).finally(() => setLoading(false))
  }, [selectedId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    const form = new FormData(event.currentTarget)
    const result = await sendConversationMessage(form)
    if (result.success) {
      event.currentTarget.reset()
      setMessages((current) => [...current, { id: `local-${Date.now()}`, body: String(form.get('body')), sender_type: 'user', sender_id: null, created_at: new Date().toISOString() }])
    }
    setSending(false)
  }

  return <div className="fieldwork-inbox-grid">
    <aside className="fieldwork-inbox-list fieldwork-panel">
      <div className="fieldwork-inbox-list-head"><div><p className="fieldwork-page-kicker">Inbox de conversas</p><h2 className="text-xl font-black tracking-[-0.04em] text-[var(--ink)]">Fila de atendimento</h2></div><span className="fieldwork-count-badge">{threads.length}</span></div>
      <div className="fieldwork-inbox-filter"><span>Todos</span><span>Não lidos</span><span>Meus</span></div>
      <div className="fieldwork-thread-list">{threads.length ? threads.map((thread) => <button type="button" key={thread.id} onClick={() => setSelectedId(thread.id)} className={`fieldwork-thread ${selectedId === thread.id ? 'is-selected' : ''}`}><span className="fieldwork-thread-avatar">{(thread.lead?.name || '?').charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm text-[var(--ink)]">{thread.lead?.name || 'Contacto sem nome'}</strong><span className="mt-1 block truncate text-[11px] text-[var(--ink-soft)]">{thread.subject || 'Nova conversa'} · {thread.channel}</span></span><span className="fieldwork-thread-time">{formatTime(thread.last_message_at)}</span></button>) : <div className="fieldwork-empty-inbox"><MessageSquareText size={28} /><strong>A inbox começa aqui.</strong><span>Quando uma conversa for ligada a um lead, ela aparecerá nesta fila.</span></div>}</div>
    </aside>
    <section className="fieldwork-conversation fieldwork-panel">{selected ? <><header className="fieldwork-conversation-head"><div className="flex min-w-0 items-center gap-3"><span className="fieldwork-thread-avatar is-large">{selected.lead?.name.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="fieldwork-kicker">{selected.channel} / {selected.status}</p><h2 className="truncate text-xl font-black tracking-[-0.04em] text-[var(--ink)]">{selected.lead?.name}</h2><span className="truncate text-xs text-[var(--ink-soft)]">{selected.lead?.email || selected.lead?.phone || 'Sem contacto direto'}</span></div></div><div className="flex items-center gap-2"><button type="button" className="fieldwork-secondary-button"><UserRound size={14} /> Abrir lead</button><button type="button" className="fieldwork-secondary-button"><ChevronRight size={14} /> Próxima ação</button></div></header><div className="fieldwork-context-strip"><span><CheckCheck size={13} /> Ligado ao pipeline</span><span>Responsável: {selected.assignee?.full_name || 'Equipa'}</span><span>Canal: {selected.channel}</span></div><div className="fieldwork-message-list">{loading ? <div className="fieldwork-message-placeholder">A carregar histórico...</div> : messages.length ? messages.map((message) => <div key={message.id} className={`fieldwork-message ${message.sender_type === 'user' ? 'is-outgoing' : ''}`}><div>{message.body}</div><span>{formatTime(message.created_at)}</span></div>) : <div className="fieldwork-message-placeholder"><MessageSquareText size={24} /><span>Sem mensagens nesta conversa.</span></div>}</div><form onSubmit={handleSubmit} className="fieldwork-composer"><input type="hidden" name="threadId" value={selected.id} /><textarea name="body" rows={2} disabled={readOnly || sending} placeholder={readOnly ? 'O seu perfil pode apenas consultar a conversa.' : 'Escreva uma resposta ou nota interna...'} /><button type="submit" disabled={readOnly || sending} aria-label="Enviar mensagem"><Send size={16} />{sending ? 'A enviar' : 'Enviar'}</button></form></> : <div className="fieldwork-empty-conversation"><MessageSquareText size={34} /><h2>Selecione uma conversa</h2><p>A inbox reúne o contexto e a próxima decisão sem tirar a equipa do CRM.</p></div>}</section>
  </div>
}
