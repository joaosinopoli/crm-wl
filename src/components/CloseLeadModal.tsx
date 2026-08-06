'use client'

import { useState } from 'react'
import { closeLead } from '@/src/app/actions/kanban'

type Lead = {
  id: string
  name: string
  lead_value?: number | null
}

export default function CloseLeadModal({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'won' | 'lost'>('won')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('status', status)
    formData.append('leadId', lead.id)

    const response = await closeLead(formData)
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
        className="text-[11px] font-bold text-green-700 bg-green-100 hover:bg-green-200 px-2 py-1.5 rounded-lg transition-colors border border-green-200"
        title="Finalizar Venda (Ganho ou Perdido)"
      >
        ✓ Finalizar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Finalizar Negociação</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cliente: {lead.name}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:bg-gray-100 w-8 h-8 rounded-full">&times;</button>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setStatus('won')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${status === 'won' ? 'bg-green-500 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                Ganha 🏆
              </button>
              <button 
                onClick={() => setStatus('lost')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${status === 'lost' ? 'bg-red-500 text-white border-red-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                Perdida ❌
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'won' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor da Venda (R$)</label>
                  <input 
                    name="leadValue" 
                    type="number" 
                    step="0.01"
                    defaultValue={lead.lead_value || ''}
                    required
                    placeholder="Ex: 1500.00"
                    className="w-full px-4 py-2 border border-green-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 bg-green-50"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Este valor será contabilizado no seu Resumo Financeiro.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motivo da Perda</label>
                  <textarea 
                    name="observation" 
                    rows={2}
                    required
                    placeholder="Ex: Achou caro, comprou no concorrente..."
                    className="w-full px-3 py-2 border border-red-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 bg-red-50 resize-none"
                  ></textarea>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black disabled:opacity-50 mt-4 shadow-sm"
              >
                {loading ? 'Processando...' : 'Confirmar e Arquivar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}