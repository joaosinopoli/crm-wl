'use client'

import { useState, useEffect } from 'react'
import { createAppointment } from '@/src/app/actions/agenda'
import type { Appointment, Lead } from '@/src/types/crm'

export default function CalendarAgenda({ appointments, leads }: { appointments: Appointment[], leads: Lead[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: string; appointments: Appointment[] } | null>(null)

  // FORÇA O CALENDÁRIO A USAR O RELÓGIO DO NAVEGADOR DO USUÁRIO (Ignora o UTC da Vercel)
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true)
      setCurrentDate(new Date())
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

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

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const formatFullDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    return `${d} de ${monthNames[Number(m) - 1]} de ${y}`
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    const response = await createAppointment(formData)
    setLoading(false)

    if (response.success) {
      window.location.reload()
    } else {
      setErrorMsg(response.error || 'Erro ao criar compromisso.')
    }
  }

  // Mostra um estado de carregamento rápido até que o fuso horário local seja validado
  if (!isMounted) {
    return (
      <div className="flex-1 flex items-center justify-center h-[600px]">
        <div className="text-gray-400 font-medium animate-pulse">Sincronizando fuso horário...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full flex-1 relative">
      <div className="xl:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Marcar Compromisso</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Compromisso *</label>
            <input name="title" type="text" required placeholder="Ex: Reunião de Fechamento" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Data *</label>
              <input name="date" type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hora *</label>
              <input name="time" type="time" required className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Vincular Cliente (Opcional)</label>
            <select name="leadId" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
              <option value="">Nenhum cliente (Avulso)</option>
              {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
            </select>
          </div>
          {errorMsg && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100 mt-2">{errorMsg}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-4">
            {loading ? 'Salvando...' : 'Adicionar à Agenda'}
          </button>
        </form>
      </div>

      <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col min-h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-gray-900 capitalize">{monthNames[month]} {year}</h3>
            <button onClick={goToday} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">Hoje</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" title="Mês Anterior">◀</button>
            <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" title="Próximo Mês">▶</button>
          </div>
        </div>

        <div className="flex-1 bg-gray-200 border border-gray-200 rounded-xl overflow-hidden grid grid-cols-7 gap-px">
          {weekDays.map(day => <div key={day} className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</div>)}
          {blanks.map(blank => <div key={`blank-${blank}`} className="bg-gray-50/50 min-h-[120px] p-2"></div>)}
          {days.map(day => {
            const paddedMonth = String(month + 1).padStart(2, '0')
            const paddedDay = String(day).padStart(2, '0')
            const dateStr = `${year}-${paddedMonth}-${paddedDay}`
            const dayAppointments = appointments.filter(a => a.appointment_date === dateStr)

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDayInfo({ date: dateStr, appointments: dayAppointments })}
                className={`min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-blue-50/50 cursor-pointer ${isToday(day) ? 'bg-blue-50/20' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday(day) ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {day}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {dayAppointments.map(appt => {
                    const timeStr = appt.appointment_time.slice(0, 5) 
                    return (
                      <div key={appt.id} className="bg-blue-100/80 border border-blue-200 text-blue-800 text-[10px] p-1.5 rounded-lg truncate shadow-sm flex flex-col" title={`${timeStr} - ${appt.title}`}>
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

      {selectedDayInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedDayInfo(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Agenda do Dia</h3>
                <p className="text-sm text-blue-600 font-semibold mt-0.5">{formatFullDate(selectedDayInfo.date)}</p>
              </div>
              <button onClick={() => setSelectedDayInfo(null)} className="text-gray-400 hover:text-gray-600 font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {selectedDayInfo.appointments.length > 0 ? (
                selectedDayInfo.appointments.map(appt => (
                  <div key={appt.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex gap-4 items-start shadow-sm hover:border-blue-300 transition-colors">
                    <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shrink-0 shadow-sm">{appt.appointment_time.slice(0, 5)}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{appt.title}</h4>
                      {(() => {
                        const lead = Array.isArray(appt.leads) ? appt.leads[0] : appt.leads
                        return lead?.name ? <p className="text-sm text-gray-600 mt-1">Cliente: <strong className="text-gray-800">{lead.name}</strong></p> : null
                      })()}
                      <p className="text-[11px] text-gray-400 mt-2 font-medium">Resp: {Array.isArray(appt.profiles) ? appt.profiles[0]?.full_name : appt.profiles?.full_name || 'Desconhecido'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <span className="text-4xl block mb-3">📅</span>
                  <p className="text-gray-500 text-sm font-medium">Nenhum compromisso agendado para este dia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}