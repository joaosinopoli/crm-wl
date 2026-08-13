export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'sales' | 'viewer'

export type WorkspaceSettings = {
  id?: string
  company_id: string
  workspace_slug: string
  portal_name: string
  industry_key: string
  brand_primary_color: string
  brand_secondary_color: string
  brand_accent_color: string
  logo_url?: string | null
  favicon_url?: string | null
  timezone: string
  locale: string
  currency: string
  lead_label_singular: string
  lead_label_plural: string
  customer_label_singular: string
  customer_label_plural: string
  pipeline_label: string
  feature_flags: Record<string, boolean>
}

export const DEFAULT_WORKSPACE_SETTINGS: Omit<WorkspaceSettings, 'company_id' | 'workspace_slug'> = {
  portal_name: 'CRM Workspace',
  industry_key: 'general',
  brand_primary_color: '#2563eb',
  brand_secondary_color: '#0f172a',
  brand_accent_color: '#22c55e',
  logo_url: null,
  favicon_url: null,
  timezone: 'America/Sao_Paulo',
  locale: 'pt-BR',
  currency: 'BRL',
  lead_label_singular: 'Lead',
  lead_label_plural: 'Leads',
  customer_label_singular: 'Cliente',
  customer_label_plural: 'Clientes',
  pipeline_label: 'Funil de vendas',
  feature_flags: {},
}

export const INDUSTRY_PRESETS = [
  { key: 'general', label: 'Negócio geral', description: 'Configuração neutra para começar' },
  { key: 'services', label: 'Serviços profissionais', description: 'Projetos, propostas e contratos' },
  { key: 'real-estate', label: 'Imobiliário', description: 'Imóveis, visitas e propostas' },
  { key: 'health', label: 'Saúde e bem-estar', description: 'Leads, consultas e acompanhamento' },
  { key: 'education', label: 'Educação', description: 'Interessados, matrículas e retenção' },
  { key: 'retail', label: 'Comércio e varejo', description: 'Oportunidades e pós-venda' },
  { key: 'technology', label: 'Tecnologia e SaaS', description: 'Contas, expansão e renovação' },
  { key: 'other', label: 'Outro nicho', description: 'Personalizar vocabulário e processo' },
] as const

export type IndustryKey = (typeof INDUSTRY_PRESETS)[number]['key']
