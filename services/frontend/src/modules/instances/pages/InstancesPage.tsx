import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import LanIcon from '@mui/icons-material/Lan'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import { useNavigate } from 'react-router-dom'
import { instancesAPI } from '../../../services/api'
import { LoadingScreen } from '../../../components/common/LoadingScreen'
import { PageHeader } from '../../../components/common/PageHeader'
import { ErrorBanner } from '../../../components/common/ErrorBanner'
import { EmptyState } from '../../../components/common/EmptyState'
import { getErrorMessage } from '../../../utils/error'

type Instance = {
  id: string
  name: string
  url: string
  auth_type: 'oauth' | 'basic'
  status: string
  last_sync_at?: string
  last_connection_test_at?: string
  connection_status?: string
  description?: string
  created_at?: string
}

type DatasetPreview = {
  id: string
  dataset_type: string
  record_count: number
  last_synced_at: string
  payload: Array<Record<string, unknown>>
}

export const InstancesPage = () => {
  const navigate = useNavigate()
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [datasetDialog, setDatasetDialog] = useState<{ open: boolean; instance?: Instance; datasets: DatasetPreview[]; loading: boolean }>(
    { open: false, datasets: [], loading: false }
  )

  useEffect(() => {
    fetchInstances()
  }, [])

  const fetchInstances = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await instancesAPI.getAll()
      setInstances(data)
    } catch (err: any) {
      const message = getErrorMessage(err, 'Failed to load ServiceNow instances.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async (instance: Instance) => {
    try {
      setTestingId(instance.id)
      await instancesAPI.testConnection(instance.id)
      await fetchInstances()
    } catch (err: any) {
      const message = getErrorMessage(err, 'Connection test failed.')
      setError(message)
    } finally {
      setTestingId(null)
    }
  }

  const handleSync = async (instance: Instance) => {
    try {
      setSyncingId(instance.id)
      await instancesAPI.sync(instance.id, { sync_type: 'manual' })
      await fetchInstances()
    } catch (err: any) {
      const message = getErrorMessage(err, 'Sync failed.')
      setError(message)
    } finally {
      setSyncingId(null)
    }
  }

  const handleDelete = async (instance: Instance) => {
    if (!confirm(`Delete ${instance.name}? This cannot be undone.`)) return
    try {
      setDeletingId(instance.id)
      await instancesAPI.delete(instance.id)
      await fetchInstances()
    } catch (err: any) {
      const message = getErrorMessage(err, 'Failed to delete instance.')
      setError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDatasets = async (instance: Instance) => {
    setDatasetDialog({ open: true, instance, datasets: [], loading: true })
    try {
      const response = await instancesAPI.getDatasets(instance.id)
      setDatasetDialog({ open: true, instance, datasets: response, loading: false })
    } catch (err: any) {
      const message = getErrorMessage(err, 'Unable to load dataset preview.')
      setDatasetDialog({ open: true, instance, datasets: [], loading: false })
      setError(message)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <PageHeader
            title="ServiceNow Instances"
            subtitle="Manage connectors and orchestrate ingestion across tenants"
            backTo="/dashboard"
            backLabel="Back to dashboard"
            actions={
              <Button variant="contained" onClick={() => navigate('/instances/new')}>
                Connect instance
              </Button>
            }
          />

          {error && <ErrorBanner message={error} onRetry={fetchInstances} />}

          {instances.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<LanIcon fontSize="inherit" />}
                  title="No ServiceNow instances"
                  description="Connect your first instance to start ingesting controls, risks, and compliance data."
                  actionLabel="Connect instance"
                  onAction={() => navigate('/instances/new')}
                />
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {instances.map((instance) => {
                const statusColor = instance.status === 'active' ? 'success' : instance.status === 'error' ? 'error' : 'warning'
                return (
                  <Grid item xs={12} md={6} key={instance.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader
                        title={instance.name}
                        subheader={instance.url}
                        action={<Chip label={instance.status} color={statusColor as any} variant="outlined" />}
                      />
                      <CardContent>
                        <Stack spacing={2}>
                          {instance.description && (
                            <Typography variant="body2" color="text.secondary">
                              {instance.description}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={3} flexWrap="wrap">
                            <InfoChip label="Auth" value={instance.auth_type === 'oauth' ? 'OAuth 2.0' : 'Basic'} />
                            <InfoChip label="Last sync" value={formatTimestamp(instance.last_sync_at)} />
                            <InfoChip label="Connection" value={instance.connection_status || 'Unknown'} />
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleTest(instance)}
                              disabled={testingId === instance.id || syncingId === instance.id}
                            >
                              {testingId === instance.id ? <CircularProgress size={16} /> : 'Test connection'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSync(instance)}
                              startIcon={<RefreshIcon fontSize="small" />}
                              disabled={syncingId === instance.id || testingId === instance.id}
                            >
                              {syncingId === instance.id ? <CircularProgress size={16} /> : 'Sync data'}
                            </Button>
                            <Button size="small" variant="text" onClick={() => handleViewDatasets(instance)} startIcon={<InfoIcon fontSize="small" />}>
                              View datasets
                            </Button>
                            <IconButton color="error" onClick={() => handleDelete(instance)} disabled={deletingId === instance.id}>
                              {deletingId === instance.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </Stack>
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

      <Dialog
        open={datasetDialog.open}
        onClose={() => setDatasetDialog({ open: false, datasets: [], loading: false })}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Datasets • {datasetDialog.instance?.name}</DialogTitle>
        <DialogContent>
          {datasetDialog.loading ? (
            <Box py={4} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : datasetDialog.datasets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No datasets have been synchronized yet. Run a sync to populate controls, risks, and compliance requirements.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {datasetDialog.datasets.map((dataset) => (
                <Box key={dataset.id} sx={{ border: '1px solid rgba(148,163,184,0.4)', borderRadius: 2, p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {dataset.dataset_type}
                    </Typography>
                    <Chip label={`${dataset.record_count} records`} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Last synced {new Date(dataset.last_synced_at).toLocaleString()}
                  </Typography>
                  <Stack spacing={0.5} mt={1}>
                    {dataset.payload.slice(0, 3).map((record, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {Object.entries(record)
                          .slice(0, 3)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ')}
                      </Typography>)
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const formatTimestamp = (value?: string) => {
  if (!value) return 'Never'
  return new Date(value).toLocaleString()
}

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value || '—'}</Typography>
  </Stack>
)
