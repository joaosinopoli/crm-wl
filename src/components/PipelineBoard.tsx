'use client'

// Fieldwork OS: pipeline como superfície de decisão — cada cartão mostra valor, dono e contexto suficiente para avançar.
import { useState } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { ArrowUpRight, CircleDollarSign, MoreHorizontal, StickyNote } from 'lucide-react'
import { updateLeadStep } from '@/src/app/actions/kanban'
import type { CustomField, FunnelStep, Lead, Member } from '@/src/types/crm'
import QuickNoteModal from '@/src/components/QuickNoteModal'
import EditLeadModal from '@/src/components/EditLeadModal'
import CloseLeadModal from '@/src/components/CloseLeadModal'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

export default function PipelineBoard({ initialSteps, initialLeads, members, userRole, customFields, currentUserId }: { initialSteps: FunnelStep[]; initialLeads: Lead[]; members: Member[]; userRole: string; customFields: CustomField[]; currentUserId: string }) {
  const [steps] = useState(initialSteps)
  const [leads, setLeads] = useState(initialLeads)
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return
    setLeads((current) => current.map((lead) => lead.id === draggableId ? { ...lead, step_id: destination.droppableId } : lead))
    const response = await updateLeadStep(draggableId, destination.droppableId)
    if (!response.success) window.alert('Não foi possível sincronizar a etapa.')
  }

  const filteredLeads = leads.filter((lead) => userRole !== 'admin' || selectedAssignee === 'all' || lead.assigned_to === selectedAssignee)

  return <div className="fieldwork-pipeline-wrap">
    <div className="fieldwork-pipeline-toolbar"><div className="fieldwork-pipeline-tabs"><button type="button" className="is-active">Pipeline principal</button><button type="button">Todos os negócios</button><button type="button">A minha fila</button></div>{userRole === 'admin' && members.length > 0 && <label className="fieldwork-pipeline-filter">RESPONSÁVEL<select value={selectedAssignee} onChange={(event) => setSelectedAssignee(event.target.value)}><option value="all">Toda a equipa</option>{members.map((member) => <option key={member.id} value={member.id}>{member.id === currentUserId ? `Eu — ${member.full_name}` : member.full_name}</option>)}</select></label>}</div>
    <DragDropContext onDragEnd={onDragEnd}><div className="fieldwork-pipeline-scroll">{steps.map((step, stepIndex) => { const columnLeads = filteredLeads.filter((lead) => lead.step_id === step.id); const totalValue = columnLeads.reduce((sum, lead) => sum + Number(lead.lead_value || 0), 0); return <section key={step.id} className="fieldwork-pipeline-column"><header className="fieldwork-pipeline-column-head"><div><span className="fieldwork-pipeline-column-index">0{stepIndex + 1}</span><h3>{step.title}</h3></div><div className="text-right"><strong>{columnLeads.length}</strong><span>{formatCurrency(totalValue)}</span></div></header><Droppable droppableId={step.id}>{(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`fieldwork-pipeline-dropzone ${snapshot.isDraggingOver ? 'is-over' : ''}`}>{columnLeads.map((lead, index) => { const profileData = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles; const expanded = expandedCards[lead.id]; return <Draggable key={lead.id} draggableId={lead.id} index={index}>{(providedDrag, snapshotDrag) => <article ref={providedDrag.innerRef} {...providedDrag.draggableProps} {...providedDrag.dragHandleProps} className={`fieldwork-deal-card ${snapshotDrag.isDragging ? 'is-dragging' : ''}`}><div className="fieldwork-deal-card-top"><span className="fieldwork-deal-source">{lead.email ? 'E-MAIL' : 'CONTACTO'}</span><button type="button" aria-label="Mais opções" className="fieldwork-deal-more"><MoreHorizontal size={15} /></button></div><h4>{lead.name}</h4><span className="fieldwork-deal-contact">{lead.email || lead.phone || 'Sem contacto direto'}</span>{lead.lead_value && lead.lead_value > 0 ? <div className="fieldwork-deal-value"><CircleDollarSign size={13} />{formatCurrency(Number(lead.lead_value))}</div> : <div className="fieldwork-deal-value is-muted">Sem valor previsto</div>}<div className="fieldwork-deal-meta"><span className="fieldwork-owner-avatar">{(profileData?.full_name || '?').charAt(0).toUpperCase()}</span><span className="truncate">{profileData?.full_name || 'Sem responsável'}</span><div className="ml-auto flex items-center gap-1" onClick={(event) => event.stopPropagation()}><QuickNoteModal lead={lead} /><EditLeadModal lead={lead} steps={steps} members={members} userRole={userRole} customFields={customFields} /></div></div>{lead.observation && <button type="button" className={`fieldwork-deal-note ${expanded ? 'is-open' : ''}`} onClick={(event) => { event.stopPropagation(); setExpandedCards((current) => ({ ...current, [lead.id]: !current[lead.id] })) }}><StickyNote size={12} /><span>{expanded ? lead.observation : 'Ver nota do lead'}</span></button>}<div className="fieldwork-deal-footer"><span>Próximo movimento</span><div onClick={(event) => event.stopPropagation()}><CloseLeadModal lead={lead} /></div></div></article>}</Draggable>})}{provided.placeholder}{columnLeads.length === 0 && !snapshot.isDraggingOver && <div className="fieldwork-column-empty"><ArrowUpRight size={16} /><span>Arraste um negócio<br />para começar</span></div>}</div>}</Droppable></section>})}</div></DragDropContext>
  </div>
}
