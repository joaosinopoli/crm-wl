'use client'

import { useState } from 'react'
import { createLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'

type Step = { id: string; title: string; color?: string; position?: number }
type Member = { id: string; full_name: string; role: string }
type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position: number }

export default function NewLeadModal({ steps, members, userRole, customFields }: { steps: Step[], members: Member[], userRole: string, customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formData = new FormData(event.currentTarget)
    
    if (!formData.get('stepId') && steps.length > 0) {
      formData.append('stepId', steps[0].id)
    }

    const response = await createLead(formData)

    setLoading(false)

    if (response.success) {
      setIsOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(response.error || 'Erro ao cadastrar lead')
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
      >
        <span>+ Novo Lead</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Adicionar Novo Lead</h3>
                <p className="text-xs text-gray-500 mt-0.5">Preencha as informações obrigatórias e os campos personalizados.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente *</label>
                <input 
                  name="name" 
                  type="text" 
                  required
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone / WhatsApp *</label>
                <input 
                  name="phone" 
                  type="text" 
                  required
                  placeholder="(13) 99999-9999"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail (Opcional)</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="carlos@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {customFields && customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.field_label}</label>
                  {field.field_type === 'money' ? (
                    <CurrencyInput 
                      name={`custom_${field.field_key}`}
                      placeholder={`Informe ${field.field_label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input 
                      name={`custom_${field.field_key}`}
                      type={field.field_type || 'text'}
                      placeholder={`Informe ${field.field_label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observações (Opcional)</label>
                <textarea 
                  name="observation" 
                  rows={3}
                  placeholder="Ex: Cliente pediu para ligar após as 18h..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {userRole === 'admin' && members && members.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Atribuir Responsável</label>
                  <select 
                    name="assignedTo" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Atribuir a mim (Admin)</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Etapa Inicial do Funil</label>
                <select 
                  name="stepId" 
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.title}
                    </option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? 'Salvando...' : 'Salvar Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}