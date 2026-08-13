import { createClient } from '@/src/utils/supabase/server'

export type UserRole = 'admin' | 'sales'

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

  if (!profile?.company_id || (profile.role !== 'admin' && profile.role !== 'sales')) {
    return { supabase, user, profile: null }
  }

  return {
    supabase,
    user,
    profile: {
      ...profile,
      role: profile.role as UserRole,
      company_id: profile.company_id,
    } satisfies UserProfile,
  }
}

export function isAdmin(role: UserRole) {
  return role === 'admin'
}

export function isSales(role: UserRole) {
  return role === 'sales'
}
