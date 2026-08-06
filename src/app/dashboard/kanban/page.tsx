import { getKanbanData } from '@/src/app/actions/kanban'
import KanbanBoard from '@/src/components/KanbanBoard'

export default async function KanbanPage() {
  const { steps, leads, members, userRole, customFields, currentUserId } = await getKanbanData()

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Seu Funil de Vendas</h2>
        <p className="text-sm text-gray-500 mt-1">Negociações ativas. Finalize um lead para ele sair do quadro e ir para o Resumo Financeiro.</p>
      </div>

      <div className="flex-1 overflow-hidden">
        {steps && steps.length > 0 ? (
           <KanbanBoard 
             initialSteps={steps} 
             initialLeads={leads || []} 
             members={members} 
             userRole={userRole} 
             customFields={customFields}
             currentUserId={currentUserId}
           />
        ) : (
          <div className="h-full border-2 border-dashed border-gray-200 rounded-xl bg-white flex items-center justify-center">
            <p className="text-gray-400 font-medium">Nenhuma etapa de funil encontrada.</p>
          </div>
        )}
      </div>
    </div>
  )
}