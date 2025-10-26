import { Grid, Paper, Stack, Typography, Box } from '@mui/material'
import LanIcon from '@mui/icons-material/Lan'
import InsightsIcon from '@mui/icons-material/Insights'
import ShieldIcon from '@mui/icons-material/Shield'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import { DashboardStats } from '../types'

type StatsGridProps = {
  stats: DashboardStats
}

const palette = [
  ['#1d4ed8', '#3b82f6'],
  ['#7c3aed', '#a855f7'],
  ['#16a34a', '#22d3ee'],
  ['#f59e0b', '#f97316'],
]

const cards = (stats: DashboardStats) => [
  {
    id: 'instances',
    title: 'ServiceNow Instances',
    value: stats.totalInstances,
    subtitle: `${stats.activeInstances} active`,
    delta: '+2 new this week',
    icon: <LanIcon fontSize="medium" />,
  },
  {
    id: 'analyses',
    title: 'Analyses Run',
    value: stats.totalAnalyses,
    subtitle: `${stats.recentAnalyses} in last 7 days`,
    delta: 'AI coverage expanding',
    icon: <InsightsIcon fontSize="medium" />,
  },
  {
    id: 'compliance',
    title: 'Compliance Score',
    value: `${stats.complianceScore}%`,
    subtitle: 'Signal confidence',
    delta: stats.complianceScore > 85 ? 'Healthy posture' : 'Needs attention',
    icon: <ShieldIcon fontSize="medium" />,
  },
  {
    id: 'pending',
    title: 'Pending Items',
    value: stats.pendingItems,
    subtitle: 'Workflow backlog',
    delta: stats.pendingItems ? 'Prioritize follow-ups' : 'All clear',
    icon: <PendingActionsIcon fontSize="medium" />,
  },
]

export const StatsGrid = ({ stats }: StatsGridProps) => (
  <Grid container spacing={3}>
    {cards(stats).map((card, index) => (
      <Grid item xs={12} sm={6} lg={3} key={card.id}>
        <Paper
          sx={{
            p: 3,
            height: '100%',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${palette[index][0]}, ${palette[index][1]})`,
            boxShadow: '0 25px 40px rgba(15,23,42,0.45)',
            color: '#fff',
          }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
            >
              {card.icon}
            </Box>
            <div>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                {card.title}
              </Typography>
              <Typography variant="h4">{card.value}</Typography>
            </div>
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                {card.subtitle}
              </Typography>
              <Typography variant="subtitle2">{card.delta}</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    ))}
  </Grid>
)
