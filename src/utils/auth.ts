import { createClient } from '@/src/utils/supabase/server'
import type { WorkspaceRole } from '@/src/types/workspace'

export type UserRole = WorkspaceRole

export type UserProfile = {
  id: string
  full_name: string | null
  role: UserRole
  company_id: string
}

export async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, company_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.company_id) {
    return { supabase, user, profile: null }
  }

  const { data: membership } = await supabase
    .from('workspace_memberships')
    .select('role, is_active')
    .eq('company_id', profile.company_id)
    .eq('user_id', user.id)
    .maybeSingle()

  const role = (membership?.is_active ? membership.role : profile.role) as UserRole
  if (!['owner', 'admin', 'manager', 'sales', 'viewer'].includes(role)) return { supabase, user, profile: null }

  return {
    supabase,
    user,
    profile: {
      ...profile,
      role,
      company_id: profile.company_id,
    } satisfies UserProfile,
  }
}

export function isAdmin(role: UserRole) {
  return role === 'owner' || role === 'admin'
}

export function isSales(role: UserRole) {
  return role === 'sales'
}

export function isReadOnly(role: UserRole) {
  return role === 'viewer'
}
