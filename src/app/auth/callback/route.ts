// ESSA LINHA É A MÁGICA QUE RESOLVE O ERRO PKCE NA VERCEL
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Captura erros bloqueados direto na tela do Google
  const providerError = searchParams.get('error_description')
  if (providerError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(providerError)}`)
  }
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // 2. Captura erros internos do Supabase (ex: PKCE, erro de cookie, etc)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({ name: 'Minha Empresa (Google)', plan_type: 'free' })
          .select()
          .single()

        if (!companyError && newCompany) {
          await supabase.from('profiles').insert({
            id: user.id,
            company_id: newCompany.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            role: 'admin'
          })

          await supabase.from('funnel_steps').insert([
            { company_id: newCompany.id, title: 'Primeiro Contato', color: 'bg-blue-100', position: 0 },
            { company_id: newCompany.id, title: 'Em Negociação', color: 'bg-yellow-100', position: 1 },
            { company_id: newCompany.id, title: 'Fechamento', color: 'bg-green-100', position: 2 }
          ])
        }
      }
    }

    // Sucesso absoluto! Vai pro dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // Se o código não veio na URL
  return NextResponse.redirect(`${origin}/login?error=Código de autenticação ausente. Tente novamente.`)
}