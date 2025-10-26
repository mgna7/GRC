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
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { analysisAPI, instancesAPI } from '../../../services/api'
import { PageHeader } from '../../../components/common/PageHeader'
import { ErrorBanner } from '../../../components/common/ErrorBanner'
import { LoadingScreen } from '../../../components/common/LoadingScreen'
import { getErrorMessage } from '../../../utils/error'

type InstanceOption = {
  id: string
  name: string
  url: string
  status: string
}

export const RunAnalysisPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const instanceFromQuery = searchParams.get('instance')

  const [instances, setInstances] = useState<InstanceOption[]>([])
  const [selectedInstance, setSelectedInstance] = useState(instanceFromQuery || '')
  const [analysisType, setAnalysisType] = useState<'comprehensive' | 'risk' | 'control' | 'compliance'>('comprehensive')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingInstances, setLoadingInstances] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    try {
      setLoadingInstances(true)
      const data = await instancesAPI.getAll()
      const active = data.filter((item: InstanceOption) => item.status === 'active')
      setInstances(active)
      if (!instanceFromQuery && active.length) {
        setSelectedInstance(active[0].id)
      }
      if (instanceFromQuery) {
        const match = active.find((inst) => inst.id === instanceFromQuery)
        if (!match) setSelectedInstance(active.length ? active[0].id : '')
      }
    } catch (err: any) {
      const message = getErrorMessage(err, 'Unable to load ServiceNow instances.')
      setError(message)
    } finally {
      setLoadingInstances(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedInstance) {
      setError('Select an instance to continue.')
      return
    }
    if (!title.trim()) {
      setError('Provide a title for this analysis.')
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      await analysisAPI.create({
        instance_id: selectedInstance,
        analysis_type: analysisType,
        title: title.trim(),
        description: notes.trim() || undefined,
      })
      navigate('/analysis')
    } catch (err: any) {
      const message = getErrorMessage(err, 'Unable to start the analysis.')
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInstances && instances.length === 0) {
    return <LoadingScreen />
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <PageHeader
            title="Run new analysis"
            subtitle="Launch the AI engine against your ServiceNow datasets"
            backTo="/analysis"
            backLabel="Back to analyses"
          />

          {error && <ErrorBanner message={error} />}

          <Card>
            <CardHeader title="Select ServiceNow instance" />
            <CardContent>
              {instances.length === 0 ? (
                <Stack spacing={2} alignItems="flex-start">
                  <Typography>No active instances available. Connect one to continue.</Typography>
                  <Button variant="contained" onClick={() => navigate('/instances/new')}>
                    Connect instance
                  </Button>
                </Stack>
              ) : (
                <ToggleButtonGroup
                  value={selectedInstance}
                  exclusive
                  onChange={(_, value) => value && setSelectedInstance(value)}
                  color="primary"
                  orientation="vertical"
                  fullWidth
                  sx={{ alignItems: 'stretch' }}
                >
                  {instances.map((instance) => (
                    <ToggleButton key={instance.id} value={instance.id} sx={{ justifyContent: 'space-between', gap: 2 }}>
                      <Stack alignItems="flex-start">
                        <Typography variant="subtitle2">{instance.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {instance.url}
                        </Typography>
                      </Stack>
                      <Chip label={instance.status} color={instance.status === 'active' ? 'success' : 'warning'} size="small" variant="outlined" />
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Analysis configuration" />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Analysis title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g., Quarterly compliance sweep"
                  required
                />
                <ToggleButtonGroup value={analysisType} exclusive onChange={(_, value) => value && setAnalysisType(value)} color="primary">
                  <ToggleButton value="comprehensive">Comprehensive</ToggleButton>
                  <ToggleButton value="risk">Risk</ToggleButton>
                  <ToggleButton value="control">Controls</ToggleButton>
                  <ToggleButton value="compliance">Compliance</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  label="Notes"
                  placeholder="Optional context for this run"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  multiline
                  minRows={3}
                />
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => navigate('/analysis')}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={!selectedInstance || submitting}>
                    {submitting ? <CircularProgress size={20} color="inherit" /> : 'Start analysis'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
