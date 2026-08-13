import { ArrowRight, BarChart3, CheckCircle2, Inbox, Layers3, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/src/utils/supabase/server'
import { redirect } from 'next/navigation'
import GoogleLoginButton from '@/src/components/GoogleLoginButton'

// Fieldwork OS: a página pública deve vender clareza operacional, não promessas genéricas de crescimento.
export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="fieldwork-public-shell">
      <header className="fieldwork-public-header">
        <Link href="/" className="fieldwork-wordmark">
          <span className="fieldwork-wordmark-mark">ƒ</span>
          <span>fieldwork<span className="text-[var(--coral)]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#sistema" className="fieldwork-public-nav-link">Como funciona</a>
          <a href="#nichos" className="fieldwork-public-nav-link">Para quem é</a>
          <Link href="/login" className="fieldwork-public-nav-link">Entrar <ArrowRight size={13} /></Link>
        </nav>
        <Link href="/signup" className="fieldwork-primary-button">Criar workspace <ArrowRight size={14} /></Link>
      </header>

      <main>
        <section className="fieldwork-public-hero">
          <div className="fieldwork-public-hero-copy">
            <p className="fieldwork-page-kicker">CRM white-label para equipas em movimento</p>
            <h1>O próximo passo<br /><em>não se perde.</em></h1>
            <p className="fieldwork-public-lede">Fieldwork organiza leads, conversas, tarefas e pipeline numa operação que qualquer negócio consegue adaptar à sua própria linguagem.</p>
            <div className="fieldwork-public-actions">
              <GoogleLoginButton label="Começar grátis com Google" />
              <Link href="/signup" className="fieldwork-primary-button fieldwork-primary-button-large">Começar com e-mail <ArrowRight size={16} /></Link>
            </div>
            <p className="fieldwork-public-microcopy"><ShieldCheck size={13} /> Multi-tenant, permissões por equipa e identidade da sua marca.</p>
          </div>

          <div className="fieldwork-public-visual" aria-label="Pré-visualização do workspace">
            <div className="fieldwork-surface-note">
              <span>OPERAÇÃO / AGORA</span>
              <strong>O que merece atenção?</strong>
              <small>3 próximos movimentos sugeridos</small>
            </div>
            <div className="fieldwork-mini-pipeline">
              <div className="fieldwork-mini-column"><span>Entrada <b>04</b></span><i /><i /><i /></div>
              <div className="fieldwork-mini-column is-focus"><span>Em conversa <b>07</b></span><i /><i /><i /><i /></div>
              <div className="fieldwork-mini-column"><span>Proposta <b>02</b></span><i /><i /></div>
            </div>
            <div className="fieldwork-mini-inbox"><span className="fieldwork-mini-inbox-avatar">M</span><div><b>Marina respondeu</b><small>“Podemos falar amanhã às 10?”</small></div><span className="fieldwork-mini-inbox-dot" /></div>
          </div>
        </section>

        <section id="sistema" className="fieldwork-public-system">
          <div className="fieldwork-public-section-head"><p className="fieldwork-page-kicker">Uma base, quatro leituras</p><h2>Menos abas abertas.<br /><em>Mais contexto em cada movimento.</em></h2></div>
          <div className="fieldwork-public-capabilities">
            <div><Inbox size={20} /><span>01</span><h3>Inbox com contexto</h3><p>Conversa, histórico e próxima tarefa no mesmo lugar — sem depender da memória individual.</p></div>
            <div><Layers3 size={20} /><span>02</span><h3>Pipeline que se adapta</h3><p>Etapas, campos e vocabulário configuráveis para serviços, saúde, educação, imobiliário ou retalho.</p></div>
            <div><BarChart3 size={20} /><span>03</span><h3>Leitura da operação</h3><p>Relatórios que mostram onde o valor está e quais follow-ups estão a escapar.</p></div>
          </div>
        </section>

        <section id="nichos" className="fieldwork-public-niches">
          <div><p className="fieldwork-page-kicker">A sua operação, a sua marca</p><h2>O CRM não obriga<br /><em>o negócio a caber nele.</em></h2></div>
          <div className="fieldwork-niche-list">
            <span>Serviços profissionais <CheckCircle2 size={14} /></span>
            <span>Imobiliário e vendas consultivas <CheckCircle2 size={14} /></span>
            <span>Saúde e educação <CheckCircle2 size={14} /></span>
            <span>Retalho e operações locais <CheckCircle2 size={14} /></span>
            <span>Tecnologia e equipas comerciais <CheckCircle2 size={14} /></span>
          </div>
        </section>
      </main>

      <footer className="fieldwork-public-footer">
        <Link href="/" className="fieldwork-wordmark"><span className="fieldwork-wordmark-mark">ƒ</span><span>fieldwork<span className="text-[var(--coral)]">.</span></span></Link>
        <span>Um sistema de trabalho para relações que importam.</span>
        <Link href="/login" className="fieldwork-public-nav-link">Já tenho uma conta <ArrowRight size={13} /></Link>
      </footer>
    </div>
  )
}
