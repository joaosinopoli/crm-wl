'use client'

import { useState } from 'react'
import { updateArchivedLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'

type Member = { id: string; full_name: string; role: string }
type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position?: number }
type Lead = {
  id: string; name: string; email?: string | null; phone?: string | null; status: string;
  assigned_to?: string | null; custom_data?: Record<string, any> | null; observation?: string | null; lead_value?: number | null;
}

export default function EditArchivedLeadModal({ lead, members, userRole, customFields }: { lead: Lead, members: Member[], userRole: string, customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentStatus, setCurrentStatus] = useState(lead.status)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formData = new FormData(event.currentTarget)
    const response = await updateArchivedLead(formData)

    setLoading(false)

    if (response.success) {
      setIsOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(response.error || 'Erro ao atualizar histórico')
    }
  }

  const customData = lead.custom_data || {}

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-block"
      >
        Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 my-8 cursor-default"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Editar Histórico do Lead</h3>
                <p className="text-xs text-gray-500 mt-0.5">Ajuste valores, observações ou reabra a negociação.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl w-8 h-8 rounded-full hover:bg-gray-100">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <input type="hidden" name="leadId" value={lead.id} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente *</label>
                  <input name="name" type="text" defaultValue={lead.name} required className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                  <input name="phone" type="text" defaultValue={lead.phone || ''} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status da Negociação</label>
                <select 
                  name="status" 
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${currentStatus === 'won' ? 'bg-green-50 border-green-300 text-green-900' : currentStatus === 'lost' ? 'bg-red-50 border-red-300 text-red-900' : 'bg-blue-50 border-blue-300 text-blue-900'}`}
                >
                  <option value="won">🏆 Ganha (Manter Arquivado)</option>
                  <option value="lost">❌ Perdida (Manter Arquivado)</option>
                  <option value="open">🔄 Reabrir (Voltar para o Kanban)</option>
                </select>
                {currentStatus === 'open' && (
                  <p className="text-[10px] text-blue-600 font-bold mt-1">O lead voltará para o funil de vendas na mesma etapa em que estava antes de ser finalizado.</p>
                )}
              </div>

              {currentStatus === 'won' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor Final da Venda</label>
                  <CurrencyInput 
                    name="leadValue" 
                    defaultValue={lead.lead_value || ''}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              )}

              {customFields && customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.field_label}</label>
                  {field.field_type === 'money' ? (
                    <CurrencyInput 
                      name={`custom_${field.field_key}`}
                      defaultValue={customData[field.field_key] || ''}
                      placeholder={`Informe ${field.field_label.toLowerCase()}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input 
                      name={`custom_${field.field_key}`}
                      type={field.field_type || 'text'}
                      defaultValue={customData[field.field_key] || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observação / Motivo</label>
                <textarea 
                  name="observation" rows={3} defaultValue={lead.observation || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {userRole === 'admin' && members && members.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsável</label>
                  <select 
                    name="assignedTo" defaultValue={lead.assigned_to || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>
                    ))}
                  </select>
                </div>
              )}

              {errorMsg && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">{errorMsg}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Histórico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}