'use client'

import { useState } from 'react'
import { addQuickNote } from '@/src/app/actions/kanban'

type Lead = {
  id: string
  name: string
  observation?: string | null
}

export default function QuickNoteModal({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [schedule, setSchedule] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  // Função inteligente para setar automaticamente para amanhã
  const setTomorrow = () => {
    const tmrw = new Date()
    tmrw.setDate(tmrw.getDate() + 1)
    setDate(tmrw.toISOString().split('T')[0]) 
    setTime('10:00')
    setSchedule(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (!schedule) {
      formData.delete('scheduleDate')
      formData.delete('scheduleTime')
    }

    const response = await addQuickNote(formData)
    setLoading(false)

    if (response.success) {
      setIsOpen(false)
      window.location.reload()
    }
  }

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
        className="text-xs font-semibold text-gray-600 hover:text-blue-700 bg-gray-100 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-blue-200"
        title="Adicionar Anotação ou Agendar Retorno"
      >
        + Nota
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 cursor-default"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Nota Rápida</h3>
                <p className="text-[11px] text-gray-500">Cliente: {lead.name}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="leadId" value={lead.id} />

              <div>
                <textarea 
                  name="observation"
                  rows={4}
                  required
                  defaultValue={lead.observation || ''}
                  placeholder="Ex: Cliente pediu pra ligar amanhã..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={setTomorrow}
                  className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  ⚡ Agendar para Amanhã
                </button>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox" 
                    checked={schedule}
                    onChange={(e) => setSchedule(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Salvar na Agenda</span>
                </label>

                {schedule && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Data</label>
                      <input 
                        name="scheduleDate" type="date" required={schedule} value={date} onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Hora</label>
                      <input 
                        name="scheduleTime" type="time" required={schedule} value={time} onChange={(e) => setTime(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-sm">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}