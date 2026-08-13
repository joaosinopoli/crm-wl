import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTeamMembers, createEmployee } from '@/src/app/actions/team'
import Link from 'next/link'
import EditEmployeeModal from '@/src/components/EditEmployeeModal'
import type { Member } from '@/src/types/crm'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const members = await getTeamMembers()

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Funcionários</h2>
          <p className="text-sm text-gray-500 mt-1">Cadastre novos membros, controle permissões e recupere acessos.</p>
        </div>
        <Link 
          href="/dashboard"
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          &larr; Voltar ao Funil
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Membro</h3>
          
          <form action={async (formData) => {
            'use server'
            const result = await createEmployee(formData)
            if (result && !result.success) {
              console.error(result.error)
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                name="fullName" 
                type="text" 
                required
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Acesso</label>
              <input 
                name="email" 
                type="email" 
                required
                placeholder="carlos@suaempresa.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Inicial</label>
              <input 
                name="password" 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permissão / Função</label>
              <select 
                name="role" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sales">Vendedor (Vê apenas seus leads)</option>
                <option value="admin">Administrador (Vê tudo e gerencia equipe)</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm mt-2"
            >
              Cadastrar Funcionário
            </button>
          </form>
        </div>

        {/* Tabela de Membros da Equipe */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Equipe Atual ({members.length})</h3>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {members && members.length > 0 ? (
                  members.map((member: Member) => (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{member.full_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {member.role === 'admin' ? 'Administrador' : 'Vendedor'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <EditEmployeeModal member={member} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}