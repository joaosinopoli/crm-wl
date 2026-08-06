import { signup } from '@/src/app/actions/auth'
import Link from 'next/link'

export default async function SignupPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams?.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta grátis
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Comece a gerenciar seus leads em minutos.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={signup}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Seu Nome</label>
              <input id="fullName" name="fullName" type="text" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="João Silva" />
            </div>
            
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input id="companyName" name="companyName" type="text" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Sua Empresa LTDA" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail Profissional</label>
              <input id="email" name="email" type="email" required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="contato@suaempresa.com.br" />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Crie uma Senha</label>
              <input id="password" name="password" type="password" required minLength={6}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-1"
                placeholder="Mínimo de 6 caracteres" />
            </div>
          </div>

          {message && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {message}
            </div>
          )}

          <div>
            <button type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Criar Conta e Acessar
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}