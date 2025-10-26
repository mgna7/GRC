import { useCallback, useEffect, useState } from 'react'
import { instancesAPI, analysisAPI } from '../../../services/api'
import { ActivityItem, AnalysisRecord, DashboardStats, InstanceRecord } from '../types'

const initialStats: DashboardStats = {
  totalInstances: 0,
  activeInstances: 0,
  totalAnalyses: 0,
  recentAnalyses: 0,
  complianceScore: 0,
  pendingItems: 0,
}

const normalizeInstances = (payload: any): InstanceRecord[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const normalizeAnalyses = (payload: any): AnalysisRecord[] => {
  if (Array.isArray(payload?.analyses)) return payload.analyses
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const isWithinDays = (dateString?: string, days = 7) => {
  if (!dateString) return false
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false
  const diff = Date.now() - date.getTime()
  return diff <= days * 24 * 60 * 60 * 1000
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [instancesResponse, analysesResponse] = await Promise.all([
        instancesAPI.getAll(),
        analysisAPI.getAll(),
      ])
      const instances = normalizeInstances(instancesResponse)
      const analysisList = normalizeAnalyses(analysesResponse)
      const activeInstances = instances.filter((item) => item.status === 'active').length
      const recentAnalyses = analysisList.filter((item) => isWithinDays(item.created_at, 7)).length
      const pendingItems = analysisList.filter((item) => item.status && item.status !== 'completed').length
      const completed = analysisList.filter((item) => item.status === 'completed').length
      const complianceScore = analysisList.length ? Math.round((completed / analysisList.length) * 100) : 0
      setStats({
        totalInstances: instances.length,
        activeInstances,
        totalAnalyses: analysisList.length,
        recentAnalyses,
        complianceScore,
        pendingItems,
      })
      const activities: ActivityItem[] = [
        ...instances.slice(0, 5).map((item) => ({
          id: item.id,
          type: 'instance' as const,
          title: item.name || 'ServiceNow instance',
          timestamp: item.created_at || new Date().toISOString(),
          status: item.status === 'error' ? 'error' : 'success',
        })),
        ...analysisList.slice(0, 5).map((item) => ({
          id: item.id,
          type: 'analysis' as const,
          title: item.title || item.analysis_type || 'Analysis run',
          timestamp: item.created_at || new Date().toISOString(),
          status: item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'warning',
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6)
      setActivity(activities)
      setAnalyses(analysisList)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { stats, activity, analyses, loading, error, reload: load }
}
