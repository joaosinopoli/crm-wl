import { login } from '@/src/app/actions/auth'
import Link from 'next/link'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams?.message

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Rota de Fuga: Voltar para Landing Page */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o site
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            CRM White Label
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={login}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="vendedor@suaempresa.com.br"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mt-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                {/* Rota de Fuga: Esqueci a senha */}
                <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>

        {/* Rota de Fuga: Criar nova conta */}
        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Ainda não tem uma conta?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Teste grátis agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}