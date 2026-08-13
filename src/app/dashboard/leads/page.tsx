import { getAllLeadsData } from '@/src/app/actions/kanban'
import Link from 'next/link'
import EditLeadModal from '@/src/components/EditLeadModal'
import type { Lead } from '@/src/types/crm'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { search?: string; interest?: string; stepId?: string }
}) {
  const search = searchParams.search || ''
  const interest = searchParams.interest || ''
  const stepFilter = searchParams.stepId || 'all'

  // Busca todos os leads ativos (open)
  const { leads, steps, members, userRole, customFields } = await getAllLeadsData()

  // Filtros aplicados no servidor de forma dinâmica
  let filteredLeads = leads || []

  // 1. Filtro por Nome, E-mail ou Telefone
  if (search) {
    filteredLeads = filteredLeads.filter(lead =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))
    )
  }

  // 2. Filtro Inteligente por "Interesse" (Vasculha os Custom Fields)
  if (interest) {
    filteredLeads = filteredLeads.filter(lead => {
      if (!lead.custom_data) return false
      // Verifica se algum valor dentro dos dados personalizados bate com a busca
      return Object.values(lead.custom_data).some(val =>
        String(val).toLowerCase().includes(interest.toLowerCase())
      )
    })
  }

  // 3. Filtro por Etapa do Funil
  if (stepFilter !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.step_id === stepFilter)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Todos os Leads (Em Aberto)</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie sua base de contatos ativos e filtre por interesses específicos.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/dashboard/leads/importar" className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-100">Importar CSV</Link><a href="/dashboard/leads/export" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Exportar CSV</a></div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <form method="GET" action="/dashboard/leads" className="flex flex-col md:flex-row gap-4 items-end">
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Buscar por Nome / Contato</label>
            <input 
              name="search" 
              type="text" 
              defaultValue={search}
              placeholder="Ex: Carlos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Buscar por Interesse</label>
            <input 
              name="interest" 
              type="text" 
              defaultValue={interest}
              placeholder="Ex: Twister 2021, Financiamento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="w-full md:w-56">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Etapa do Funil</label>
            <select 
              name="stepId" 
              defaultValue={stepFilter}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Etapas</option>
              {steps.map(step => (
                <option key={step.id} value={step.id}>{step.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <a 
              href="/dashboard/leads"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Limpar
            </a>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Etapa Atual</th>
                <th className="py-4 px-6">Interesses / Dados Extras</th>
                <th className="py-4 px-6">Data de Cadastro</th>
                <th className="py-4 px-6">Responsável</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead: Lead) => {
                  const profileData = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles
                  const step = steps.find(s => s.id === lead.step_id)

                  // Formata os campos personalizados para exibição amigável na tabela
                  const customDataEntries = lead.custom_data ? Object.entries(lead.custom_data) : []

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {lead.name}
                        <div className="text-xs text-gray-400 font-normal mt-0.5">{lead.phone || lead.email || 'Sem contato'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {step?.title || 'Desconhecida'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 max-w-[250px]">
                          {customDataEntries.length > 0 ? (
                            customDataEntries.map(([key, value]) => {
                              if (!value) return null
                              // Procura o label real do campo
                              const fieldDef = customFields.find(f => f.field_key === key)
                              const label = fieldDef ? fieldDef.field_label : key
                              return (
                                <span key={key} className="text-xs text-gray-600 truncate" title={String(value)}>
                                  <strong className="text-gray-800">{label}:</strong> {String(value)}
                                </span>
                              )
                            })
                          ) : (
                            <span className="text-xs text-gray-400 italic">Nenhum dado extra</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs font-medium">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {profileData?.full_name || 'Não atribuído'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <EditLeadModal 
                          lead={lead} 
                          steps={steps} 
                          members={members} 
                          userRole={userRole} 
                          customFields={customFields} 
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-3xl">📇</span>
                      <p>Nenhum lead encontrado com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
