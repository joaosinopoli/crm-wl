'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { createLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'
import ModalPortal from '@/src/components/ModalPortal'

type Step = { id: string; title: string; color?: string; position?: number }
type Member = { id: string; full_name: string; role: string }
type CustomField = { id: string; field_key: string; field_label: string; field_type: string; position: number }

// Fieldwork OS: o modal de criação deve reduzir a carga cognitiva e apresentar os campos como contexto comercial.
export default function NewLeadModal({ steps, members, userRole, customFields }: { steps: Step[]; members: Member[]; userRole: string; customFields: CustomField[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setErrorMsg('')
    const formData = new FormData(event.currentTarget)
    if (!formData.get('stepId') && steps.length > 0) formData.append('stepId', steps[0].id)
    const response = await createLead(formData); setLoading(false)
    if (response.success) { setIsOpen(false); window.location.reload() } else setErrorMsg(response.error || 'Erro ao cadastrar lead')
  }

  return <>
    <button type="button" onClick={() => setIsOpen(true)} className="fieldwork-primary-button"><Plus size={15} /> Novo lead</button>
    {isOpen && <ModalPortal><div className="fieldwork-modal-backdrop" onClick={() => setIsOpen(false)}><div className="fieldwork-modal-card" onClick={(event) => event.stopPropagation()}><header className="fieldwork-modal-header"><div><p className="fieldwork-page-kicker">Novo relacionamento</p><h2>Adicionar novo lead</h2><p>Comece pelo contexto mínimo; o resto pode evoluir com a conversa.</p></div><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-modal-close" aria-label="Fechar"><X size={17} /></button></header><form onSubmit={handleSubmit} className="fieldwork-modal-form"><div><label className="fieldwork-form-label" htmlFor="new-lead-name">Nome do contacto *</label><input id="new-lead-name" name="name" type="text" required placeholder="Ex.: Carlos Eduardo" className="fieldwork-form-input" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="fieldwork-form-label" htmlFor="new-lead-phone">Telefone / WhatsApp *</label><input id="new-lead-phone" name="phone" type="text" required placeholder="(13) 99999-9999" className="fieldwork-form-input" /></div><div><label className="fieldwork-form-label" htmlFor="new-lead-email">E-mail</label><input id="new-lead-email" name="email" type="email" placeholder="carlos@email.com" className="fieldwork-form-input" /></div></div>{customFields?.map((field) => <div key={field.id}><label className="fieldwork-form-label" htmlFor={`new-lead-${field.field_key}`}>{field.field_label}</label>{field.field_type === 'money' ? <CurrencyInput name={`custom_${field.field_key}`} placeholder={`Informe ${field.field_label.toLowerCase()}`} className="fieldwork-form-input" /> : <input id={`new-lead-${field.field_key}`} name={`custom_${field.field_key}`} type={field.field_type || 'text'} placeholder={`Informe ${field.field_label.toLowerCase()}`} className="fieldwork-form-input" />}</div>)}<div><label className="fieldwork-form-label" htmlFor="new-lead-observation">Observações</label><textarea id="new-lead-observation" name="observation" rows={3} placeholder="Ex.: Cliente pediu para ligar após as 18h..." className="fieldwork-form-input min-h-[92px] resize-none" /></div>{(userRole === 'admin' || userRole === 'owner') && members?.length > 0 && <div><label className="fieldwork-form-label" htmlFor="new-lead-owner">Responsável</label><select id="new-lead-owner" name="assignedTo" className="fieldwork-form-input"><option value="">Atribuir a mim</option>{members.map((member) => <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>)}</select></div>}<div><label className="fieldwork-form-label" htmlFor="new-lead-step">Etapa inicial do pipeline</label><select id="new-lead-step" name="stepId" className="fieldwork-form-input">{steps.map((step) => <option key={step.id} value={step.id}>{step.title}</option>)}</select></div>{errorMsg && <div className="fieldwork-auth-error">{errorMsg}</div>}<footer className="fieldwork-modal-actions"><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-secondary-button">Cancelar</button><button type="submit" disabled={loading} className="fieldwork-primary-button disabled:opacity-50">{loading ? 'A guardar...' : 'Guardar lead'}</button></footer></form></div></div></ModalPortal>}
  </>
}
