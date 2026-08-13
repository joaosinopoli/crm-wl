import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAppointments } from '@/src/app/actions/agenda'
import { getAllLeadsData } from '@/src/app/actions/kanban'
import CalendarAgenda from '@/src/components/CalendarAgenda'
import type { Appointment, Lead } from '@/src/types/crm'

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Busca os compromissos do usuário logado (filtro automático via Server Action)
  const appointments = await getAppointments()
  
  // Busca a lista de leads do usuário para preencher o select no formulário
  const { leads } = await getAllLeadsData()

  return (
    <div className="mx-auto w-full max-w-[1480px]"><div className="fieldwork-page-intro"><div><p className="fieldwork-page-kicker">04 / Ritmo e compromissos</p><h1 className="fieldwork-page-title">O próximo passo<br /><em className="not-italic text-[var(--brand-primary)]">tem hora marcada.</em></h1><p className="fieldwork-page-copy">Reuniões, ligações e visitas ligadas ao contexto certo para a equipa saber o que acontece a seguir.</p></div></div>

      <CalendarAgenda appointments={appointments as Appointment[]} leads={(leads || []) as Lead[]} /></div>
  )
}
