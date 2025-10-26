import { Box, Button, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 6 }}>
    {icon && <Box fontSize={48}>{icon}</Box>}
    <Typography variant="h6">{title}</Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </Stack>
)
