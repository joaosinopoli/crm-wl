'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/utils/supabase/server'
import { DEFAULT_WORKSPACE_SETTINGS, type WorkspaceRole, type WorkspaceSettings } from '@/src/types/workspace'

const fallbackSlug = (companyName: string, companyId: string) => {
  const normalized = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)
  return `${normalized || 'workspace'}-${companyId.slice(0, 8)}`
}

function mergeWorkspaceSettings(companyId: string, companyName: string, value?: Partial<WorkspaceSettings> | null): WorkspaceSettings {
  return {
    workspace_slug: value?.workspace_slug || fallbackSlug(companyName, companyId),
    ...DEFAULT_WORKSPACE_SETTINGS,
    ...value,
    company_id: companyId,
    feature_flags: value?.feature_flags || {},
  }
}

async function getViewer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, company_id, companies(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.company_id) return null
  const company = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies
  const { data: membership } = await supabase
    .from('workspace_memberships')
    .select('role, is_active')
    .eq('company_id', profile.company_id)
    .eq('user_id', user.id)
    .maybeSingle()

  const role = (membership?.is_active ? membership.role : profile.role) as WorkspaceRole
  return { supabase, user, profile, companyName: company?.name || 'CRM Workspace', role }
}

export async function getWorkspaceSettings(): Promise<WorkspaceSettings | null> {
  const viewer = await getViewer()
  if (!viewer) return null

  const { data } = await viewer.supabase
    .from('workspace_settings')
    .select('*')
    .eq('company_id', viewer.profile.company_id)
    .maybeSingle()

  return mergeWorkspaceSettings(viewer.profile.company_id, viewer.companyName, data as Partial<WorkspaceSettings> | null)
}

export async function updateWorkspaceSettings(formData: FormData) {
  const viewer = await getViewer()
  if (!viewer || !['owner', 'admin'].includes(viewer.role)) return { success: false, error: 'Apenas administradores podem alterar o workspace.' }

  const portalName = String(formData.get('portalName') || '').trim()
  const workspaceSlug = String(formData.get('workspaceSlug') || '').trim().toLowerCase()
  const industryKey = String(formData.get('industryKey') || 'general').trim()
  const primaryColor = String(formData.get('brandPrimaryColor') || DEFAULT_WORKSPACE_SETTINGS.brand_primary_color).trim()
  const secondaryColor = String(formData.get('brandSecondaryColor') || DEFAULT_WORKSPACE_SETTINGS.brand_secondary_color).trim()
  const accentColor = String(formData.get('brandAccentColor') || DEFAULT_WORKSPACE_SETTINGS.brand_accent_color).trim()
  const timezone = String(formData.get('timezone') || DEFAULT_WORKSPACE_SETTINGS.timezone).trim()
  const currency = String(formData.get('currency') || DEFAULT_WORKSPACE_SETTINGS.currency).trim().toUpperCase()
  const leadLabelPlural = String(formData.get('leadLabelPlural') || DEFAULT_WORKSPACE_SETTINGS.lead_label_plural).trim()
  const customerLabelPlural = String(formData.get('customerLabelPlural') || DEFAULT_WORKSPACE_SETTINGS.customer_label_plural).trim()
  const pipelineLabel = String(formData.get('pipelineLabel') || DEFAULT_WORKSPACE_SETTINGS.pipeline_label).trim()

  const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)
  if (portalName.length < 2 || portalName.length > 80) return { success: false, error: 'O nome do workspace deve ter entre 2 e 80 caracteres.' }
  if (!/^[a-z0-9][a-z0-9-]{2,62}$/.test(workspaceSlug)) return { success: false, error: 'O slug deve usar apenas letras minúsculas, números e hífens.' }
  if (![primaryColor, secondaryColor, accentColor].every(isHex)) return { success: false, error: 'As cores precisam estar no formato hexadecimal.' }

  const { error } = await viewer.supabase.from('workspace_settings').upsert({
    company_id: viewer.profile.company_id,
    workspace_slug: workspaceSlug,
    portal_name: portalName,
    industry_key: industryKey,
    brand_primary_color: primaryColor,
    brand_secondary_color: secondaryColor,
    brand_accent_color: accentColor,
    timezone,
    currency,
    lead_label_plural: leadLabelPlural,
    customer_label_plural: customerLabelPlural,
    pipeline_label: pipelineLabel,
  }, { onConflict: 'company_id' })

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
