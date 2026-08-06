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

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: customFields } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('position', { ascending: true })

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Construtor de Formulário do Lead</h2>
        <p className="text-sm text-gray-500 mt-1">Crie e organize os campos personalizados do seu nicho. O que você definir aqui aparecerá no modal de Novo Lead e na tela de Edição.</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <FormBuilderClient initialFields={customFields || []} />
      </div>
    </div>
  )
}