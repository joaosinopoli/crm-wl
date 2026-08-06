import { getArchivedLeads } from '@/src/app/actions/kanban'
import { createClient } from '@/src/utils/supabase/server'
import EditArchivedLeadModal from '@/src/components/EditArchivedLeadModal'

export default async function ArquivadosPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; dateFrom?: string; dateTo?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let members: any[] = []
  let customFields: any[] = []
  let userRole = 'sales'

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, company_id').eq('id', user.id).single()
    if (profile) {
      userRole = profile.role
      const { data: fieldsData } = await supabase.from('custom_field_definitions').select('*').eq('company_id', profile.company_id).order('position', { ascending: true })
      customFields = fieldsData || []

      if (profile.role === 'admin') {
        const { data: membersData } = await supabase.from('profiles').select('id, full_name, role').eq('company_id', profile.company_id)
        members = membersData || []
      }
    }
  }

  const search = searchParams.search || ''
  const status = searchParams.status || 'all'
  const dateFrom = searchParams.dateFrom || ''
  const dateTo = searchParams.dateTo || ''

  const archivedLeads = await getArchivedLeads(search, status, dateFrom, dateTo)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Vendas (Arquivados)</h2>
        <p className="text-sm text-gray-500 mt-1">Consulte e edite negócios finalizados, ou reabra clientes de volta para o Kanban.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <form method="GET" action="/dashboard/arquivados" className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Buscar por Nome</label>
            <input 
              name="search" type="text" defaultValue={search} placeholder="Ex: Carlos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
            <select 
              name="status" defaultValue={status}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="won">🏆 Ganhos</option>
              <option value="lost">❌ Perdidos</option>
            </select>
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">De (Data)</label>
            <input name="dateFrom" type="date" defaultValue={dateFrom} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Até (Data)</label>
            <input name="dateTo" type="date" defaultValue={dateTo} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <a href="/dashboard/arquivados" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center">Limpar</a>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center">Filtrar</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Valor da Venda</th>
                <th className="py-4 px-6">Data de Fechamento</th>
                <th className="py-4 px-6">Motivo / Observação</th>
                <th className="py-4 px-6">Responsável</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {archivedLeads && archivedLeads.length > 0 ? (
                archivedLeads.map((lead: any) => {
                  const profileData = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles
                  const isWon = lead.status === 'won'

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {lead.name}
                        <div className="text-xs text-gray-400 font-normal mt-0.5">{lead.phone || lead.email || 'Sem contato'}</div>
                      </td>
                      <td className="py-4 px-6">
                        {isWon ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            🏆 Ganho
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            ❌ Perdido
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {isWon && lead.lead_value > 0 ? formatCurrency(lead.lead_value) : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs font-medium">
                        {lead.closed_at ? new Date(lead.closed_at).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs text-gray-600 line-clamp-2 max-w-xs italic">
                          {lead.observation || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {profileData?.full_name || 'Não atribuído'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <EditArchivedLeadModal 
                          lead={lead} 
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
                  <td colSpan={7} className="py-16 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-3xl">🗃️</span>
                      <p>Nenhum lead arquivado encontrado com os filtros atuais.</p>
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