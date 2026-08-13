import { getKanbanData } from '@/src/app/actions/kanban'
import PipelineBoard from '@/src/components/PipelineBoard'

export default async function KanbanPage() {
  const { steps, leads, members, userRole, customFields, currentUserId } = await getKanbanData()

  return <div className="mx-auto w-full max-w-[1480px]">
      <div className="fieldwork-page-intro"><div><p className="fieldwork-page-kicker">03 / Operação comercial</p><h1 className="fieldwork-page-title">O pipeline é o<br /><em className="not-italic text-[var(--brand-primary)]">mapa do movimento.</em></h1><p className="fieldwork-page-copy">Arraste negócios entre etapas, preserve o contexto e dê à equipa uma próxima ação clara.</p></div><div className="fieldwork-page-stamp"><span>NEGÓCIOS ATIVOS</span><strong>{leads?.length || 0} no pipeline</strong><small>Arraste para atualizar</small></div></div>
      <div>
        {steps && steps.length > 0 ? (
           <PipelineBoard
             initialSteps={steps} 
             initialLeads={leads || []} 
             members={members} 
             userRole={userRole} 
             customFields={customFields}
             currentUserId={currentUserId}
           />
        ) : (
          <div className="fieldwork-panel flex min-h-[420px] items-center justify-center">
            <p className="text-sm font-bold text-[var(--ink-soft)]">Nenhuma etapa de pipeline encontrada.</p>
          </div>
        )}
      </div>
    </div>
}
