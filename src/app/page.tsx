import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import GoogleLoginButton from '@/src/components/GoogleLoginButton'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se já tem conta e está logado, pula a landing page e vai pro CRM
  if (user) {
    redirect('/dashboard')
  }

  // Link formatado para o seu WhatsApp com mensagem pronta
  const whatsappLink = "https://wa.me/5513981091534?text=Ol%C3%A1%2C%20visitei%20o%20site%20e%20quero%20saber%20mais%20sobre%20o%20CRM!"

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* HEADER SIMPLES */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-2xl font-black text-blue-700 tracking-tighter">
          CRM<span className="text-gray-900">Pro</span>
        </div>
        <a 
          href="/login" 
          className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
        >
          Já tenho conta ➔
        </a>
      </header>

      {/* HERO SECTION - FOCADA EM CONVERSÃO */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center">
        
        <div className="inline-block bg-blue-100 text-blue-800 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6">
          Aumente suas vendas em até 40%
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight max-w-4xl leading-[1.1] mb-6">
          Pare de perder clientes no <span className="text-green-500">WhatsApp</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed font-medium">
          O único CRM feito para organizar seus atendimentos, automatizar seus retornos e garantir que <strong className="text-gray-800">nenhuma venda caia no esquecimento</strong>.
        </p>

        {/* CTA PRINCIPAL (Google) e SECUNDÁRIO (WhatsApp) */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <GoogleLoginButton />
          
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-transparent text-gray-600 font-bold text-sm py-3 hover:text-gray-900 transition-colors"
          >
            Tem dúvidas? <span className="underline decoration-green-500 decoration-2 underline-offset-4 text-gray-900">Fale com um consultor no WhatsApp</span>
          </a>
        </div>
      </main>

      {/* SESSÃO DE SOCIAL PROOF / BENEFÍCIOS RÁPIDOS */}
      <section className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          <div className="flex flex-col items-center p-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Funil Intuitivo</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Arraste e solte seus clientes por etapas. Saiba exatamente quem contatar hoje e quem está pronto para comprar.
            </p>
          </div>

          <div className="flex flex-col items-center p-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Controle Financeiro</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Tenha previsibilidade de caixa. Acompanhe relatórios de conversão e saiba exatamente quanto dinheiro está na mesa.
            </p>
          </div>

          <div className="flex flex-col items-center p-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Setup em 30 Segundos</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Sem configurações complexas. Entre com sua conta Google, personalize seus campos e comece a vender imediatamente.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} CRM Pro. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}