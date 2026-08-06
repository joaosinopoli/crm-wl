'use client'

import { useState } from 'react'
import { updateLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'

type Step = { id: string; title: string; color?: string; position?: number }
type Member = { id: string; full_name: string; role: string }
type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position?: number }
type Lead = {
  id: string; name: string; email?: string | null; phone?: string | null; step_id: string;
  assigned_to?: string | null; custom_data?: Record<string, any> | null; observation?: string | null;
}

export default function EditLeadModal({ lead, steps, members, userRole, customFields }: { lead: Lead, steps: Step[], members: Member[], userRole: string, customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formData = new FormData(event.currentTarget)
    const response = await updateLead(formData)

    setLoading(false)

    if (response.success) {
      setIsOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(response.error || 'Erro ao atualizar lead')
    }
  }

  const customData = lead.custom_data || {}

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-blue-200"
        title="Editar Cadastro do Lead"
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
                <h3 className="text-xl font-bold text-gray-900">Editar Lead</h3>
                <p className="text-xs text-gray-500 mt-0.5">Atualize as informações do cliente rapidamente.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <input type="hidden" name="leadId" value={lead.id} />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente *</label>
                <input 
                  name="name" type="text" defaultValue={lead.name} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone / WhatsApp *</label>
                <input 
                  name="phone" type="text" defaultValue={lead.phone || ''} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail (Opcional)</label>
                <input 
                  name="email" type="email" defaultValue={lead.email || ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {customFields && customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.field_label}</label>
                  {field.field_type === 'money' ? (
                    <CurrencyInput 
                      name={`custom_${field.field_key}`}
                      defaultValue={customData[field.field_key] || ''}
                      placeholder={`Informe ${field.field_label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input 
                      name={`custom_${field.field_key}`}
                      type={field.field_type || 'text'}
                      defaultValue={customData[field.field_key] || ''}
                      placeholder={`Informe ${field.field_label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observações Finais</label>
                <textarea 
                  name="observation" rows={3} defaultValue={lead.observation || ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {userRole === 'admin' && members && members.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsável</label>
                  <select 
                    name="assignedTo" defaultValue={lead.assigned_to || ''}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Etapa do Funil</label>
                <select 
                  name="stepId" defaultValue={lead.step_id}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}