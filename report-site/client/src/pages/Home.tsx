// Editorial Systems Briefing: esta página transforma o relatório em uma leitura operacional, não num dashboard genérico.
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clipboard,
  CloudCog,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  Flag,
  GitBranch,
  Github,
  LockKeyhole,
  Menu,
  MoveRight,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

const ASSETS = {
  mark: "/manus-storage/crm-fieldnote-mark_442bcd99.png",
  hero: "/manus-storage/editorial-hero_44df2e1f.jpg",
  security: "/manus-storage/security-geometry_cfe01345.jpg",
  tasks: "/manus-storage/tasks-editorial_994e0e2b.jpg",
  roadmap: "/manus-storage/roadmap-horizon_75d39657.jpg",
};

const sections = [
  { id: "overview", label: "Visão geral", index: "00" },
  { id: "deliveries", label: "Entregas", index: "01" },
  { id: "validation", label: "Validação", index: "02" },
  { id: "action", label: "Ação necessária", index: "03" },
  { id: "next", label: "Próximo movimento", index: "04" },
];

const deliveries = [
  {
    icon: ShieldCheck,
    tone: "cobalt",
    title: "Autorização que respeita o tenant",
    description:
      "Leads, etapas, notas, fechos e campos personalizados agora validam sessão, empresa e responsável antes de alterar dados.",
    tag: "SECURITY / CORE",
  },
  {
    icon: Clipboard,
    tone: "coral",
    title: "Follow-up com lugar próprio",
    description:
      "A nova rota de tarefas liga atividades a leads, prazos, prioridades e responsáveis — e separa atrasadas, hoje, próximas e concluídas.",
    tag: "TASKS / NEW",
  },
  {
    icon: UsersRound,
    tone: "sage",
    title: "Equipa mais previsível",
    description:
      "Papéis válidos, confirmação dentro da empresa e proteção contra a remoção acidental do último administrador.",
    tag: "TEAM / HARDENED",
  },
  {
    icon: Code2,
    tone: "ink",
    title: "Contratos que atravessam o produto",
    description:
      "Leads, agenda, equipa, campos e tarefas partilham tipos explícitos; os casts any deixam de esconder riscos.",
    tag: "TYPES / CLEAN",
  },
];

const checks = [
  { command: "npm run lint", result: "PASS", note: "sem erros" },
  { command: "npm run build", result: "PASS", note: "14 rotas" },
  { command: "git diff --check", result: "PASS", note: "limpo" },
];

function SectionMarker({ number, label }: { number: string; label: string }) {
  return (
    <div className="section-marker">
      <span>{number}</span>
      <i />
      <strong>{label}</strong>
    </div>
  );
}

