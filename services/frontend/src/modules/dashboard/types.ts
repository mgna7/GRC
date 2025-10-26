export type InstanceRecord = {
  id: string
  name?: string
  status?: string
  created_at?: string
  last_sync?: string | null
}

export type AnalysisRecord = {
  id: string
  analysis_type?: string
  status?: string
  created_at?: string
  message?: string
  title?: string
}

export type DashboardStats = {
  totalInstances: number
  activeInstances: number
  totalAnalyses: number
  recentAnalyses: number
  complianceScore: number
  pendingItems: number
}

export type ActivityItem = {
  id: string
  type: 'instance' | 'analysis'
  title: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}
