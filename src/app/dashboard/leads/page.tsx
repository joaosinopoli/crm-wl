import Link from 'next/link'
import { getAllLeadsData } from '@/src/app/actions/kanban'
import EditLeadModal from '@/src/components/EditLeadModal'

export default async function LeadsPage() {
  const { leads, members, steps, userRole, customFields } = await getAllLeadsData()

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Todos os Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Lista completa de contatos e clientes cadastrados no CRM.</p>
        </div>
        <Link 
          href="/dashboard"
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          &larr; Voltar ao Funil
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Nome do Cliente</th>
                <th className="py-3 px-6">Telefone</th>
                <th className="py-3 px-6">E-mail</th>
                <th className="py-3 px-6">Responsável</th>
                <th className="py-3 px-6">Etapa Atual</th>
                <th className="py-3 px-6">Data</th>
                <th className="py-3 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {leads && leads.length > 0 ? (
                leads.map((lead: any) => {
                  const step = lead.funnel_steps
                  const profileData = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {lead.name}
                        {/* Exibe resumo de campos customizados abaixo do nome se existirem */}
                        {lead.custom_data && Object.keys(lead.custom_data).length > 0 && (
                          <div className="text-[11px] text-gray-500 font-normal mt-0.5">
                            {Object.entries(lead.custom_data).map(([k, v]) => {
                              const def = customFields.find(f => f.field_key === k)
                              if (!v) return null
                              return <span key={k} className="mr-2 inline-block"><strong>{def?.field_label || k}:</strong> {String(v)}</span>
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-500">{lead.phone || '-'}</td>
                      <td className="py-4 px-6 text-gray-500">{lead.email || '-'}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {profileData?.full_name || 'Não atribuído'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {step?.title || 'Sem etapa'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <EditLeadModal lead={lead} steps={steps} members={members} userRole={userRole} customFields={customFields} />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    Nenhum lead encontrado.
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