import { getAuthContext } from '@/src/utils/auth'
import { getConversations } from '@/src/app/actions/conversations'
import ConversationsBoard from '@/src/components/ConversationsBoard'

// Fieldwork OS: conversas são um módulo operacional ligado ao lead, não uma página isolada de chat.
export default async function ConversationsPage() {
  const { profile } = await getAuthContext()
  const threads = await getConversations()
  return <div className="mx-auto w-full max-w-[1480px]"><div className="fieldwork-page-intro"><div><p className="fieldwork-page-kicker">02 / Atendimento e relacionamento</p><h1 className="fieldwork-page-title">Conversas que movem negócios.</h1><p className="fieldwork-page-copy">Centralize o contexto da conversa, o responsável e o próximo movimento do lead numa única superfície de trabalho.</p></div><div className="fieldwork-page-stamp"><span>STATUS</span><strong>Inbox {threads.length ? 'ativa' : 'pronta'}</strong><small>Sem dados fictícios</small></div></div><ConversationsBoard threads={threads} readOnly={profile?.role === 'viewer'} /></div>
}
