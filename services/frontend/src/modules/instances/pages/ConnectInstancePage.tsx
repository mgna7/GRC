import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { instancesAPI } from '../../../services/api'
import { getErrorMessage } from '../../../utils/error'

type InstanceForm = {
  name: string
  url: string
  description: string
  auth_type: 'basic' | 'oauth'
  username: string
  password: string
  client_id: string
  client_secret: string
}

type DatasetPreview = {
  id: string
  dataset_type: string
  record_count: number
  last_synced_at: string
  payload: Array<Record<string, unknown>>
}

const initialForm: InstanceForm = {
  name: '',
  url: '',
  description: '',
  auth_type: 'basic',
  username: '',
  password: '',
  client_id: '',
  client_secret: '',
}

export const ConnectInstancePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<InstanceForm>(initialForm)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncSummary, setSyncSummary] = useState<Record<string, number>>({})
  const [datasets, setDatasets] = useState<DatasetPreview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [createdInstanceId, setCreatedInstanceId] = useState<string | null>(null)

  const isBasic = formData.auth_type === 'basic'

  const handleChange = (field: keyof InstanceForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    if (field === 'auth_type') return
    if (connectionStatus !== 'idle') {
      setConnectionStatus('idle')
      setConnectionMessage('')
    }
  }

  const handleAuthToggle = (_: React.MouseEvent<HTMLElement>, value: 'basic' | 'oauth' | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, auth_type: value }))
      setConnectionStatus('idle')
      setConnectionMessage('')
    }
  }

  const handleTestConnection = async () => {
    setError(null)
    setConnectionStatus('testing')
    setConnectionMessage('')
    try {
      await instancesAPI.testCredentials({
        url: formData.url,
        auth_type: formData.auth_type,
        username: formData.username || undefined,
        password: formData.password || undefined,
        client_id: formData.client_id || undefined,
        client_secret: formData.client_secret || undefined,
      })
      setConnectionStatus('success')
      setConnectionMessage('Credentials verified. Ready to connect.')
    } catch (err: any) {
      const message = getErrorMessage(err, 'Connection test failed.')
      setConnectionStatus('error')
      setConnectionMessage(message)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        url: formData.url,
        description: formData.description,
        auth_type: formData.auth_type,
        username: isBasic ? formData.username : undefined,
        password: isBasic ? formData.password : undefined,
        client_id: !isBasic ? formData.client_id : undefined,
        client_secret: !isBasic ? formData.client_secret : undefined,
      }
      const instance = await instancesAPI.create(payload)
      setCreatedInstanceId(instance.id)
      setSaving(false)
      setSyncing(true)
      const syncResult = await instancesAPI.sync(instance.id, { sync_type: 'manual' })
      setSyncSummary(syncResult.records_synced || {})
      const datasetResponse = await instancesAPI.getDatasets(instance.id)
      setDatasets(datasetResponse)
      setSyncing(false)
      setConnectionStatus('success')
      setConnectionMessage('Instance connected and data synchronized.')
    } catch (err: any) {
      const message = getErrorMessage(err, 'Failed to save instance.')
      setError(message)
      setSaving(false)
      setSyncing(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 20% 20%, #1d4ed8 0%, #020617 55%, #020617 100%)',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Button onClick={() => navigate('/instances')} sx={{ color: '#fff', mb: 1 }}>
              ← Back to Instances
            </Button>
            <Typography variant="h3" color="#fff">
              Connect ServiceNow Instance
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.75)">
              Securely connect your instance, validate credentials, and trigger the first data sync.
            </Typography>
          </Box>

          <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Card>
                  <CardHeader title="Instance details" subheader="Basic metadata for your ServiceNow tenant" />
                  <CardContent>
                    <Stack spacing={2}>
                      <TextField label="Instance name" value={formData.name} onChange={handleChange('name')} required />
                      <TextField
                        label="ServiceNow URL"
                        value={formData.url}
                        onChange={handleChange('url')}
                        placeholder="https://your-instance.service-now.com"
                        required
                      />
                      <TextField
                        label="Description"
                        value={formData.description}
                        onChange={handleChange('description')}
                        multiline
                        minRows={3}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Authentication" subheader="Choose the method used to reach ServiceNow APIs" />
                  <CardContent>
                    <Stack spacing={3}>
                      <ToggleButtonGroup value={formData.auth_type} exclusive onChange={handleAuthToggle}>
                        <ToggleButton value="basic">Basic Auth</ToggleButton>
                        <ToggleButton value="oauth">OAuth 2.0</ToggleButton>
                      </ToggleButtonGroup>
                      {isBasic ? (
                        <Stack spacing={2}>
                          <TextField label="Username" value={formData.username} onChange={handleChange('username')} required />
                          <TextField
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            required
                          />
                        </Stack>
                      ) : (
                        <Stack spacing={2}>
                          <TextField label="Client ID" value={formData.client_id} onChange={handleChange('client_id')} required />
                          <TextField
                            label="Client Secret"
                            type="password"
                            value={formData.client_secret}
                            onChange={handleChange('client_secret')}
                            required
                          />
                        </Stack>
                      )}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={handleTestConnection}
                          disabled={connectionStatus === 'testing' || saving}
                          startIcon={connectionStatus === 'testing' ? <CircularProgress size={18} /> : undefined}
                        >
                          {connectionStatus === 'testing' ? 'Testing...' : 'Test connection'}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={saving || connectionStatus !== 'success'}
                          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                        >
                          {saving ? 'Saving...' : 'Connect instance'}
                        </Button>
                      </Stack>
                      {connectionStatus === 'success' && (
                        <Alert severity="success">{connectionMessage || 'Credentials validated.'}</Alert>
                      )}
                      {connectionStatus === 'error' && <Alert severity="error">{connectionMessage}</Alert>}
                      {error && <Alert severity="error">{error}</Alert>}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Card>
                  <CardHeader title="Onboarding insights" />
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        1. Validate credentials ⟶ 2. Save instance ⟶ 3. Launch initial sync. The copilot automatically fetches controls,
                        risks, and compliance requirements.
                      </Typography>
                      <Divider />
                      <Stack spacing={1}>
                        <Typography variant="subtitle1">Sync summary</Typography>
                        {syncing && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Extracting ServiceNow data...</Typography>
                          </Box>
                        )}
                        {!syncing && Object.keys(syncSummary).length > 0 && (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {Object.entries(syncSummary).map(([key, value]) => (
                              <Chip key={key} label={`${key}: ${value}`} color="primary" variant="outlined" />
                            ))}
                          </Stack>
                        )}
                        {!syncing && Object.keys(syncSummary).length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Summary will appear after the first sync
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                {datasets.length > 0 && (
                  <Card>
                    <CardHeader title="Dataset previews" subheader="Recently ingested ServiceNow records" />
                    <CardContent>
                      <Stack spacing={2}>
                        {datasets.map((dataset) => (
                          <Box
                            key={dataset.id}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1px solid rgba(148,163,184,0.4)',
                              backgroundColor: '#f8fafc',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                                {dataset.dataset_type}
                              </Typography>
                              <Chip label={`${dataset.record_count} records`} size="small" />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Last synced {new Date(dataset.last_synced_at).toLocaleString()}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Stack spacing={1}>
                              {dataset.payload.slice(0, 2).map((record, index) => (
                                <Typography key={index} variant="body2" color="text.secondary">
                                  {Object.entries(record)
                                    .slice(0, 2)
                                    .map(([field, value]) => `${field}: ${value}`)
                                    .join(' • ')}
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {createdInstanceId && (
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6">Instance ready</Typography>
                        <Typography variant="body2" color="text.secondary">
                          The connector is active. Manage automations or launch deeper analyses anytime from the copilot console.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                          <Button variant="contained" onClick={() => navigate('/instances')}>
                            Go to instances
                          </Button>
                          <Button variant="outlined" onClick={() => navigate('/analysis/new')}>
                            Run analysis
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
