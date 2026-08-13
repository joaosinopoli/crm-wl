// Fieldwork OS: shell editorial para operações SaaS white-label. O rail organiza contexto, sinal e próximo movimento.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Activity, ArrowUpRight, CalendarDays, CheckSquare2, ChevronDown, ContactRound, FileBarChart2, History, LayoutDashboard, Menu, MessageSquareText, Settings2, SlidersHorizontal, UsersRound, X, Zap } from 'lucide-react'

type NavItem = { href: string; label: string; description: string; icon: typeof LayoutDashboard; signal?: 'hot' | 'new' }

const insightItems: NavItem[] = [
  { href: '/dashboard/relatorios', label: 'Radar de negócio', description: 'Leitura do pipeline', icon: FileBarChart2 },
  { href: '/dashboard/arquivados', label: 'Histórico', description: 'Fechos e aprendizagem', icon: History },
]

const adminItems: NavItem[] = [
  { href: '/dashboard/team', label: 'Pessoas', description: 'Papéis e responsabilidades', icon: UsersRound },
  { href: '/dashboard/form-builder', label: 'Campos', description: 'Vocabulário do processo', icon: SlidersHorizontal },
  { href: '/dashboard/automacoes', label: 'Automações', description: 'Gatilhos e próximo passo', icon: Zap },
  { href: '/dashboard/settings', label: 'Workspace', description: 'Marca e preferências', icon: Settings2 },
]

function getOperationItems(leadLabel = 'Clientes', pipelineLabel = 'Pipeline'): NavItem[] {
  return [
    { href: '/dashboard', label: 'Hoje', description: 'O que merece atenção', icon: LayoutDashboard },
    { href: '/dashboard/kanban', label: pipelineLabel, description: 'Negócios em movimento', icon: Activity, signal: 'hot' },
    { href: '/dashboard/leads', label: leadLabel, description: 'Base viva de relacionamento', icon: ContactRound },
    { href: '/dashboard/conversas', label: 'Conversas', description: 'Inbox ligada ao contexto do lead', icon: MessageSquareText, signal: 'hot' },
    { href: '/dashboard/tasks', label: 'Próximos movimentos', description: 'Ações que não podem esperar', icon: CheckSquare2, signal: 'new' },
    { href: '/dashboard/agenda', label: 'Calendário', description: 'Tempo reservado para avançar', icon: CalendarDays },
  ]
}

function activePath(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
}

function NavItemLink({ item, pathname, compact, brand }: { item: NavItem; pathname: string; compact?: boolean; brand: string }) {
  const active = activePath(pathname, item.href)
  const Icon = item.icon
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined} className={`fieldwork-nav-item group ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`} style={active ? { '--nav-brand': brand } as React.CSSProperties : undefined}>
      <span className="fieldwork-nav-index">{String(['/dashboard', '/dashboard/kanban', '/dashboard/leads', '/dashboard/conversas', '/dashboard/tasks', '/dashboard/agenda', '/dashboard/relatorios', '/dashboard/arquivados', '/dashboard/team', '/dashboard/form-builder', '/dashboard/settings'].indexOf(item.href) + 1).padStart(2, '0')}</span>
      <span className="fieldwork-nav-icon"><Icon size={17} strokeWidth={active ? 2.5 : 1.9} /></span>
      <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{item.label}</span>{!compact && <span className="mt-0.5 block truncate text-[10px] font-medium text-[var(--ink-soft)]">{item.description}</span>}</span>
      {item.signal === 'hot' && <span className="fieldwork-dot fieldwork-dot-hot" aria-label="Alta prioridade" />}
      {item.signal === 'new' && <span className="fieldwork-signal">Ação</span>}
      {active && <ArrowUpRight size={14} className="shrink-0 opacity-70" />}
    </Link>
  )
}

function NavGroup({ index, label, items, pathname, compact, brand }: { index: string; label: string; items: NavItem[]; pathname: string; compact?: boolean; brand: string }) {
  return <section className={`fieldwork-nav-group ${compact ? 'is-compact' : ''}`}><div className="fieldwork-nav-label"><span>{index}</span>{label}<i /></div>{items.map((item) => <NavItemLink key={item.href} item={item} pathname={pathname} compact={compact} brand={brand} />)}</section>
}

function FieldworkMark({ color }: { color: string }) {
  return <span className="fieldwork-mark" style={{ '--mark-color': color } as React.CSSProperties}><i /><i /><i /></span>
}

export default function DashboardNav({ companyName, userRole, brandPrimaryColor = '#3158D4', leadLabel, pipelineLabel, children }: { companyName: string; userRole: string; brandPrimaryColor?: string; leadLabel?: string; pipelineLabel?: string; children?: ReactNode }) {
  const pathname = usePathname()
  const operationItems = getOperationItems(leadLabel, pipelineLabel)
  return <aside className="fieldwork-rail hidden lg:flex">
    <div className="fieldwork-brand"><FieldworkMark color={brandPrimaryColor} /><div className="min-w-0"><p className="truncate text-sm font-black tracking-[-0.03em] text-[var(--ink)]">{companyName}</p><p className="fieldwork-kicker">CRM / FIELDWORK</p></div></div>
    <div className="fieldwork-rail-status"><span className="fieldwork-live-dot" /> Workspace online <span className="ml-auto font-mono text-[9px] text-[var(--ink-soft)]">{userRole === 'owner' ? 'OWNER' : userRole === 'admin' ? 'ADMIN' : 'TEAM'}</span></div>
    <nav className="fieldwork-nav" aria-label="Navegação principal"><NavGroup index="01" label="Operação" items={operationItems} pathname={pathname} brand={brandPrimaryColor} /><NavGroup index="02" label="Leitura" items={insightItems} pathname={pathname} brand={brandPrimaryColor} />{(userRole === 'admin' || userRole === 'owner') && <NavGroup index="03" label="Controlo" items={adminItems} pathname={pathname} brand={brandPrimaryColor} />}</nav>
    <div className="fieldwork-rail-bottom"><div className="fieldwork-next"><span className="fieldwork-kicker">PRÓXIMO MOVIMENTO</span><strong>Começar pelo Hoje</strong><span>Veja a fila antes de abrir mais frentes.</span></div>{children}</div>
  </aside>
}

export function MobileDashboardNav({ userRole, brandPrimaryColor = '#3158D4', leadLabel, pipelineLabel }: { userRole: string; brandPrimaryColor?: string; leadLabel?: string; pipelineLabel?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const operationItems = getOperationItems(leadLabel, pipelineLabel)
  return <div className="relative lg:hidden"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Fechar navegação' : 'Abrir navegação'} className="fieldwork-mobile-trigger">{open ? <X size={18} /> : <Menu size={18} />}</button>{open && <div className="fieldwork-mobile-sheet"><div className="flex items-center justify-between border-b border-[var(--line)] px-4 pb-4"><div className="flex items-center gap-2"><FieldworkMark color={brandPrimaryColor} /><span className="fieldwork-kicker">NAVEGAÇÃO</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-[var(--ink-soft)]"><ChevronDown size={16} className="rotate-180" /></button></div><NavGroup index="01" label="Operação" items={operationItems} pathname={pathname} compact brand={brandPrimaryColor} /><NavGroup index="02" label="Leitura" items={insightItems} pathname={pathname} compact brand={brandPrimaryColor} />{(userRole === 'admin' || userRole === 'owner') && <NavGroup index="03" label="Controlo" items={adminItems} pathname={pathname} compact brand={brandPrimaryColor} />}</div>}</div>
}
