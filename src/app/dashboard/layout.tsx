import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import NewLeadModal from '@/src/components/NewLeadModal'
import DashboardNav, { MobileDashboardNav } from '@/src/components/DashboardNav'

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
  if (profile?.role === 'admin' && profile?.company_id) {
    const { data: membersData } = await supabase.from('profiles').select('id, full_name, role').eq('company_id', profile.company_id)
    members = (membersData || []).map(member => ({ ...member, full_name: member.full_name || '' }))
  }

  const companyName = (profile?.companies as { name?: string } | null)?.name || 'CRM Workspace'
  const userRole = profile?.role || 'sales'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav companyName={companyName} userRole={userRole} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <MobileDashboardNav userRole={userRole} />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Workspace comercial</p>
              <h1 className="truncate text-base font-bold text-gray-900 md:text-xl">Portal do vendedor</h1>
            </div>
          </div>
          <NewLeadModal steps={steps || []} members={members} userRole={userRole} customFields={customFields} />
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
