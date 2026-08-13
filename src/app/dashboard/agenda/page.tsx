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
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agenda de Compromissos</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas reuniões, ligações e visitas visualmente.</p>
      </div>

      <CalendarAgenda appointments={appointments as Appointment[]} leads={(leads || []) as Lead[]} />
    </div>
  )
}