import Link from 'next/link'
import { importLeads } from '@/src/app/actions/import-leads'

export default function ImportLeadsPage() {
  async function handleImport(formData: FormData) {
    'use server'
    await importLeads(formData)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/leads" className="text-sm font-bold text-blue-600 hover:text-blue-800">← Voltar para clientes</Link>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-blue-600">Qualidade de dados</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Importar leads</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">Traga uma base existente para o workspace sem duplicar contactos por e-mail ou telefone.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]">
        <form action={handleImport} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-7">
          <label htmlFor="file" className="mb-2 block text-sm font-bold text-gray-800">Ficheiro CSV</label>
          <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block w-full cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
          <p className="mt-3 text-xs leading-5 text-gray-500">Máximo de 500 linhas e 2 MB. Linhas repetidas serão ignoradas automaticamente.</p>
          <button type="submit" className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">Validar e importar</button>
        </form>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-950">
          <h3 className="font-black">Formato recomendado</h3>
          <p className="mt-2 leading-6 text-blue-800">Use estes cabeçalhos na primeira linha. As colunas extras entram nos campos personalizados.</p>
          <code className="mt-5 block overflow-x-auto rounded-xl bg-white/80 p-4 text-[11px] leading-5 text-blue-900">Nome,Email,Telefone,Valor,Interesse{`\n`}Mariana,mariana@empresa.com,11999999999,2500,Plano anual</code>
          <p className="mt-4 text-xs leading-5 text-blue-700">O lead é colocado na primeira etapa do funil e atribuído ao utilizador que executa a importação.</p>
        </div>
      </div>
    </div>
  )
}
