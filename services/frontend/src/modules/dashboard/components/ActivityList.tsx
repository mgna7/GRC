import { Card, CardContent, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Typography, Stack } from '@mui/material'
import LanIcon from '@mui/icons-material/Lan'
import InsightsIcon from '@mui/icons-material/Insights'
import { ActivityItem } from '../types'

type ActivityListProps = {
  activity: ActivityItem[]
}

const statusColor = {
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes || 1}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export const ActivityList = ({ activity }: ActivityListProps) => (
  <Card>
    <CardHeader title="Recent Activity" subheader="Latest platform updates" />
    <CardContent>
      {activity.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Activity will appear here once you connect an instance or run an analysis.
        </Typography>
      ) : (
        <List disablePadding>
          {activity.map((item) => (
            <ListItem key={item.id} disableGutters sx={{ mb: 1.5 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: item.type === 'instance' ? '#e0f2fe' : '#f3e8ff', color: '#0f172a' }}>
                  {item.type === 'instance' ? <LanIcon /> : <InsightsIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Typography variant="subtitle2">{item.title}</Typography>}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(item.timestamp)}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={statusColor[item.status]}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
)
