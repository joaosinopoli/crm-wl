export type UserRole = 'admin' | 'sales'

export type Member = {
  id: string
  full_name: string
  role: UserRole | string
}

export type FunnelStep = {
  id: string
  title: string
  color?: string
  position?: number
}

export type CustomField = {
  id: string
  field_key: string
  field_label: string
  field_type: string
  position?: number
}

export type CustomData = Record<string, string | number | null>

export type Lead = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  step_id?: string | null
  assigned_to?: string | null
  custom_data?: CustomData | null
  observation?: string | null
  lead_value?: number | null
  status?: string
  created_at?: string | null
  closed_at?: string | null
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null
  funnel_steps?: { id: string; title: string; color?: string } | { id: string; title: string; color?: string }[] | null
}

export type Appointment = {
  id: string
  title: string
  appointment_date: string
  appointment_time: string
  lead_id?: string | null
  leads?: { name: string } | { name: string }[] | null
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null
}

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'completed' | 'cancelled'

export type Task = {
  id: string
  company_id: string
  lead_id: string | null
  assigned_to: string
  created_by: string
  title: string
  description: string | null
  due_at: string
  priority: TaskPriority
  status: TaskStatus
  completed_at: string | null
  created_at: string
  updated_at: string
  lead?: { id: string; name: string } | null
  assignee?: { full_name: string | null } | null
}

export type TaskFormResult = {
  success: boolean
  error?: string
}
