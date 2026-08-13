import Link from 'next/link'
import { signup } from '@/src/app/actions/auth'
import GoogleLoginButton from '@/src/components/GoogleLoginButton'

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Crie sua conta</h1>
          <p className="text-sm text-gray-500 font-medium">Comece a transformar seus leads em clientes hoje mesmo.</p>
        </div>

        {/* Botão do Google focado em facilidade */}
        <GoogleLoginButton />

        {/* Divisor Visual */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ou</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Formulário de Criação Manual */}
        <form action={signup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Empresa / Loja</label>
            <input 
              name="companyName" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="Ex: Base Dois Açaí" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu Nome Completo</label>
            <input 
              name="fullName" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="Ex: João Victor" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="seu@email.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              placeholder="Crie uma senha forte" 
            />
          </div>
          
          {searchParams?.error && (
            <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-xl border border-red-100">
              {searchParams.error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm mt-2"
          >
            Criar Conta Gratuitamente
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 font-medium mt-8">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}