// Fieldwork OS: o shell deve parecer um centro de operações white-label, não um template de dashboard.
import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search } from 'lucide-react'
import { logout } from '@/src/app/actions/auth'
import NewLeadModal from '@/src/components/NewLeadModal'
import DashboardNav, { MobileDashboardNav } from '@/src/components/DashboardNav'
import { getWorkspaceSettings } from '@/src/app/actions/workspace'

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

  let customFields: { id: string; field_key: string; field_label: string; field_type: string; position: number }[] = []
  if (profile?.company_id) {
    const { data: fieldsData } = await supabase.from('custom_field_definitions').select('id, field_key, field_label, field_type, position').eq('company_id', profile.company_id).order('position', { ascending: true })
    customFields = fieldsData || []
  }

  let members: { id: string; full_name: string; role: string }[] = []
  if ((profile?.role === 'admin' || profile?.role === 'owner') && profile?.company_id) {
    const { data: membersData } = await supabase.from('profiles').select('id, full_name, role').eq('company_id', profile.company_id)
    members = (membersData || []).map(member => ({ ...member, full_name: member.full_name || '' }))
  }

  const companyName = (profile?.companies as { name?: string } | null)?.name || 'CRM Workspace'
  const userRole = profile?.role || 'sales'
  const userName = profile?.full_name || user.email || 'Usuário'
  const workspace = await getWorkspaceSettings()

  const primaryColor = workspace?.brand_primary_color || '#3158D4'

  return (
    <div className="fieldwork-shell" style={{ '--brand-primary': primaryColor } as React.CSSProperties}>
      <DashboardNav companyName={workspace?.portal_name || companyName} userRole={userRole} brandPrimaryColor={workspace?.brand_primary_color} leadLabel={workspace?.customer_label_plural || 'Clientes ativos'} pipelineLabel={workspace?.pipeline_label || 'Funil de vendas'}>
        <div className="fieldwork-rail-account">
          <div className="fieldwork-account-row">
            <div className="fieldwork-account-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div className="min-w-0"><span className="fieldwork-account-name">{userName}</span><span className="fieldwork-account-role">{userRole === 'owner' ? 'Owner' : userRole === 'admin' ? 'Administrador' : userRole === 'manager' ? 'Gestor' : userRole === 'viewer' ? 'Visualizador' : 'Vendedor'}</span></div>
          </div>
          <form action={logout}><button type="submit" className="fieldwork-logout">Sair do sistema</button></form>
        </div>
      </DashboardNav>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="fieldwork-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <MobileDashboardNav userRole={userRole} brandPrimaryColor={workspace?.brand_primary_color} leadLabel={workspace?.customer_label_plural || 'Clientes ativos'} pipelineLabel={workspace?.pipeline_label || 'Funil de vendas'} />
            <div className="min-w-0">
              <div className="fieldwork-breadcrumb"><span>WORKSPACE</span><b>/</b><strong>{workspace?.portal_name || companyName}</strong></div>
              <h1 className="truncate text-base font-black tracking-[-0.03em] text-[var(--ink)] md:text-xl">O que merece atenção hoje?</h1>
            </div>
          </div>
          <div className="fieldwork-topbar-actions">
            <Link href="/dashboard/leads" className="fieldwork-search-link"><Search size={15} /><span>Pesquisar contactos</span><kbd>⌘ K</kbd></Link>
            <button type="button" className="fieldwork-icon-button" aria-label="Notificações"><Bell size={17} /><i /></button>
            <NewLeadModal steps={steps || []} members={members} userRole={userRole} customFields={customFields} />
          </div>
        </header>
        <main className="fieldwork-main">
          {children}
        </main>
      </div>
    </div>
  )
}
