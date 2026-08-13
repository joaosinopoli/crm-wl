import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createFunnelStep, updateFunnelStep, reorderFunnelStep, createCustomField } from '@/src/app/actions/kanban'
import type { FunnelStep } from '@/src/types/crm'
import { getWorkspaceSettings, updateWorkspaceSettings } from '@/src/app/actions/workspace'
import { INDUSTRY_PRESETS } from '@/src/types/workspace'

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

  const workspace = await getWorkspaceSettings()
  async function saveWorkspaceSettings(formData: FormData) {
    'use server'
    await updateWorkspaceSettings(formData)
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Configurações do workspace</h2>
        <p className="text-sm text-gray-500 mt-1">Configure a identidade white-label, o vocabulário do seu negócio, as etapas do funil e os campos personalizados.</p>
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

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900">Identidade e contexto do negócio</h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg">White-label</span>
            </div>
            <p className="text-sm text-gray-500">A mesma plataforma adapta o nome, a marca e o processo comercial a qualquer nicho.</p>
          </div>

          <form action={saveWorkspaceSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome apresentado no portal</label>
                <input name="portalName" defaultValue={workspace?.portal_name || company?.name || 'CRM Workspace'} required maxLength={80} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug do workspace</label>
                <input name="workspaceSlug" defaultValue={workspace?.workspace_slug || ''} pattern="[a-z0-9][a-z0-9-]{2,62}" required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nicho principal</label>
              <select name="industryKey" defaultValue={workspace?.industry_key || 'general'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {INDUSTRY_PRESETS.map((preset) => <option key={preset.key} value={preset.key}>{preset.label} — {preset.description}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Cor primária</label><div className="flex gap-2"><input name="brandPrimaryColor" type="color" defaultValue={workspace?.brand_primary_color || '#2563eb'} className="h-10 w-12 rounded-lg border border-gray-200 bg-white p-1" /><input aria-label="Hex da cor primária" value={workspace?.brand_primary_color || '#2563eb'} readOnly className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-gray-500" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Cor secundária</label><div className="flex gap-2"><input name="brandSecondaryColor" type="color" defaultValue={workspace?.brand_secondary_color || '#0f172a'} className="h-10 w-12 rounded-lg border border-gray-200 bg-white p-1" /><input aria-label="Hex da cor secundária" value={workspace?.brand_secondary_color || '#0f172a'} readOnly className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-gray-500" /></div></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Cor de destaque</label><div className="flex gap-2"><input name="brandAccentColor" type="color" defaultValue={workspace?.brand_accent_color || '#22c55e'} className="h-10 w-12 rounded-lg border border-gray-200 bg-white p-1" /><input aria-label="Hex da cor de destaque" value={workspace?.brand_accent_color || '#22c55e'} readOnly className="min-w-0 flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-gray-500" /></div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome dos leads</label><input name="leadLabelPlural" defaultValue={workspace?.lead_label_plural || 'Leads'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome dos clientes</label><input name="customerLabelPlural" defaultValue={workspace?.customer_label_plural || 'Clientes'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome do pipeline</label><input name="pipelineLabel" defaultValue={workspace?.pipeline_label || 'Funil de vendas'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Fuso horário</label><select name="timezone" defaultValue={workspace?.timezone || 'America/Sao_Paulo'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="America/Sao_Paulo">São Paulo (UTC−03:00)</option><option value="America/New_York">Nova York</option><option value="Europe/Lisbon">Lisboa</option><option value="UTC">UTC</option></select></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Moeda padrão</label><select name="currency" defaultValue={workspace?.currency || 'BRL'} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="BRL">BRL — Real brasileiro</option><option value="EUR">EUR — Euro</option><option value="USD">USD — Dólar americano</option><option value="GBP">GBP — Libra</option></select></div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100"><p className="text-xs text-gray-500">Estas definições servem como base para personalizar cada workspace sem duplicar o produto.</p><button type="submit" className="shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">Guardar identidade</button></div>
          </form>
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
