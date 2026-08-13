'use client'

import { CheckCircle2, CircleX, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { closeLead } from '@/src/app/actions/kanban'
import CurrencyInput from '@/src/components/CurrencyInput'
import ModalPortal from '@/src/components/ModalPortal'

type Lead = { id: string; name: string; lead_value?: number | null }

// Fieldwork OS: fechar uma negociação deve tornar o resultado explícito e preservar a aprendizagem comercial.
export default function CloseLeadModal({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false); const [status, setStatus] = useState<'won' | 'lost'>('won'); const [loading, setLoading] = useState(false)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); const formData = new FormData(event.currentTarget); formData.append('status', status); formData.append('leadId', lead.id); const response = await closeLead(formData); setLoading(false); if (response.success) { setIsOpen(false); window.location.reload() } }
  return <><button type="button" onClick={(event) => { event.stopPropagation(); setIsOpen(true) }} className="fieldwork-close-action"><CheckCircle2 size={13} /> Finalizar</button>{isOpen && <ModalPortal><div className="fieldwork-modal-backdrop" onClick={() => setIsOpen(false)}><div className="fieldwork-modal-card max-w-md" onClick={(event) => event.stopPropagation()}><header className="fieldwork-modal-header"><div><p className="fieldwork-page-kicker">Resultado da negociação</p><h2>Fechar negócio.</h2><p>{lead.name}</p></div><button type="button" onClick={() => setIsOpen(false)} className="fieldwork-modal-close" aria-label="Fechar"><X size={17} /></button></header><div className="fieldwork-close-toggle"><button type="button" onClick={() => setStatus('won')} className={status === 'won' ? 'is-won' : ''}><Trophy size={15} /> Ganha</button><button type="button" onClick={() => setStatus('lost')} className={status === 'lost' ? 'is-lost' : ''}><CircleX size={15} /> Perdida</button></div><form onSubmit={handleSubmit} className="fieldwork-modal-form">{status === 'won' ? <div><label className="fieldwork-form-label" htmlFor={`close-value-${lead.id}`}>Valor da venda</label><CurrencyInput name="leadValue" defaultValue={lead.lead_value || ''} required placeholder="R$ 0,00" className="fieldwork-form-input fieldwork-currency-input" /><p className="fieldwork-form-hint">Este valor entra na leitura financeira do workspace.</p></div> : <div><label className="fieldwork-form-label" htmlFor={`close-observation-${lead.id}`}>Motivo da perda</label><textarea id={`close-observation-${lead.id}`} name="observation" rows={3} required placeholder="Ex.: timing, preço ou concorrência..." className="fieldwork-form-input min-h-[100px] resize-none" /></div>}<button type="submit" disabled={loading} className="fieldwork-primary-button w-full justify-center disabled:opacity-50">{loading ? 'A processar...' : 'Confirmar e arquivar'}</button></form></div></div></ModalPortal>}</>
}
