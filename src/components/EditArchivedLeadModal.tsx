'use client'

import { ArchiveRestore, CircleX, Pencil, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { updateArchivedLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'
import ModalPortal from '@/src/components/ModalPortal'
import type { CustomField, Lead, Member } from '@/src/types/crm'

// Fieldwork OS: o histórico deve permitir aprender, editar ou reabrir sem regressar ao padrão visual legado.
export default function EditArchivedLeadModal({ lead, members, userRole, customFields }: { lead: Lead; members: Member[]; userRole: string; customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentStatus, setCurrentStatus] = useState(lead.status)
  const customData = lead.custom_data || {}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const response = await updateArchivedLead(new FormData(event.currentTarget))
    setLoading(false)
    if (response.success) { setIsOpen(false); window.location.reload() } else setErrorMsg(response.error || 'Erro ao atualizar histórico')
  }

  return <>
    <button type="button" onClick={(event) => { event.stopPropagation(); setIsOpen(true) }} className="fieldwork-inline-edit"><Pencil size={13} /> Editar</button>
    {isOpen && <ModalPortal><div className="fieldwork-modal-backdrop" onClick={() => setIsOpen(false)}><div className="fieldwork-modal-card" onClick={(event) => event.stopPropagation()}><header className="fieldwork-modal-header"><div><p className="fieldwork-page-kicker">Memória comercial</p><h2>Editar histórico.</h2><p>{lead.name} · ajuste resultado, valor ou contexto.</p></div><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-modal-close" aria-label="Fechar"><X size={17} /></button></header><form onSubmit={handleSubmit} className="fieldwork-modal-form"><input type="hidden" name="leadId" value={lead.id} /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="fieldwork-form-label" htmlFor={`archived-name-${lead.id}`}>Nome do contacto *</label><input id={`archived-name-${lead.id}`} name="name" type="text" defaultValue={lead.name} required className="fieldwork-form-input" /></div><div><label className="fieldwork-form-label" htmlFor={`archived-phone-${lead.id}`}>Telefone</label><input id={`archived-phone-${lead.id}`} name="phone" type="text" defaultValue={lead.phone || ''} className="fieldwork-form-input" /></div></div><div><label className="fieldwork-form-label" htmlFor={`archived-status-${lead.id}`}>Resultado</label><select id={`archived-status-${lead.id}`} name="status" value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} className="fieldwork-form-input"><option value="won">Ganha</option><option value="lost">Perdida</option><option value="open">Reabrir no pipeline</option></select>{currentStatus === 'open' && <p className="fieldwork-form-hint"><ArchiveRestore size={13} className="mr-1 inline" /> O contacto regressa à etapa anterior do pipeline.</p>}</div>{currentStatus === 'won' && <div><label className="fieldwork-form-label" htmlFor={`archived-value-${lead.id}`}>Valor final da venda</label><CurrencyInput name="leadValue" defaultValue={lead.lead_value || ''} placeholder="R$ 0,00" className="fieldwork-form-input" /></div>}{customFields?.map((field) => <div key={field.id}><label className="fieldwork-form-label" htmlFor={`archived-field-${lead.id}-${field.field_key}`}>{field.field_label}</label>{field.field_type === 'money' ? <CurrencyInput name={`custom_${field.field_key}`} defaultValue={customData[field.field_key] || ''} placeholder={`Informe ${field.field_label.toLowerCase()}`} className="fieldwork-form-input" /> : <input id={`archived-field-${lead.id}-${field.field_key}`} name={`custom_${field.field_key}`} type={field.field_type || 'text'} defaultValue={customData[field.field_key] || ''} className="fieldwork-form-input" />}</div>)}<div><label className="fieldwork-form-label" htmlFor={`archived-observation-${lead.id}`}>Observação / motivo</label><textarea id={`archived-observation-${lead.id}`} name="observation" rows={3} defaultValue={lead.observation || ''} className="fieldwork-form-input min-h-[92px] resize-none" /></div>{(userRole === 'admin' || userRole === 'owner') && members?.length > 0 && <div><label className="fieldwork-form-label" htmlFor={`archived-owner-${lead.id}`}>Responsável</label><select id={`archived-owner-${lead.id}`} name="assignedTo" defaultValue={lead.assigned_to || ''} className="fieldwork-form-input">{members.map((member) => <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>)}</select></div>}{errorMsg && <div className="fieldwork-auth-error"><CircleX size={14} className="mr-1 inline" /> {errorMsg}</div>}<footer className="fieldwork-modal-actions"><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-secondary-button">Cancelar</button><button type="submit" disabled={loading} className="fieldwork-primary-button disabled:opacity-50"><Trophy size={14} /> {loading ? 'A guardar...' : 'Guardar histórico'}</button></footer></form></div></div></ModalPortal>}
  </>
}
