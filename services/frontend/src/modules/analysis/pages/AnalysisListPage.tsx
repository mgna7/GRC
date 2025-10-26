import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import TimelineIcon from '@mui/icons-material/Timeline'
import { useNavigate } from 'react-router-dom'
import { analysisAPI } from '../../../services/api'
import { LoadingScreen } from '../../../components/common/LoadingScreen'
import { PageHeader } from '../../../components/common/PageHeader'
import { ErrorBanner } from '../../../components/common/ErrorBanner'
import { EmptyState } from '../../../components/common/EmptyState'
import { getErrorMessage } from '../../../utils/error'

type Analysis = {
  id: string
  instance_id: string
  analysis_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  task_id?: string
  created_at: string
  completed_at?: string
  message?: string
  title?: string
  description?: string
}

const statusChips: Record<Analysis['status'], { label: string; color: 'default' | 'success' | 'warning' | 'error'; emoji: string }> = {
  pending: { label: 'Pending', color: 'warning', emoji: '⏳' },
  running: { label: 'Running', color: 'warning', emoji: '▶️' },
  completed: { label: 'Completed', color: 'success', emoji: '✅' },
  failed: { label: 'Failed', color: 'error', emoji: '❌' },
}

export const AnalysisListPage = () => {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all')

  useEffect(() => {
    fetchAnalyses()
    const interval = setInterval(() => {
      if (analyses.some((item) => item.status === 'running' || item.status === 'pending')) {
        fetchAnalyses()
      }
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analysisAPI.getAll()
      const collection = Array.isArray(data) ? data : data?.analyses || []
      setAnalyses(collection)
    } catch (err: any) {
      const message = getErrorMessage(err, 'Failed to load analyses.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return analyses
    if (filter === 'running') return analyses.filter((a) => a.status === 'running' || a.status === 'pending')
    return analyses.filter((a) => a.status === filter)
  }, [analyses, filter])

  const summary = {
    all: analyses.length,
    completed: analyses.filter((a) => a.status === 'completed').length,
    running: analyses.filter((a) => a.status === 'running' || a.status === 'pending').length,
    failed: analyses.filter((a) => a.status === 'failed').length,
  }

  if (loading && analyses.length === 0) {
    return <LoadingScreen />
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <PageHeader
            title="AI Analyses"
            subtitle="Track control, risk, and compliance evaluations across every instance"
            backTo="/dashboard"
            actions={
              <Button variant="contained" onClick={() => navigate('/analysis/new')}>
                Run analysis
              </Button>
            }
          />

          {error && <ErrorBanner message={error} onRetry={fetchAnalyses} />}

          <ToggleButtonGroup value={filter} exclusive onChange={(_, value) => value && setFilter(value)} color="primary">
            <ToggleButton value="all">All ({summary.all})</ToggleButton>
            <ToggleButton value="running">In progress ({summary.running})</ToggleButton>
            <ToggleButton value="completed">Completed ({summary.completed})</ToggleButton>
            <ToggleButton value="failed">Failed ({summary.failed})</ToggleButton>
          </ToggleButtonGroup>

          {filtered.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<TimelineIcon fontSize="inherit" />}
                  title="No analyses to display"
                  description={
                    filter === 'all'
                      ? 'Launch your first analysis to generate AI-driven compliance insights.'
                      : `No ${filter} analyses found presently.`
                  }
                  actionLabel="Run analysis"
                  onAction={() => navigate('/analysis/new')}
                />
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filtered.map((analysis) => {
                const meta = statusChips[analysis.status]
                return (
                  <Grid item xs={12} md={6} key={analysis.id}>
                    <Card>
                      <CardHeader
                        title={analysis.title || `${analysis.analysis_type.charAt(0).toUpperCase()}${analysis.analysis_type.slice(1)} analysis`}
                        subheader={`Instance ${analysis.instance_id}`}
                        action={<Chip label={`${meta.emoji} ${meta.label}`} color={meta.color === 'default' ? undefined : meta.color} variant="outlined" />}
                      />
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <InfoField label="Requested" value={formatDate(analysis.created_at)} />
                            <InfoField label="Completed" value={analysis.completed_at ? formatDate(analysis.completed_at) : '—'} />
                          </Stack>
                          {(analysis.description || analysis.message) && (
                            <Typography variant="body2" color="text.secondary">
                              {analysis.description || analysis.message}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  )
}

const formatDate = (value: string) => new Date(value).toLocaleString()

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
)
