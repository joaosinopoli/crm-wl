import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateLead } from '@/src/app/actions/kanban'
import type { CustomField, FunnelStep } from '@/src/types/crm'

export default async function EditLeadPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) {
    redirect('/dashboard/leads')
  }

  const { data: steps } = await supabase
    .from('funnel_steps')
    .select('id, title')
    .order('position', { ascending: true })

  const { data: customFields } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('position', { ascending: true })

  let members: { id: string; full_name: string; role: string }[] = []
  if (profile.role === 'admin' && profile.company_id) {
    const { data: membersData } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('company_id', profile.company_id)
    members = membersData || []
  }

  const customData = lead.custom_data || {}

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto w-full pb-12">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Cadastro de Lead</h2>
          <p className="text-sm text-gray-500 mt-1">Atualize as informações comerciais, status e dados personalizados do cliente.</p>
        </div>
        <Link 
          href="/dashboard/leads"
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          &larr; Voltar para Leads
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <form action={async (formData) => {
          'use server'
          const res = await updateLead(formData)
          if (res.success) {
            redirect('/dashboard/leads')
          }
        }} className="space-y-6">
          <input type="hidden" name="leadId" value={lead.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Cliente *</label>
              <input 
                name="name" 
                type="text" 
                defaultValue={lead.name}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone / WhatsApp *</label>
              <input 
                name="phone" 
                type="text" 
                defaultValue={lead.phone || ''}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail (Opcional)</label>
              <input 
                name="email" 
                type="email" 
                defaultValue={lead.email || ''}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Etapa do Funil</label>
              <select 
                name="stepId" 
                defaultValue={lead.step_id}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {steps?.map((step: FunnelStep) => (
                  <option key={step.id} value={step.id}>
                    {step.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Observações (Opcional)</label>
            <textarea 
              name="observation" 
              rows={3}
              defaultValue={lead.observation || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          {customFields && customFields.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Informações Personalizadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFields.map((field: CustomField) => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{field.field_label}</label>
                    <input 
                      name={`custom_${field.field_key}`}
                      type={field.field_type || 'text'}
                      defaultValue={customData[field.field_key] || ''}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.role === 'admin' && members && members.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Funcionário Responsável</label>
              <select 
                name="assignedTo" 
                defaultValue={lead.assigned_to || ''}
                className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Link 
              href="/dashboard/leads"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}