'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { updateLeadStep } from '@/src/app/actions/kanban'
import QuickNoteModal from '@/src/components/QuickNoteModal'
import EditLeadModal from '@/src/components/EditLeadModal'
import CloseLeadModal from '@/src/components/CloseLeadModal'

type Step = { id: string; title: string; color: string }
type Member = { id: string; full_name: string; role: string }
type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position?: number }
type Lead = { 
  id: string; step_id: string; name: string; email?: string | null; phone?: string | null; 
  assigned_to?: string | null; custom_data?: Record<string, any> | null; observation?: string | null; lead_value?: number | null; status?: string;
  created_at: string; profiles?: { full_name: string } | { full_name: string }[] | null;
}

export default function KanbanBoard({ initialSteps, initialLeads, members, userRole, customFields, currentUserId }: { initialSteps: Step[], initialLeads: Lead[], members: Member[], userRole: string, customFields: CustomField[], currentUserId: string }) {
  const [steps] = useState(initialSteps)
  const [leads, setLeads] = useState(initialLeads)
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all')
  
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStepId = destination.droppableId
    setLeads(prevLeads => prevLeads.map(lead => lead.id === draggableId ? { ...lead, step_id: newStepId } : lead))
    const response = await updateLeadStep(draggableId, newStepId)
    if (!response.success) alert('Erro ao sincronizar com o servidor.')
  }

  const filteredLeads = leads.filter(lead => {
    if (userRole !== 'admin') return true; 
    if (selectedAssignee === 'all') return true;
    return lead.assigned_to === selectedAssignee;
  })

  return (
    <div className="h-full flex flex-col">
      {userRole === 'admin' && members && members.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Visualizando Kanban de:</label>
          <select 
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 outline-none"
          >
            <option value="all">Visão Geral da Empresa (Todos)</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.id === currentUserId ? `Meu Kanban (${member.full_name})` : member.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4 pt-2">
          {steps.map((step) => {
            const columnLeads = filteredLeads.filter(lead => lead.step_id === step.id)

            return (
              <div key={step.id} className="min-w-[320px] w-[320px] bg-gray-100/80 rounded-xl flex flex-col max-h-full border border-gray-200">
                <div className={`p-4 rounded-t-xl border-b border-gray-200 ${step.color || 'bg-white'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{step.title}</h3>
                    <span className="bg-white/60 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{columnLeads.length}</span>
                  </div>
                </div>
                
                <Droppable droppableId={step.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}>
                      {columnLeads.map((lead, index) => {
                        const profileData = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles
                        const isExpanded = expandedCards[lead.id]

                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`p-4 mb-3 bg-white rounded-xl border shadow-sm flex flex-col gap-2 transition-all ${snapshot.isDragging ? 'shadow-lg border-blue-400 scale-105' : 'border-gray-200 hover:border-blue-300'}`} style={{ ...provided.draggableProps.style }}>
                                
                                {/* TOPO DO CARD: Nome, Botão Nota e Botão Editar */}
                                <div className="flex justify-between items-start">
                                  <span className="font-semibold text-gray-900 text-sm">{lead.name}</span>
                                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                    <QuickNoteModal lead={lead} />
                                    <EditLeadModal lead={lead} steps={steps} members={members} userRole={userRole} customFields={customFields} />
                                  </div>
                                </div>
                                
                                {lead.phone && <span className="text-xs text-gray-500 font-medium mt-1">📞 {lead.phone}</span>}
                                {lead.lead_value && lead.lead_value > 0 && <span className="text-[11px] font-bold text-green-700 mt-0.5">💰 R$ {Number(lead.lead_value).toFixed(2)}</span>}
                                
                                {/* Tag de Observação Retrátil */}
                                {lead.observation && (
                                  <div className="mt-1">
                                    <div onClick={(e) => { e.stopPropagation(); toggleExpand(lead.id) }} className="cursor-pointer inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-200 transition-colors">
                                      <span>📝 Observação</span>
                                      <span className="text-[8px]">{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                    
                                    {isExpanded && (
                                      <div className="bg-yellow-50 text-yellow-800 text-[11px] p-2.5 rounded-lg border border-yellow-200 mt-2 whitespace-pre-wrap leading-relaxed">
                                        {lead.observation}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* RODAPÉ DO CARD: Responsável e Botão Finalizar */}
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                  <span className="font-medium text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-full truncate max-w-[120px]">{profileData?.full_name}</span>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <CloseLeadModal lead={lead} />
                                  </div>
                                </div>
                                
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}