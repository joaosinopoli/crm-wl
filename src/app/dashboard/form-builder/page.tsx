import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import FormBuilderClient from '@/src/components/FormBuilderClient'

export default async function FormBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'owner') {
    redirect('/dashboard')
  }

  const { data: customFields } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('position', { ascending: true })

  return (
    <div className="fieldwork-form-builder-page mx-auto flex w-full max-w-5xl flex-col">
      <div className="fieldwork-page-intro">
        <div>
          <p className="fieldwork-page-kicker">11 / Linguagem da operação</p>
          <h1 className="fieldwork-page-title">O seu processo<br /><em className="not-italic text-[var(--brand-primary)]">tem campos próprios.</em></h1>
          <p className="fieldwork-page-copy">Crie e organize os dados que a equipa precisa para entender cada lead, sem transformar o formulário num obstáculo.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <FormBuilderClient initialFields={customFields || []} />
      </div>
    </div>
  )
}
