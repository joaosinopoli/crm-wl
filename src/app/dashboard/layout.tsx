import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/src/app/actions/auth'
import NewLeadModal from '@/src/components/NewLeadModal'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select(`full_name, role, company_id, companies (name, plan_type)`).eq('id', user.id).single()
  const { data: steps } = await supabase.from('funnel_steps').select('id, title, color, position').order('position', { ascending: true })

  let customFields: any[] = []
  if (profile?.company_id) {
    const { data: fieldsData } = await supabase.from('custom_field_definitions').select('id, field_key, field_label, field_type, position').eq('company_id', profile.company_id).order('position', { ascending: true })
    customFields = fieldsData || []
  }

  let members: any[] = []
  if (profile?.role === 'admin' && profile?.company_id) {
    const { data: membersData } = await supabase.from('profiles').select('id, full_name, role').eq('company_id', profile.company_id)
    members = membersData || []
  }

  const companyName = (profile?.companies as any)?.name || 'CRM Workspace'
  const userName = profile?.full_name || user.email || 'Usuário'
  const userRole = profile?.role || 'sales'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-lg font-black text-blue-600 truncate">{companyName}</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            📊 Resumo Financeiro
          </Link>
          <Link href="/dashboard/kanban" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            Funil de Vendas (Kanban)
          </Link>
          <Link href="/dashboard/agenda" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            Agenda
          </Link>
          <Link href="/dashboard/leads" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            Todos os Leads (Abertos)
          </Link>
          <Link href="/dashboard/arquivados" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
            🗃️ Arquivados (Histórico)
          </Link>
          {profile?.role === 'admin' && (
            <>
              <Link href="/dashboard/team" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
                Equipe
              </Link>
              <Link href="/dashboard/form-builder" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
                Formulário do Lead
              </Link>
              <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors">
                Configurações
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-900 truncate">{userName}</span>
              <span className="text-xs text-gray-500 truncate capitalize">{userRole}</span>
            </div>
          </div>
          <form action={logout} className="mt-2">
            <button type="submit" className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Sair do sistema</button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold text-gray-900">Portal do Vendedor</h1>
          <NewLeadModal steps={steps || []} members={members} userRole={userRole} customFields={customFields} />
        </header>

        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}