import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Mínima */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">CRM<span className="text-gray-900">PRO</span></span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Já tenho uma conta
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative pt-20 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
              Gestão de leads inteligente para <br className="hidden md:block" />
              <span className="text-blue-600">acelerar suas vendas.</span>
            </h1>
            
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              Seja para uma concessionária de motocicletas ou uma imobiliária, nosso CRM se adapta ao seu nicho. Acompanhe retornos, visualize seu funil e feche mais negócios.
            </p>
            
            <div className="flex justify-center gap-4">
              <Link href="/signup" className="px-8 py-4 text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                Criar minha conta agora
              </Link>
              <a href="#features" className="px-8 py-4 text-lg font-medium rounded-lg text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
                Ver recursos
              </a>
            </div>
          </div>
        </div>

        {/* Features Mockup */}
        <div id="features" className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl font-bold">1</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Campos Dinâmicos</h3>
                <p className="text-gray-600">Personalize os dados dos seus clientes. Adicione campos como "Modelo da Moto" ou "Bairro de Interesse" em segundos.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl font-bold">2</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Kanban Drag-and-Drop</h3>
                <p className="text-gray-600">Mova seus leads pelas etapas do seu funil de vendas de forma visual e fluida.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl font-bold">3</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Tenant Seguro</h3>
                <p className="text-gray-600">Seus dados são blindados. Cada empresa possui um ambiente isolado com políticas rigorosas de segurança.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}