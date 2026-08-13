'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ContactRound,
  FileBarChart,
  History,
  KanbanSquare,
  LayoutDashboard,
  Menu,
  Settings,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react'

type UserRole = string

type NavItem = {
  href: string
  label: string
  description: string
  icon: typeof LayoutDashboard
  badge?: string
}

const operationItems: NavItem[] = [
  { href: '/dashboard', label: 'Visão geral', description: 'Indicadores e resumo comercial', icon: LayoutDashboard },
  { href: '/dashboard/kanban', label: 'Funil de vendas', description: 'Negociações em movimento', icon: KanbanSquare },
  { href: '/dashboard/leads', label: 'Clientes ativos', description: 'Base de leads em aberto', icon: ContactRound },
  { href: '/dashboard/tasks', label: 'Tarefas e follow-ups', description: 'Próximas ações comerciais', icon: ClipboardCheck, badge: 'Novo' },
  { href: '/dashboard/agenda', label: 'Agenda', description: 'Compromissos e reuniões', icon: CalendarDays },
]

const insightItems: NavItem[] = [
  { href: '/dashboard/relatorios', label: 'Relatórios', description: 'Desempenho por etapa e período', icon: FileBarChart },
  { href: '/dashboard/arquivados', label: 'Histórico de vendas', description: 'Negócios ganhos e perdidos', icon: History },
]

const adminItems: NavItem[] = [
  { href: '/dashboard/team', label: 'Equipe', description: 'Pessoas e responsabilidades', icon: UsersRound },
  { href: '/dashboard/form-builder', label: 'Campos personalizados', description: 'Dados específicos do negócio', icon: SlidersHorizontal },
  { href: '/dashboard/settings', label: 'Configurações', description: 'Funil e workspace', icon: Settings },
]

function isItemActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
}

function NavLink({ item, pathname, compact = false }: { item: NavItem; pathname: string; compact?: boolean }) {
  const Icon = item.icon
  const active = isItemActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      title={item.description}
      className={`group flex items-center gap-3 rounded-xl transition-all ${compact ? 'px-3 py-3' : 'px-3.5 py-2.5'} ${active ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
      aria-current={active ? 'page' : undefined}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-blue-600'}`}>
        <Icon size={16} strokeWidth={active ? 2.4 : 2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{item.label}</span>
        {!compact && <span className="mt-0.5 block truncate text-[10px] font-medium text-gray-400 group-hover:text-gray-500">{item.description}</span>}
      </span>
      {item.badge && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">{item.badge}</span>}
    </Link>
  )
}

function NavGroup({ label, items, pathname, compact = false }: { label: string; items: NavItem[]; pathname: string; compact?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className={`flex items-center gap-2 px-3.5 pb-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 ${compact ? 'pt-3' : 'pt-5'}`}>
        <span>{label}</span>
        <span className="h-px flex-1 bg-gray-100" />
      </div>
      {items.map((item) => <NavLink key={item.href} item={item} pathname={pathname} compact={compact} />)}
    </div>
  )
}

export default function DashboardNav({ companyName, userRole }: { companyName: string; userRole: UserRole }) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[286px] shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="flex h-[76px] items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><BarChart3 size={18} /></div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black tracking-tight text-gray-900">{companyName}</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.13em] text-blue-600">CRM Workspace</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-3" aria-label="Navegação principal">
        <NavGroup label="Operação" items={operationItems} pathname={pathname} />
        <NavGroup label="Inteligência" items={insightItems} pathname={pathname} />
        {userRole === 'admin' && <NavGroup label="Gestão" items={adminItems} pathname={pathname} />}
      </nav>
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="px-3 text-[10px] leading-4 text-gray-400">Dica: use a Visão geral para começar o dia e Tarefas para decidir o próximo contacto.</p>
      </div>
    </aside>
  )
}

export function MobileDashboardNav({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative lg:hidden">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Fechar navegação' : 'Abrir navegação'} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm">
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-50 w-[min(330px,calc(100vw-32px))] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
          <div className="mb-1 flex items-center justify-between px-3 py-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-gray-400">Navegação</span>
            <ChevronDown size={15} className="rotate-180 text-gray-400" />
          </div>
          <NavGroup label="Operação" items={operationItems} pathname={pathname} compact />
          <NavGroup label="Inteligência" items={insightItems} pathname={pathname} compact />
          {userRole === 'admin' && <NavGroup label="Gestão" items={adminItems} pathname={pathname} compact />}
        </div>
      )}
    </div>
  )
}
