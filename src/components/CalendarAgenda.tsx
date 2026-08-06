'use client'

import { useState } from 'react'
import { createAppointment } from '@/src/app/actions/agenda'

type Appointment = {
  id: string
  title: string
  appointment_date: string
  appointment_time: string
  lead_id?: string
  leads?: { name: string }
  profiles?: { full_name: string } | { full_name: string }[]
}

type Lead = {
  id: string
  name: string
}

export default function CalendarAgenda({ appointments, leads }: { appointments: Appointment[], leads: Lead[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Lógica de navegação do calendário
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Verifica se o dia renderizado é hoje
  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // Função para lidar com o envio do formulário
  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    const response = await createAppointment(formData)
    setLoading(false)

    if (response.success) {
      window.location.reload() // Atualiza para puxar o novo dado
    } else {
      setErrorMsg(response.error || 'Erro ao criar compromisso.')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full flex-1">
      
      {/* LADO ESQUERDO: Formulário para Adicionar Compromisso */}
      <div className="xl:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Marcar Compromisso</h3>
        
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Compromisso *</label>
            <input 
              name="title" 
              type="text" 
              required 
              placeholder="Ex: Reunião de Fechamento" 
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data *</label>
              <input 
                name="date" 
                type="date" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora *</label>
              <input 
                name="time" 
                type="time" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vincular Cliente (Opcional)</label>
            <select 
              name="leadId" 
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              <option value="">Nenhum cliente (Avulso)</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.name}</option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100 mt-2">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-4"
          >
            {loading ? 'Salvando...' : 'Adicionar à Agenda'}
          </button>
        </form>
      </div>

      {/* LADO DIREITO: Visão do Calendário */}
      <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col min-h-[600px]">
        
        {/* Cabeçalho do Calendário (Navegação) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-gray-900 capitalize">
              {monthNames[month]} {year}
            </h3>
            <button 
              onClick={goToday}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hoje
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              title="Mês Anterior"
            >
              ◀
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              title="Próximo Mês"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Grade do Calendário */}
        <div className="flex-1 bg-gray-200 border border-gray-200 rounded-xl overflow-hidden grid grid-cols-7 gap-px">
          {/* Cabeçalho dos Dias da Semana */}
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}

          {/* Espaços vazios antes do dia 1 */}
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="bg-gray-50/50 min-h-[120px] p-2"></div>
          ))}

          {/* Dias do Mês Corrente */}
          {days.map(day => {
            // Formata a data atual do loop no padrão do banco (YYYY-MM-DD)
            const paddedMonth = String(month + 1).padStart(2, '0')
            const paddedDay = String(day).padStart(2, '0')
            const dateStr = `${year}-${paddedMonth}-${paddedDay}`

            // Filtra os compromissos para o dia atual do loop
            const dayAppointments = appointments.filter(a => a.appointment_date === dateStr)

            return (
              <div 
                key={day} 
                className={`min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-blue-50/30 ${
                  isToday(day) ? 'bg-blue-50/20' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day) ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                </div>
                
                {/* Lista os compromissos dentro da célula do dia */}
                <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {dayAppointments.map(appt => {
                    const timeStr = appt.appointment_time.slice(0, 5) // "14:30"
                    
                    return (
                      <div 
                        key={appt.id} 
                        className="bg-blue-100/80 border border-blue-200 text-blue-800 text-[10px] p-1.5 rounded-lg truncate cursor-default hover:bg-blue-200 transition-colors shadow-sm flex flex-col"
                        title={`${timeStr} - ${appt.title} ${appt.leads?.name ? `(${appt.leads.name})` : ''}`}
                      >
                        <span className="font-bold">{timeStr}</span>
                        <span className="truncate">{appt.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}