function AppMark({ small = false }: { small?: boolean }) {
  return (
    <img
      className={small ? "app-mark app-mark--small" : "app-mark"}
      src={ASSETS.mark}
      alt="CRM Field Note"
    />
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-16% 0px -68% 0px", threshold: [0.05, 0.2, 0.5] },
    );
    sections.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  const activeLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label ?? "Visão geral",
    [activeSection],
  );

  async function copyCommit() {
    await navigator.clipboard?.writeText("22dc38c");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <aside className="evidence-rail" aria-label="Índice do relatório">
        <a className="rail-brand" href="#overview" aria-label="Voltar ao início">
          <AppMark small />
          <span>CRM<br />/FN</span>
        </a>
        <div className="rail-rule" />
        <div className="rail-spine" aria-hidden="true" />
        <div className="rail-index">
          <span className="rail-caption">INDEX / 05</span>
          {sections.map((section) => (
            <a
              key={section.id}
              className={activeSection === section.id ? "rail-link is-active" : "rail-link"}
              href={`#${section.id}`}
              aria-current={activeSection === section.id ? "location" : undefined}
            >
              <span>{section.index}</span>
              <b>{section.label}</b>
            </a>
          ))}
        </div>
        <div className="rail-footer">
          <span className="rail-dot" />
          <span>STATUS<br /><strong>DELIVERED</strong></span>
        </div>
      </aside>

      <div className="page-content">
        <header className="topbar">
          <div className="mobile-brand">
            <AppMark small />
            <span>CRM / FIELD NOTE</span>
          </div>
          <div className="topbar-context">
            <span className="live-dot" />
            <span>{activeLabel}</span>
          </div>
          <div className="topbar-actions">
            <a href="https://github.com/joaosinopoli/crm-wl/tree/feature/tasks-and-security" target="_blank" rel="noreferrer">
              <Github size={15} />
              <span>Ver branch</span>
            </a>
            <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {menuOpen && (
            <nav className="mobile-menu" aria-label="Navegação móvel">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} onClick={closeMenu}>
                  <span>{section.index}</span>{section.label}<ChevronRight size={14} />
                </a>
              ))}
            </nav>
          )}
        </header>

        <main>
          <section id="overview" className="hero-section page-section">
            <div className="hero-copy">
              <div className="hero-identity reveal-up"><AppMark small /><div><span>CRM WHITE LABEL</span><strong>FIELD NOTE / 01</strong></div></div>
              <div className="eyebrow reveal-up"><CircleDot size={13} /> DELIVERY NOTE / 13.08.26</div>
              <h1 className="display-title reveal-up reveal-delay-1">O produto cresceu.<br /><em>Agora a equipa vê porquê.</em></h1>
              <p className="hero-description reveal-up reveal-delay-2">
                Um briefing operacional sobre o primeiro incremento do CRM White Label: segurança mais explícita, follow-ups no lugar certo e uma base pronta para o próximo movimento.
              </p>
              <div className="hero-actions reveal-up reveal-delay-3">
                <a className="primary-button" href="#deliveries">Ler as entregas <ArrowUpRight size={16} /></a>
                <a className="text-link" href="https://github.com/joaosinopoli/crm-wl/tree/feature/tasks-and-security" target="_blank" rel="noreferrer">Abrir no GitHub <ExternalLink size={14} /></a>
              </div>
              <div className="hero-meta reveal-up reveal-delay-4">
                <div><span>INCREMENTO</span><strong>01 / FOUNDATION</strong></div>
                <div><span>COMMIT</span><strong>22DC38C</strong></div>
                <div><span>BRANCH</span><strong>FEATURE / TASKS</strong></div>
              </div>
              <div className="hero-proof reveal-up reveal-delay-4"><span className="proof-check"><Check size={12} /></span><strong>SHIP / READY FOR REVIEW</strong><span>22DC38C</span></div>
            </div>
            <div className="hero-art-wrap reveal-in">
              <img className="hero-art" src={ASSETS.hero} alt="Caderno editorial com folhas de briefing e marcadores de estado" />
              <div className="hero-stamp"><span>FIRST</span><strong>INCREMENT</strong><small>CRM / WL</small></div>
              <div className="hero-art-note"><span className="note-line" /> SHIPPED TO REVIEW</div>
            </div>
            <div className="scroll-cue"><span>SCROLL TO TRACE THE WORK</span><MoveRight size={14} /></div>
          </section>

          <section id="deliveries" className="report-section page-section">
            <div className="section-heading">
              <SectionMarker number="01" label="Entregas implementadas" />
              <div>
                <p className="kicker">O que mudou na base</p>
                <h2>Mais do que features.<br /><em>Decisões que seguram o produto.</em></h2>
              </div>
              <p className="section-lead">A primeira entrega não tentou resolver tudo. Escolheu os pontos que aumentam confiança agora e abrem espaço para a velocidade depois.</p>
            </div>

            <div className="delivery-grid">
              <article className="delivery-feature delivery-feature--security">
                <div className="delivery-feature-copy">
                  <div className="card-topline"><span>01</span><span>SECURITY / CORE</span></div>
                  <div className="status-stamp status-stamp--cobalt">TENANT / SAFE</div>
                  <LockKeyhole size={21} className="feature-icon" />
                  <h3>O tenant deixou de ser uma suposição.</h3>
                  <p>As mutações críticas passaram a verificar sessão, empresa e papel no servidor. É a diferença entre confiar no caminho feliz e proteger o caminho real.</p>
                  <a className="inline-arrow" href="#action">Ver o que aplicar <ArrowUpRight size={15} /></a>
                </div>
                <img src={ASSETS.security} alt="Geometrias encaixadas que representam limites de autorização" />
              </article>

              <article className="delivery-feature delivery-feature--tasks">
                <div className="delivery-feature-copy">
                  <div className="card-topline"><span>02</span><span>TASKS / NEW</span></div>
                  <div className="status-stamp status-stamp--coral">FOLLOW-UP / LIVE</div>
                  <Clipboard size={21} className="feature-icon" />
                  <h3>Follow-up deixa de viver na cabeça de alguém.</h3>
                  <p>A equipa tem agora tarefas com lead, data, prioridade, responsável e estado — agrupadas para decidir o que merece atenção hoje.</p>
                  <a className="inline-arrow" href="#validation">Ver a validação <ArrowUpRight size={15} /></a>
                </div>
                <img src={ASSETS.tasks} alt="Sequência de cartões editoriais representando tarefas e follow-ups" />
              </article>

              <div className="delivery-list">
                {deliveries.slice(2).map((delivery) => {
                  const Icon = delivery.icon;
                  return (
                    <article className={`delivery-row delivery-row--${delivery.tone}`} key={delivery.title}>
                      <div className="delivery-row-icon"><Icon size={18} /></div>
                      <div><div className="card-topline"><span>{delivery.tag}</span></div><h3>{delivery.title}</h3><p>{delivery.description}</p></div>
                      <ChevronRight size={18} className="row-arrow" />
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="validation" className="validation-section page-section">
            <div className="validation-intro">
              <SectionMarker number="02" label="Validação executada" />
              <p className="kicker">CHECK / PASS</p>
              <h2>O código não só mudou.<br /><em>Foi verificado.</em></h2>
              <p>Lint, build e integridade do diff passaram na branch publicada. Não é uma promessa de ausência de risco: é um ponto de controlo visível para a equipa continuar a trabalhar.</p>
            </div>
            <div className="checks-panel">
              <div className="checks-panel-header"><span>PIPELINE / LOCAL</span><span className="proof-commit">22DC38C</span><span className="pass-label"><span className="live-dot live-dot--sage" /> ALL SYSTEMS CLEAR</span></div>
              {checks.map((check, index) => (
                <div className="check-row" key={check.command}>
                  <span className="check-number">0{index + 1}</span>
                  <Code2 size={15} />
                  <code>{check.command}</code>
                  <span className="check-note">{check.note}</span>
                  <strong><Check size={14} /> {check.result}</strong>
                </div>
              ))}
              <div className="route-count"><span>ROUTES IN BUILD</span><strong>14</strong><span>INCLUDING</span><code>/dashboard/tasks</code></div>
            </div>
          </section>

          <section id="action" className="action-section page-section">
            <div className="action-panel">
              <div className="action-copy">
                <SectionMarker number="03" label="Ação necessária" />
                <p className="kicker kicker--light">BEFORE REAL DATA</p>
                <h2>Uma migration entre o relatório e o primeiro teste real.</h2>
                <p>Antes de testar tarefas no ambiente Supabase, aplicar a migration que cria a tabela, os índices, o trigger de atualização e as políticas RLS.</p>
                <div className="file-chip"><FileCode2 size={16} /><code>supabase/migrations/20260813170000_create_tasks.sql</code></div>
                <div className="action-links"><a className="primary-button primary-button--light" href="https://github.com/joaosinopoli/crm-wl/blob/feature/tasks-and-security/supabase/migrations/20260813170000_create_tasks.sql" target="_blank" rel="noreferrer">Abrir migration <ExternalLink size={15} /></a><span>Service Role Key permanece apenas no servidor.</span></div>
              </div>
              <div className="action-code" aria-label="Resumo dos passos da migration">
                <div className="code-header"><span><span className="code-dot code-dot--red" /><span className="code-dot code-dot--yellow" /><span className="code-dot code-dot--green" /></span><span>supabase / sql editor</span><Database size={14} /></div>
                <div className="code-body">
                  <span className="code-line"><i>01</i><b>create table</b> public.tasks</span>
                  <span className="code-line"><i>02</i><b>create index</b> tasks_company_due</span>
                  <span className="code-line"><i>03</i><b>enable row level</b> security</span>
                  <span className="code-line"><i>04</i><b>create policy</b> tasks_select</span>
                  <span className="code-line"><i>05</i><b>create trigger</b> updated_at</span>
                  <span className="code-line code-line--comment"><i>06</i>-- compare base schema first</span>
                </div>
              </div>
            </div>
          </section>

          <section id="next" className="next-section page-section">
            <div className="section-heading section-heading--next">
              <SectionMarker number="04" label="Próximo movimento" />
              <div><p className="kicker">A seguir</p><h2>Fechar o ciclo.<br /><em>Depois, ampliar o campo.</em></h2></div>
              <p className="section-lead">A recomendação é simples: primeiro provar o fluxo com dados reais, depois dar ao CRM a memória e o alcance que a equipa vai pedir.</p>
            </div>
            <div className="next-layout">
              <div className="roadmap-art-wrap"><img src={ASSETS.roadmap} alt="Linha de roadmap com três marcos editoriais até ao horizonte" /><div className="roadmap-caption"><Flag size={14} /> ROADMAP / NEXT SIGNAL</div></div>
              <div className="roadmap-list">
                <div className="roadmap-item roadmap-item--now"><span>NOW</span><div><h3>Aplicar migration + validar sessão.</h3><p>Confirmar criação, conclusão e isolamento de tarefas contra o Supabase real.</p></div><CircleDot size={16} /></div>
                <div className="roadmap-item"><span>NEXT</span><div><h3>Versionar o schema base.</h3><p>Tornar um ambiente novo reproduzível e criar testes cross-tenant.</p></div><CircleDot size={16} /></div>
                <div className="roadmap-item"><span>THEN</span><div><h3>Dar memória à relação.</h3><p>Timeline de atividades, etiquetas, pesquisa global e integrações oficiais.</p></div><CircleDot size={16} /></div>
              </div>
            </div>
          </section>

          <section className="share-section">
            <div className="share-mark"><AppMark /><span>CRM / FIELD NOTE</span></div>
            <div><p className="kicker">READY TO SHARE</p><h2>Levar o contexto para a próxima conversa.</h2></div>
            <div className="share-actions"><button className="commit-button" onClick={copyCommit}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Commit copiado" : "Copiar commit"}</button><a className="primary-button" href="https://github.com/joaosinopoli/crm-wl/tree/feature/tasks-and-security" target="_blank" rel="noreferrer">Abrir no GitHub <Github size={15} /></a></div>
          </section>
        </main>

        <footer className="site-footer"><span>CRM WHITE LABEL / DELIVERY NOTE</span><span>BUILT FOR THE NEXT ITERATION</span><a href="https://github.com/joaosinopoli/crm-wl" target="_blank" rel="noreferrer">joaosinopoli/crm-wl <ArrowUpRight size={13} /></a></footer>
      </div>
    </div>
  );
}
