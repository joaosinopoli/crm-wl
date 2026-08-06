'use server'

import { createClient } from '@/src/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return []

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role, company_id')
    .eq('company_id', profile.company_id)

  return members || []
}

export async function createEmployee(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem cadastrar funcionários.' }
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'sales'

  if (!fullName || !email || !password) {
    return { success: false, error: 'Preencha todos os campos obrigatórios.' }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { success: false, error: 'Chave de serviço não configurada no .env.local.' }
  }

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError || !authData.user) {
    console.error('Erro ao criar usuário auth:', authError?.message)
    return { success: false, error: authError?.message || 'Erro ao criar conta de usuário.' }
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      company_id: adminProfile.company_id,
      full_name: fullName,
      role: role
    })

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError.message)
    return { success: false, error: 'Erro ao associar o funcionário à empresa.' }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function updateEmployee(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autorizado.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem editar funcionários.' }
  }

  const employeeId = formData.get('employeeId') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string
  const newPassword = formData.get('newPassword') as string

  if (!employeeId || !fullName || !role) {
    return { success: false, error: 'ID, Nome e Função são obrigatórios.' }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { success: false, error: 'Chave de serviço não configurada.' }
  }

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  )

  // 1. Atualiza nome e role na tabela profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, role })
    .eq('id', employeeId)

  if (profileError) {
    return { success: false, error: 'Erro ao atualizar dados do perfil.' }
  }

  // 2. Se foi informada uma nova senha, atualiza no Auth do Supabase
  if (newPassword && newPassword.trim().length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      employeeId,
      { password: newPassword }
    )

    if (authError) {
      return { success: false, error: 'Erro ao atualizar a senha no sistema de auth.' }
    }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}