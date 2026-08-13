import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createFunnelStep, updateFunnelStep, reorderFunnelStep, createCustomField } from '@/src/app/actions/kanban'
import type { FunnelStep } from '@/src/types/crm'

export default async function SettingsPage() {
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

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single()

  const { data: steps } = await supabase
    .from('funnel_steps')
    .select('*')
    .order('position', { ascending: true })


  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Empresa</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie os dados do seu workspace, as etapas do funil e escolha quais campos aparecem no modal de cadastro de leads.</p>
      </div>

      <div className="space-y-8">
        {/* Card de Informações da Empresa */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dados do Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Nome da Empresa</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{company?.name}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Plano Atual</label>
              <p className="text-sm font-medium text-blue-600 capitalize mt-1">{company?.plan_type || 'Free'}</p>
            </div>
          </div>
        </div>

        

          <form action={async (formData) => {
            'use server'
            await createCustomField(formData)
          }} className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <input 
              name="fieldLabel" 
              type="text" 
              required
              placeholder="Nome do campo (Ex: Interesse do lead ou Limite de gasto)"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              name="fieldType"
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
            </select>
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Adicionar Campo
            </button>
          </form>
        </div>

        {/* Card de Gestão, Edição e Ordenação das Etapas do Funil */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Etapas do Funil (Kanban)</h3>
          <p className="text-sm text-gray-500 mb-6">Altere a ordem de exibição das abas, edite títulos ou adicione novas colunas.</p>

          <div className="space-y-4 mb-8">
            {steps?.map((step: FunnelStep, index: number) => (
              <div 
                key={step.id} 
                className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex sm:flex-col gap-1 shrink-0">
                  <form action={async () => {
                    'use server'
                    await reorderFunnelStep(step.id, 'up')
                  }}>
                    <button 
                      type="submit" 
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 text-xs font-bold"
                    >
                      ▲
                    </button>
                  </form>
                  <form action={async () => {
                    'use server'
                    await reorderFunnelStep(step.id, 'down')
                  }}>
                    <button 
                      type="submit" 
                      disabled={steps && index === steps.length - 1}
                      className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 text-xs font-bold"
                    >
                      ▼
                    </button>
                  </form>
                </div>

                <form 
                  action={async (formData) => {
                    'use server'
                    await updateFunnelStep(formData)
                  }}
                  className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full"
                >
                  <input type="hidden" name="stepId" value={step.id} />
                  
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <input 
                    name="title" 
                    type="text" 
                    defaultValue={step.title}
                    required
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />

                  <select 
                    name="color"
                    defaultValue={step.color || 'bg-gray-100'}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bg-gray-100">Cinza</option>
                    <option value="bg-blue-100">Azul</option>
                    <option value="bg-yellow-100">Amarelo</option>
                    <option value="bg-green-100">Verde</option>
                    <option value="bg-purple-100">Roxo</option>
                  </select>

                  <button 
                    type="submit"
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-900 transition-colors shrink-0 w-full sm:w-auto"
                  >
                    Salvar
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Adicionar Nova Etapa</h4>
            <form 
              action={async (formData) => {
                'use server'
                await createFunnelStep(formData)
              }} 
              className="flex flex-col sm:flex-row gap-4"
            >
              <input 
                name="title" 
                type="text" 
                required
                placeholder="Nome da nova etapa (Ex: Proposta Enviada)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select 
                name="color"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bg-gray-100">Cinza Padrão</option>
                <option value="bg-blue-100">Azul Suave</option>
                <option value="bg-yellow-100">Amarelo Alerta</option>
                <option value="bg-green-100">Verde Sucesso</option>
                <option value="bg-purple-100">Roxo Destaque</option>
              </select>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Adicionar Etapa
              </button>
            </form>
          </div>
        </div>
      </div>
  )
}