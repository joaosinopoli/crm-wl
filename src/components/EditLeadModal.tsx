'use client'

import { Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { updateLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'
import type { CustomField, FunnelStep, Lead, Member } from '@/src/types/crm'
import ModalPortal from '@/src/components/ModalPortal'

// Fieldwork OS: editar um lead deve manter a pessoa dentro do contexto, com uma ação clara e pouca fricção.
export default function EditLeadModal({ lead, steps, members, userRole, customFields }: { lead: Lead; steps: FunnelStep[]; members: Member[]; userRole: string; customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const customData = lead.custom_data || {}

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setErrorMsg('')
    const response = await updateLead(new FormData(event.currentTarget)); setLoading(false)
    if (response.success) { setIsOpen(false); window.location.reload() } else setErrorMsg(response.error || 'Erro ao atualizar lead')
  }

  return <>
    <button type="button" onClick={(event) => { event.stopPropagation(); setIsOpen(true) }} className="fieldwork-inline-edit" title="Editar lead"><Pencil size={13} /> Editar</button>
    {isOpen && <ModalPortal><div className="fieldwork-modal-backdrop" onClick={() => setIsOpen(false)}><div className="fieldwork-modal-card" onClick={(event) => event.stopPropagation()}><header className="fieldwork-modal-header"><div><p className="fieldwork-page-kicker">Contexto do lead</p><h2>Editar lead</h2><p>Atualize o contexto sem perder o próximo passo.</p></div><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-modal-close" aria-label="Fechar"><X size={17} /></button></header><form onSubmit={handleSubmit} className="fieldwork-modal-form"><input type="hidden" name="leadId" value={lead.id} /><div><label className="fieldwork-form-label" htmlFor={`edit-lead-name-${lead.id}`}>Nome do contacto *</label><input id={`edit-lead-name-${lead.id}`} name="name" type="text" defaultValue={lead.name} required className="fieldwork-form-input" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="fieldwork-form-label" htmlFor={`edit-lead-phone-${lead.id}`}>Telefone / WhatsApp *</label><input id={`edit-lead-phone-${lead.id}`} name="phone" type="text" defaultValue={lead.phone || ''} required className="fieldwork-form-input" /></div><div><label className="fieldwork-form-label" htmlFor={`edit-lead-email-${lead.id}`}>E-mail</label><input id={`edit-lead-email-${lead.id}`} name="email" type="email" defaultValue={lead.email || ''} className="fieldwork-form-input" /></div></div>{customFields?.map((field) => <div key={field.id}><label className="fieldwork-form-label" htmlFor={`edit-lead-${lead.id}-${field.field_key}`}>{field.field_label}</label>{field.field_type === 'money' ? <CurrencyInput name={`custom_${field.field_key}`} defaultValue={customData[field.field_key] || ''} placeholder={`Informe ${field.field_label.toLowerCase()}`} className="fieldwork-form-input" /> : <input id={`edit-lead-${lead.id}-${field.field_key}`} name={`custom_${field.field_key}`} type={field.field_type || 'text'} defaultValue={customData[field.field_key] || ''} placeholder={`Informe ${field.field_label.toLowerCase()}`} className="fieldwork-form-input" />}</div>)}<div><label className="fieldwork-form-label" htmlFor={`edit-lead-observation-${lead.id}`}>Observações finais</label><textarea id={`edit-lead-observation-${lead.id}`} name="observation" rows={3} defaultValue={lead.observation || ''} className="fieldwork-form-input min-h-[92px] resize-none" /></div>{(userRole === 'admin' || userRole === 'owner') && members?.length > 0 && <div><label className="fieldwork-form-label" htmlFor={`edit-lead-owner-${lead.id}`}>Responsável</label><select id={`edit-lead-owner-${lead.id}`} name="assignedTo" defaultValue={lead.assigned_to || ''} className="fieldwork-form-input">{members.map((member) => <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>)}</select></div>}<div><label className="fieldwork-form-label" htmlFor={`edit-lead-step-${lead.id}`}>Etapa do pipeline</label><select id={`edit-lead-step-${lead.id}`} name="stepId" defaultValue={lead.step_id || ''} className="fieldwork-form-input">{steps.map((step) => <option key={step.id} value={step.id}>{step.title}</option>)}</select></div>{errorMsg && <div className="fieldwork-auth-error">{errorMsg}</div>}<footer className="fieldwork-modal-actions"><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-secondary-button">Cancelar</button><button type="submit" disabled={loading} className="fieldwork-primary-button disabled:opacity-50">{loading ? 'A guardar...' : 'Guardar alterações'}</button></footer></form></div></div></ModalPortal>}
  </>
}
