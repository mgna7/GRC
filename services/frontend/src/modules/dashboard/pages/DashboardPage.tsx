import {
  Box,
  Stack,
  Typography,
  Button,
  Alert,
  Grid,
  Container,
  Paper,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { LoadingScreen } from '../../../components/common/LoadingScreen'
import { StatsGrid } from '../components/StatsGrid'
import { ActivityList } from '../components/ActivityList'
import { AnalysisOverview } from '../components/AnalysisOverview'
import { useDashboardData } from '../hooks/useDashboardData'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { stats, activity, analyses, loading, error, reload } = useDashboardData()
  const aiHighlights = [
    {
      id: 'risk',
      title: 'Exposure Delta',
      value: `${Math.min(100, stats.pendingItems * 12 || 12)}%`,
      caption: stats.pendingItems ? 'Mitigation sequence in progress' : 'Risk surface stable',
      tone: stats.pendingItems ? 'warning' : 'success',
    },
    {
      id: 'coverage',
      title: 'Control Coverage',
      value: stats.totalAnalyses ? `${Math.min(96, stats.totalAnalyses * 5 + 40)}%` : '48%',
      caption: 'Cross-framework alignment score',
      tone: 'primary',
    },
    {
      id: 'velocity',
      title: 'Automation Velocity',
      value: stats.recentAnalyses ? `${stats.recentAnalyses} / wk` : 'Calibrating',
      caption: stats.recentAnalyses ? 'Model cadence healthy' : 'Start an analysis to train the model',
      tone: 'info',
    },
  ]
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const handleAddInstance = () => navigate('/instances/new')
  const handleRunAnalysis = () => navigate('/analysis/new')
  if (loading) {
    return <LoadingScreen />
  }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1e3a8a 0%, #0f172a 45%, #020617 100%)',
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(120deg, rgba(59,130,246,0.35), rgba(14,165,233,0.25))',
              border: '1px solid rgba(148,163,184,0.3)',
              boxShadow: '0 25px 60px rgba(2,6,23,0.45)',
              color: '#fff',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  <Chip
                    label="AI Copilot Live"
                    color="primary"
                    variant="outlined"
                    sx={{ width: 'fit-content', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}
                  />
                  <Typography variant="h3">
                    {user?.organization_id ? 'Organization cockpit' : 'Welcome to ComplianceIQ'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Real-time visibility into ServiceNow pipelines, GRC automation, and model-driven compliance scoring.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button variant="contained" color="secondary" onClick={handleRunAnalysis}>
                      Launch AI Analysis
                    </Button>
                    <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }} onClick={handleAddInstance}>
                      Connect Instance
                    </Button>
                    <Button variant="text" sx={{ color: 'rgba(255,255,255,0.9)' }} onClick={handleLogout}>
                      Logout
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    background: 'rgba(15,23,42,0.65)',
                    border: '1px solid rgba(148,163,184,0.2)',
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Copilot summary
                    </Typography>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="h4" color="primary.contrastText">
                          {stats.complianceScore || 72}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Compliance posture
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4" color="primary.contrastText">
                          {stats.totalInstances || 1}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Active instances
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ borderColor: 'rgba(148,163,184,0.2)' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Model confidence
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats.complianceScore || 60}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { borderRadius: 5 },
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Monitoring {stats.totalAnalyses || 0} analysis streams across control, risk, and compliance matrices.
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={reload}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        <StatsGrid stats={stats} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <AnalysisOverview analyses={analyses} onRunAnalysis={handleRunAnalysis} />
          </Grid>
          <Grid item xs={12} md={5}>
            <ActivityList activity={activity} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(15,23,42,0.75)',
                border: '1px solid rgba(148,163,184,0.2)',
                color: '#fff',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">AI Signals</Typography>
                {aiHighlights.map((signal) => (
                  <Paper
                    key={signal.id}
                    sx={{
                      p: 2,
                      background: 'rgba(148,163,184,0.12)',
                      borderRadius: 2,
                      border: '1px solid rgba(148,163,184,0.25)',
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <div>
                        <Typography variant="subtitle2" sx={{ color: '#cbd5f5' }}>
                          {signal.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.85)' }}>
                          {signal.caption}
                        </Typography>
                      </div>
                      <Chip
                        label={signal.value}
                        color={signal.tone as any}
                        variant="outlined"
                        sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(248,250,252,0.9)',
                border: '1px solid rgba(226,232,240,0.8)',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h6">Automation Playbook</Typography>
                <Typography variant="body2" color="text.secondary">
                  Adaptive guidance to keep your compliance program ahead.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#eff6ff' }}>
                      <Typography variant="subtitle2">Next action</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review {stats.pendingItems || '0'} pending control tasks across instances.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fefce8' }}>
                      <Typography variant="subtitle2">Sync cadence</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maintain weekly data pulls to keep the AI model current.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ecfccb' }}>
                      <Typography variant="subtitle2">Signal boost</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Launch a cross-instance analysis to surface emerging risks.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" onClick={() => navigate('/instances')}>
                    Open Copilot Console
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/analysis')}>
                    View All Analyses
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
      </Container>
    </Box>
  )
}
