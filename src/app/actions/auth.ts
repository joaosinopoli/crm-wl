'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Não foi possível autenticar o usuário')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const fullName = formData.get('fullName') as string
  const companyName = formData.get('companyName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Tenta criar o usuário no sistema de autenticação do Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    console.error('ERRO SUPABASE AUTH:', authError.message)
    
    // Tratamento amigável caso esbarre no limite de taxa de e-mails do Supabase
    if (authError.message.includes('rate limit')) {
      return redirect('/signup?message=Limite de cadastros atingido no Supabase. Aguarde alguns minutos ou desative o rate limit no painel.')
    }
    
    return redirect(`/signup?message=${encodeURIComponent(authError.message)}`)
  }

  if (!authData.user) {
    return redirect('/signup?message=Erro desconhecido ao criar usuário.')
  }

  // 2. Chama a função no banco para provisionar o Tenant e o Perfil
  const { error: rpcError } = await supabase.rpc('provision_new_tenant', {
    new_user_id: authData.user.id,
    new_company_name: companyName,
    new_full_name: fullName
  })

  if (rpcError) {
    console.error('ERRO SUPABASE RPC:', rpcError.message)
    return redirect('/signup?message=Erro ao configurar o ambiente da sua empresa.')
  }

  // 3. Tudo deu certo. Atualiza o cache e joga pro dashboard
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}